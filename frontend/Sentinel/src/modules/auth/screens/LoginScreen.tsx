import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../hooks/auth/useAuth";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import {
  selectLoading,
  selectError,
} from "../../../redux/selectors/authSelectors";
import { setError, setLoading } from "../../../redux/slices/authSlice";
import * as Device from "expo-device";

const LoginScreen: React.FC = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Error de Autenticación", error);
      // Limpiar el error después de mostrarlo
      dispatch(setError(null));
    }
  }, [error, dispatch]);

  const handleMicrosoftLogin = async () => {
    try {
      console.log("Login button pressed");

      // Establecer un timeout de seguridad para resetear loading después de 15 segundos
      const safetyTimeout = setTimeout(() => {
        dispatch(setLoading(false));
      }, 15000);

      const token = await auth.login();

      // Limpiar el timeout si llegamos aquí
      clearTimeout(safetyTimeout);

      console.log("Login completed, token received:", !!token);

      if (!token) {
        Alert.alert("Información", "No se completó el inicio de sesión");
      }
    } catch (err) {
      console.error("Login error caught:", err);
      // Asegurar que loading se resetea en caso de error
      dispatch(setLoading(false));
      Alert.alert(
        "Error de Autenticación",
        "Ocurrió un error durante el inicio de sesión: " +
          (err instanceof Error ? err.message : "Error desconocido")
      );
    }
  };

  // Usar el estado de carga combinado (Redux + local)
  const isLoading = loading || localLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/SENTINEL_LOGO.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>SENTINEL</Text>
          <Text style={styles.subtitle}>Control y Transparencia</Text>
        </View>

        <View style={styles.formContainer}>
          <Button
            title="Iniciar Sesión con Microsoft"
            onPress={handleMicrosoftLogin}
            loading={isLoading}
            icon="logo-microsoft"
            style={styles.microsoftButton}
          />

          {Platform.OS === "ios" && Device.isDevice && (
            <Text style={styles.infoText}>
              Se abrirá Microsoft para iniciar sesión y luego volverás a la
              aplicación
            </Text>
          )}
        </View>

        <Text style={styles.footer}>© {new Date().getFullYear()} SENTINEL</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0366d6",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 40,
  },
  microsoftButton: {
    backgroundColor: "#0078d4",
    marginBottom: 16,
  },
  infoText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginTop: 12,
  },
  footer: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: "auto",
  },
});

export default LoginScreen;
