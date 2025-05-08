import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text } from "react-native";
import { store, persistor } from "./src/redux/store";
import { RootNavigator } from "./src/navigation/RootNagivator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCredentials } from "./src/redux/slices/authSlice";
import * as SplashScreen from "expo-splash-screen";

// Mantener la pantalla de splash visible mientras se inicializa la app
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Verificar si hay token almacenado
        const token = await AsyncStorage.getItem("token");

        if (token) {
          // Decodificar el token JWT para obtener la información del usuario
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

            // Verificar si el token ha expirado
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
              // Token expirado, eliminar
              await AsyncStorage.removeItem("token");
            } else {
              // Token válido, restaurar estado de autenticación
              store.dispatch(
                setCredentials({
                  token,
                  user: {
                    id: payload.oid || payload.sub,
                    email: payload.email || payload.preferred_username,
                    name:
                      payload.name || payload.preferred_username?.split("@")[0],
                    roles: payload.roles || ["CONTRATISTA"], // Rol predeterminado
                  },
                  role: (payload.roles && payload.roles[0]) || "CONTRATISTA",
                })
              );
            }
          } catch (error) {
            console.error("Error decodificando token:", error);
            // Si hay error al decodificar, eliminar el token
            await AsyncStorage.removeItem("token");
          }
        }
      } catch (e) {
        console.warn("Error al inicializar la app:", e);
      } finally {
        // Marcar la app como lista
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Ocultar la pantalla de splash cuando todo esté listo
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // No renderizamos nada mientras SplashScreen está visible
  }

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#0366d6" />
            <Text style={{ marginTop: 12, color: "#666" }}>Cargando...</Text>
          </View>
        }
        persistor={persistor}
      >
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
