import { User, UserRole } from "src/types/auth";

export interface AuthResponse {
  user: User;
  role: UserRole;
}

// Mock data for authentication
export const getMockAuthResponse = (): AuthResponse => ({
  user: {
    id: "1",
    name: "Sergio Cota",
    email: "test@example.com",
    roles: ["visualizador"],
    // Add other required User properties
  },
  role: "visualizador" as UserRole,
});
