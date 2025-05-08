import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "../redux/store";
import { setCredentials } from "../redux/slices/authSlice";

// Función para verificar el token guardado al iniciar la app
export const initializeAuthState = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      // Decodificar el token para obtener la información del usuario
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        const payload = JSON.parse(jsonPayload);

        // Verificar si el token no ha expirado
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          // Token expirado, limpiar
          await AsyncStorage.removeItem("token");
          return;
        }

        // Actualizar el estado de Redux
        store.dispatch(
          setCredentials({
            token,
            user: {
              id: payload.oid || payload.sub,
              email: payload.email || payload.preferred_username,
              name: payload.name || payload.preferred_username?.split("@")[0],
              roles: payload.roles || ["CONTRATISTA"], // Default role
            },
            role: (payload.roles && payload.roles[0]) || "CONTRATISTA", // Default role
          })
        );
      } catch (error) {
        console.error("Error decodificando el token:", error);
        await AsyncStorage.removeItem("token");
      }
    }
  } catch (error) {
    console.error("Error al inicializar el estado de autenticación:", error);
  }
};
