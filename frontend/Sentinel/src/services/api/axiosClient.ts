import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "../../redux/store";
import { logout } from "../../redux/slices/authSlice";

// URL base de la API
const API_URL = "http://127.0.0.1:8000/api/"; // Cambiar según entorno

// Crear cliente axios con configuración base
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para AÑADIR TOKEN A LAS PETICIONES
// Este interceptor se ejecuta antes de cada petición
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Obtener token de storage
    const token = await AsyncStorage.getItem("token");

    // Si hay token, añadirlo a los headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Manejar errores de autenticación (401)
    if (error.response?.status === 401) {
      // Limpiar token y dirigir a login
      await AsyncStorage.removeItem("token");
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
