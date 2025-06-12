import React, { useEffect } from "react";
import styles from "./LoginScreen.styles";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { Button } from "../../../components/ui/Button";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import {
  selectLoading,
  selectError,
} from "../../../redux/selectors/authSelectors";
import { setError, setLoading } from "../../../redux/slices/authSlice";
import * as Device from "expo-device";
import { useAuth } from "../../../hooks/useAuth";

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  useEffect(() => {
    if (error) {
      Alert.alert("Error de Autenticación", error);
      // Limpiar el error después de mostrarlo
      dispatch(setError(null));
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    login().catch((err) => {
      console.error("Login error caught:", err);
      Alert.alert(
        "Error de Autenticación",
        "Ocurrió un error durante el inicio de sesión: " +
        (err instanceof Error ? err.message : "Error desconocido")
      );
    }).finally((() => {
      dispatch(setLoading(false));
    }));
  };

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
            onPress={handleLogin}
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

export default LoginScreen;
