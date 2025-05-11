// src/hooks/auth/useAzureAuth.ts
import * as AuthSession from "expo-auth-session";
import { useAppDispatch } from "../../redux/hooks";
import Constants from "expo-constants";
import {
  setCredentials,
  setLoading,
  setError,
} from "../../redux/slices/authSlice";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { AuthProvider, AuthProviderConfig } from "../../types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Definición de tipo para el estado de depuración
interface DebugState {
  discovery?: any;
  redirectUri?: string;
  requestReady?: boolean;
  response?: any;
  [key: string]: any;
}

export const useAzureAuth = (
  config: AuthProviderConfig,
  enabled: boolean = false
): AuthProvider => {
  const dispatch = useAppDispatch();
  // Usamos useRef para debugState para evitar renders adicionales
  const debugStateRef = useRef<DebugState>({});
  const [discovery, setDiscovery] =
    useState<AuthSession.DiscoveryDocument | null>(null);
  const [request, setRequest] = useState<AuthSession.AuthRequest | null>(null);
  const [response, setResponse] =
    useState<AuthSession.AuthSessionResult | null>(null);

  // Evitar re-renders con configuración inicial
  const isInitializedRef = useRef(false);
  const alreadyProcessedRef = useRef(false);

  // Variables constantes - NO las guardes en estado
  const tenantId = config.tenantId;
  const clientId = config.clientId;
  const discoveryUrl = useMemo(
    () =>
      enabled && tenantId
        ? `https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`
        : null,
    [enabled, tenantId]
  );

  const redirectUri = useMemo(() => {
    // Si estás en desarrollo con Expo Go, usa el proxy de Expo
    if (Constants.appOwnership === "expo") {
      return AuthSession.makeRedirectUri({
        scheme: config.scheme,
        path: config.path,
      });
    }

    // En apps nativas publicadas, construye la URI manualmente
    return `${config.scheme}:///${config.path}`;
  }, [config.scheme, config.path]);

  // Mostrar configuración al inicio - SOLO UNA VEZ
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log("=== Auth Config ===");
    console.log("Enabled:", enabled);
    console.log("TenantId:", config.tenantId);
    console.log("ClientId:", config.clientId);
    console.log("Scheme:", config.scheme);
    console.log("Path:", config.path);
    console.log("===================");

    console.log("Discovery URL:", discoveryUrl);
    console.log("Redirect URI:", redirectUri);
    console.log(
      "IMPORTANTE: Para desarrollo con Expo Go, debe registrar esta URI exacta en Azure:"
    );
    console.log(`Versión de desarrollo: ${redirectUri}`);
    console.log(`Versión de producción: ${config.scheme}://${config.path}`);

    // Almacenar en ref, no en estado para evitar re-renders
    debugStateRef.current = {
      redirectUri,
      discoveryUrl,
    };
  }, [config, enabled, discoveryUrl, redirectUri]);

  // Obtener discovery document
  useEffect(() => {
    if (!discoveryUrl || discovery) return; // Evitar múltiples fetches

    const fetchDiscovery = async () => {
      try {
        console.log("Fetching discovery document manually from:", discoveryUrl);
        const response = await fetch(discoveryUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Verificar datos esenciales
        if (!data.authorization_endpoint || !data.token_endpoint) {
          throw new Error("Discovery document missing required endpoints");
        }

        // Crear documento de descubrimiento
        const discoveryDoc: AuthSession.DiscoveryDocument = {
          authorizationEndpoint: data.authorization_endpoint,
          tokenEndpoint: data.token_endpoint,
          revocationEndpoint: data.revocation_endpoint,
          endSessionEndpoint: data.end_session_endpoint,
          registrationEndpoint: data.registration_endpoint,
          userInfoEndpoint: data.userinfo_endpoint || data.userinfo_endpoint,
          jwksUri: data.jwks_uri,
        } as AuthSession.DiscoveryDocument;

        console.log("Discovery document fetched successfully");
        setDiscovery(discoveryDoc);
        // Usar la ref en lugar de actualizar el estado
        debugStateRef.current = {
          ...debugStateRef.current,
          discovery: discoveryDoc,
        };
      } catch (error) {
        console.error("Error fetching discovery document:", error);
      }
    };

    fetchDiscovery();
  }, [discoveryUrl, discovery]);

  // Log cuando cambia discovery - Sin actualizar estados
  useEffect(() => {
    if (discovery) {
      console.log(
        "Discovery state changed:",
        discovery ? "Available" : "Not available"
      );
    }
  }, [discovery]);

  // Crear request cuando discovery esté disponible - Solo una vez
  useEffect(() => {
    if (!discovery || !enabled || request) return;

    try {
      console.log("Creating auth request with discovery");
      const newRequest = new AuthSession.AuthRequest({
        clientId,
        scopes: config.scopes,
        redirectUri,
      });

      setRequest(newRequest);
      console.log("Auth request created successfully");
      debugStateRef.current = { ...debugStateRef.current, requestReady: true };
    } catch (error) {
      console.error("Error creating auth request:", error);
    }
  }, [discovery, enabled, clientId, redirectUri, config.scopes, request]);

  // Log cuando cambia el request - Sin actualizar estados
  useEffect(() => {
    console.log(
      "Request state changed:",
      request ? "Request ready" : "Request not ready"
    );
  }, [request]);

  // Función para mostrar el inicio de sesión
  const promptAsync =
    useCallback(async (): Promise<AuthSession.AuthSessionResult> => {
      if (!request || !discovery) {
        throw new Error("Auth request or discovery not ready");
      }

      console.log("Prompting for authentication");
      try {
        const result = await request.promptAsync(discovery);
        setResponse(result);
        return result;
      } catch (error) {
        console.error("Error during prompt:", error);
        throw error;
      }
    }, [request, discovery]);

  // Log cuando cambia response - Sin actualizar estados
  useEffect(() => {
    if (response) {
      console.log("Response state changed:", response.type);
      debugStateRef.current = { ...debugStateRef.current, response };
    }
  }, [response]);

  const handleAuthResponse = useCallback(
    async (
      authResponse: AuthSession.AuthSessionResult
    ): Promise<string | null> => {
      console.log("Handling auth response:", authResponse.type);

      if (!enabled) {
        console.log("Auth provider not enabled");
        return null;
      }

      if (authResponse.type === "success" && discovery) {
        const { code } = authResponse.params;
        console.log("Authorization code received");

        try {
          console.log("Exchanging code for token...");
          const tokenResponse = await AuthSession.exchangeCodeAsync(
            {
              clientId,
              code,
              extraParams: request?.codeVerifier
                ? { code_verifier: request.codeVerifier }
                : undefined,
              redirectUri,
            },
            discovery
          );

          console.log("Token received successfully");
          const accessToken = tokenResponse.accessToken;
          await AsyncStorage.setItem("token", accessToken);

          try {
            // Decodificación simple para debugging - no es seguro en producción
            console.log("Decoding token...");
            const payload = decodeToken(accessToken);
            console.log("Token payload:", JSON.stringify(payload, null, 2));

            dispatch(
              setCredentials({
                token: accessToken,
                user: {
                  id: payload.oid || payload.sub || "unknown",
                  email:
                    payload.email || payload.preferred_username || "unknown",
                  name: payload.name || "Usuario",
                  roles: payload.roles || ["CONTRATISTA"],
                },
                role: (payload.roles && payload.roles[0]) || "CONTRATISTA",
              })
            );

            return accessToken;
          } catch (decodeError) {
            console.error("Error decoding token:", decodeError);
            // Usar un enfoque más simple si falla la decodificación
            dispatch(
              setCredentials({
                token: accessToken,
                user: {
                  id: "user-id",
                  email: "usuario@example.com",
                  name: "Usuario Autenticado",
                  roles: ["CONTRATISTA"],
                },
                role: "CONTRATISTA",
              })
            );
            return accessToken;
          }
        } catch (error: any) {
          console.error("Error exchanging code for token:", error);
          dispatch(
            setError(
              "Error al obtener el token: " +
                (error.message || "Error desconocido")
            )
          );
          return null;
        }
      } else {
        console.log("Auth response not successful:", authResponse.type);
        if (authResponse.type === "error") {
          console.error("Auth error:", authResponse.error);
        }
        return null;
      }
    },
    [enabled, discovery, dispatch, clientId, redirectUri, request?.codeVerifier]
  );

  // Procesar respuesta automáticamente - Con verificación para evitar ciclos
  useEffect(() => {
    if (!enabled || !response || response.type !== "success") return;
    if (alreadyProcessedRef.current) return;

    alreadyProcessedRef.current = true;

    console.log("Processing automatic response", response.type);
    handleAuthResponse(response).then((token) => {
      console.log("Auto response processed, token received:", !!token);
    });
  }, [response, enabled, handleAuthResponse]);

  const login = async (): Promise<string | null> => {
    console.log("=== Login started ===");
    console.log("Debug state:", debugStateRef.current);

    if (!enabled) {
      console.warn("Azure auth provider is not enabled");
      return null;
    }

    dispatch(setLoading(true));
    console.log("Loading state set to true");

    // Para desarrollo, podemos implementar un login simulado
    if (__DEV__ && !discovery) {
      console.log("DEV MODE: Simulating successful login");

      // Simular un retraso
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Crear un token falso
      const fakeToken = "dev_token_" + Date.now();

      // Configurar estado de autenticación
      dispatch(
        setCredentials({
          token: fakeToken,
          user: {
            id: "dev_user",
            email: "dev@example.com",
            name: "Developer",
            roles: ["CONTRATISTA"],
          },
          role: "CONTRATISTA",
        })
      );

      dispatch(setLoading(false));
      return fakeToken;
    }

    // Verificar que tenemos lo necesario para la autenticación
    if (!discovery) {
      console.error("Discovery document not available");
      dispatch(setLoading(false));
      dispatch(
        setError("No se pudo conectar con el servidor de autenticación")
      );
      return null;
    }

    if (!request) {
      console.error("Discovery aún no está listo");
      dispatch(setLoading(false));
      dispatch(setError("La solicitud de autenticación no está lista"));
      return null;
    }

    try {
      console.log("Launching auth prompt with:", {
        clientId,
        scopes: config.scopes,
        redirectUri,
        discoveryLoaded: !!discovery,
      });

      let timeoutId: NodeJS.Timeout | null = null;

      // Configurar un timeout para evitar espera infinita
      const promptPromise = new Promise<AuthSession.AuthSessionResult>(
        async (resolve, reject) => {
          try {
            // Set timeout for 30 seconds (más tiempo para desarrollo)
            timeoutId = setTimeout(() => {
              reject(new Error("Auth prompt timed out after 30 seconds"));
            }, 30000);

            // Launch the prompt
            const result = await promptAsync();
            if (timeoutId) clearTimeout(timeoutId);
            resolve(result);
          } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);
            reject(error);
          }
        }
      );

      const result = await promptPromise;
      console.log("Auth prompt result:", result.type);

      if (result.type === "success") {
        const token = await handleAuthResponse(result);
        dispatch(setLoading(false));
        return token;
      } else {
        console.log("Auth was not successful:", result.type);
        dispatch(setLoading(false));
        dispatch(
          setError(
            `La autenticación ${
              result.type === "cancel" ? "fue cancelada" : "falló"
            }`
          )
        );
        return null;
      }
    } catch (error: any) {
      console.error("Error during login process:", error);
      dispatch(setLoading(false));
      dispatch(
        setError(
          "Error en el proceso de inicio de sesión: " +
            (error.message || "Error desconocido")
        )
      );
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    console.log("Logging out");
    await AsyncStorage.removeItem("token");
    dispatch(
      setCredentials({
        token: null,
        role: null,
        user: null,
      })
    );
  };

  // Función auxiliar para decodificar token JWT
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Token decode error:", e);
      throw e;
    }
  };

  return {
    login,
    handleAuthResponse,
    enabled,
    logout,
  };
};
