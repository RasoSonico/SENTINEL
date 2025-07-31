import React, { useEffect, useState } from "react";
import styles from "./LoginScreen.styles";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Button } from "../../../components/ui/Button";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import { selectError } from "../../../redux/selectors/authSelectors";
import { setError } from "../../../redux/slices/authSlice";
import * as Device from "expo-device";
import { useAuth } from "../../../hooks/useAuth";
import ServerErrorModal from "src/components/ServerErrorModal";

const LoginScreen: React.FC = () => {
  const { login, isAuthUserError, isAuthUserPending, authUserError } =
    useAuth();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const [serverErrorVisible, setServerErrorVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Use dedicated login loading state
  const isLoading = isLoggingIn;

  useEffect(() => {
    if (
      isAuthUserError &&
      typeof authUserError === "object" &&
      authUserError !== null &&
      "status" in authUserError &&
      (authUserError as any).status === 500
    ) {
      setServerErrorVisible(true);
    }
  }, [isAuthUserError, authUserError]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error de Autenticación", error);
      dispatch(setError(null));
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    if (isLoading) return;

    setIsLoggingIn(true);
    console.log("Starting login process...");

    try {
      await login();
      console.log("Login completed successfully");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";

      Alert.alert(
        "Error de Autenticación",
        `Ocurrió un error durante el inicio de sesión: ${errorMessage}`
      );

      dispatch(setError(errorMessage));
    } finally {
      setIsLoggingIn(false);
      console.log("Login process finished");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ServerErrorModal
        visible={serverErrorVisible}
        onClose={() => setServerErrorVisible(false)}
      />
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
