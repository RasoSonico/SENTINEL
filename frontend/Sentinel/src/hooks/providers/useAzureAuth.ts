import * as AuthSession from "expo-auth-session";
import { useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";
import { setToken } from "../../redux/slices/authSlice";
import { AuthProvider, AuthProviderConfig } from "src/types/auth";

export const useAzureAuth = (
  config: AuthProviderConfig,
  enabled: boolean = false
): AuthProvider => {
  const dispatch = useDispatch();

  const tenantId = config.tenantId;
  const clientId = config.clientId;
  const discoveryUrl =
    enabled && tenantId
      ? `https://login.microsoftonline.com/${tenantId}/v2.0`
      : null;
  const discovery = AuthSession.useAutoDiscovery(discoveryUrl || "");

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: config.scheme,
    path: config.path,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: config.scopes,
      redirectUri,
    },
    discovery
  );

  const handleAuthResponse = useCallback(
    async (response: AuthSession.AuthSessionResult): Promise<string | null> => {
      if (!enabled) return null;

      if (response.type === "success" && discovery) {
        const { code } = response.params;
        console.log("Authorization code:", code);

        try {
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

          const accessToken = tokenResponse.accessToken;
          dispatch(setToken(accessToken));
          console.log("Access token:", accessToken);
          return accessToken;
        } catch (error) {
          console.error("Error exchanging code for tokens:", error);
          return null;
        }
      }
      return null;
    },
    [enabled, discovery, dispatch, clientId, redirectUri, request?.codeVerifier]
  );

  useEffect(() => {
    if (enabled && response?.type === "success") {
      handleAuthResponse(response);
    }
  }, [response, enabled, handleAuthResponse]);

  const login = async (): Promise<string | null> => {
    if (!enabled) {
      console.warn("Azure auth provider is not enabled");
      return null;
    }

    console.group("Azure Login");
    console.log("Starting Azure login process...");

    if (request) {
      const result = await promptAsync();
      console.log("Result:", result);
      if (result.type === "success") {
        return await handleAuthResponse(result);
      } else {
        console.error("Authentication failed or was canceled.");
        return null;
      }
    } else {
      console.error("Authentication request is not ready yet.");
      return null;
    }
  };

  return {
    login,
    handleAuthResponse,
    enabled,
  };
};
