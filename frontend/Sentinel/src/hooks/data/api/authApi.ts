import { AuthResponse, getMockAuthResponse } from "src/services/api/mockData";
import apiClient from "../../../services/api/apiClient";
import { applyAuthInterceptors } from "../../../services/api/interceptors/authInterceptor";

// Apply auth-specific interceptors
applyAuthInterceptors(apiClient);

export const authMe = async (): Promise<AuthResponse> => {
  try {
    // const response = await apiClient.get<AuthResponse>("/auth/me");
    // Create a mock response for testing purposes

    return getMockAuthResponse();
  } catch (error) {
    console.error("Error authenticating user:", error);
    throw new Error("Authentication failed");
  }
};
