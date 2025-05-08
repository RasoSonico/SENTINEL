import { useCallback } from "react";
import { useAzureAuth } from "./useAzureAuth";
import { AuthProvider } from "../../types/auth";

export const useAuth = (): AuthProvider => {
  // CONFIGURACIÓN DIRECTA - sin usar variables de entorno
  // Reemplazar estos valores con los proporcionados por Microsoft
  const hardcodedConfig = {
    activeProvider: "azure",
    providers: {
      azure: {
        // Hardcoded values for testing
        tenantId: "2c20d78c-5383-4c24-8aa5-29bfa6fa8ae2", // Reemplaza con tu ID real
        clientId: "04c59944-1089-44dd-9a92-da7a05e0881d", // Reemplaza con tu ID real
        scopes: ["openid", "profile", "email", "offline_access"],
        scheme: "sentinel",
        path: "auth",
      },
    },
  };

  const activeProvider = hardcodedConfig.activeProvider;
  const providerConfig = hardcodedConfig.providers.azure;

  // Proveedor de Azure
  const azureAuth = useAzureAuth(providerConfig, activeProvider === "azure");

  if (activeProvider === "azure") {
    return azureAuth;
  }

  // Proveedor no soportado
  return {
    login: async () => {
      console.error(
        `Proveedor de autenticación "${activeProvider}" no soportado`
      );
      return null;
    },
    handleAuthResponse: async () => null,
    enabled: false,
    logout: async () => {
      console.log("Logout not implemented for unknown provider");
    },
  };
};
