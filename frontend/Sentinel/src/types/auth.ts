import { AuthSessionResult } from "expo-auth-session";

export interface AuthProvider {
  login: () => Promise<string | null>;
  handleAuthResponse: (response: AuthSessionResult) => Promise<string | null>;
  enabled: boolean;
  logout: () => Promise<void>;
}

export interface AuthProviderConfig {
  tenantId?: string;
  clientId: string;
  scopes: string[];
  scheme: string;
  path: string;
}

export interface AuthConfig {
  activeProvider: string;
  providers: {
    [key: string]: AuthProviderConfig;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export type UserRole =
  | "ADMIN"
  | "DESARROLLADOR"
  | "CONTRATISTA"
  | "INVERSIONISTA"
  | "INSPECTOR";
