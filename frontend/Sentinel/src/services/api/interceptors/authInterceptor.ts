import { AxiosInstance } from "axios";
import { store } from "../../../redux/store";
import { logout } from "../../../redux/slices/authSlice";
import { deleteToken } from "src/utils/auth";

export const applyAuthInterceptors = (apiClient: AxiosInstance): void => {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Verificar si el error es 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        // Limpiar token y cerrar sesión
        await deleteToken();
        store.dispatch(logout());
      }

      return Promise.reject(error);
    }
  );
};
