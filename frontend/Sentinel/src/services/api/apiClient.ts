import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTokenResponse } from "src/utils/auth";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const createClientWithInterceptors = (baseUrl: string) => {
  const client = axios.create({
    baseURL: baseUrl,
  });

  // addTokenToRequestsInterceptor();
  // responseHandlerInterceptor();

  return client;
};
import { API_CONFIG, isDevelopment } from "./config";

const apiClient = createClientWithInterceptors(API_CONFIG.baseURL);

// Interceptor to add token to requests
const addTokenToRequestsInterceptor = () =>
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
const responseHandlerInterceptor = () =>
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

// Create a custom API error class
export class ApiError extends Error {
  status?: number;
  originalError: unknown;

  constructor(message: string, originalError: unknown, status?: number) {
    super(message);
    this.name = "ApiError";
    this.originalError = originalError;
    this.status = status;
  }
}

export const handleGlobalApiError = (
  error: unknown,
  defaultMessage: string
): never => {
  console.error(defaultMessage, error);

  // Get the appropriate error message
  let errorMessage = defaultMessage;
  let statusCode: number | undefined;

  if (error instanceof AxiosError) {
    statusCode = error.response?.status;

    // Try to extract API error message if available
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;

      // Handle special case
    }
  }

  throw new ApiError(errorMessage, error, statusCode);
};

const makeApiRequest = async <T>(
  client: AxiosInstance,
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  options?: {
    headers?: unknown;
    excludeAuth?: boolean;
  }
): Promise<T> => {
  if (options?.headers) {
    Object.assign(client.defaults.headers, options.headers);
  }

  if (options?.excludeAuth) {
    delete client.defaults.headers.Authorization;
  }

  const response = await client[method]<T>(url, data);
  return response.data;
};

export const apiRequest = async <T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  errorMessage?: string,
  data?: unknown,
  options?: {
    headers?: unknown;
  }
): Promise<T> => {
  try {
    return await makeApiRequest(apiClient, method, url, data, options);
  } catch (error) {
    const defaultErrorMsg = `Failed to ${method} data`;
    const errorMsg = errorMessage || defaultErrorMsg;

    handleGlobalApiError(error, errorMsg);

    // TypeScript needs this line to satisfy the return type,
    // but it will never be reached because handleGlobalApiError throws
    throw error;
  }
};

export const apiRequestWithBaseUrl = async <T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  baseUrl: string,
  data?: unknown,
  options?: {
    headers?: unknown;
  }
): Promise<T> => {
  const customClient = createClientWithInterceptors(baseUrl);
  return makeApiRequest(customClient, method, "", data, options);
};

export default apiClient;
