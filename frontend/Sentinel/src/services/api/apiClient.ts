import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { InternalAxiosRequestConfig } from "axios";
import { getTokenResponse } from "src/utils/auth";

// Get API URL from Expo config
const API_URL = Constants.expoConfig?.extra?.apiUrl;
export const isDevelopment =
  Constants.expoConfig?.extra?.environment === "development";

// Log the configured URL
console.log("API URL from Expo config:", API_URL);

// Safety check - use a fallback if API_URL is somehow undefined
const baseURL = API_URL || "http://localhost:8000/api/";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

// Interceptor to add token to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (isDevelopment) {
      console.log(`Making request to: ${config.baseURL}${config.url}`);
    }

    const token = await getTokenResponse();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token?.accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor to handle responses
apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`Successful response from: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error("Network error - No response:", {
        request: error.request._url || error.config?.url,
      });
    } else {
      console.error("Request configuration error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
