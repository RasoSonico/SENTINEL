import { AxiosError } from "axios";
import apiClient from "../../../services/api/apiClient";
import { User } from "src/types/auth";

export const authMe = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>("/api/usuarios/me");
    return response.data;
  } catch (error) {
    console.log("authMe | Error fetching user data:", error);
    // Normalize error for React Query consumers
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      if (status === 500) {
        throw {
          message: "Internal server error. Please try again later.",
          status: 500,
          data: axiosError.response?.data,
          isAxiosError: true,
        };
      }
      throw {
        message: axiosError.message,
        status,
        data: axiosError.response?.data,
        isAxiosError: true,
      };
    }
    // Fallback for non-Axios errors
    throw {
      message: (error as Error)?.message || "Unknown error",
      status: undefined,
      data: undefined,
      isAxiosError: false,
    };
  }
};
