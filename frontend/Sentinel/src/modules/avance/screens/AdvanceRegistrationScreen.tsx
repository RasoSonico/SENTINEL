import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import AdvanceForm from "../forms/AdvanceForm";
import { AvanceStackParamList } from "../../../navigation/types";
import { useAppDispatch } from "../../../redux/hooks";
import {
  setOnlineStatus,
  clearCurrentAdvance,
} from "../../../redux/slices/avance/advanceSlice";

type AdvanceRegistrationScreenRouteProp = RouteProp<
  AvanceStackParamList,
  "AvanceRegistration"
>;

type AdvanceRegistrationScreenNavigationProp = StackNavigationProp<
  AvanceStackParamList,
  "AvanceRegistration"
>;

const AdvanceRegistrationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<AdvanceRegistrationScreenNavigationProp>();
  const route = useRoute<AdvanceRegistrationScreenRouteProp>();

  // Código para debuggear
  console.log("route:", route);
  console.log("route.params:", route.params);

  const constructionId =
    route.params?.constructionId || "default-construction-id";
  const constructionName = route.params?.constructionName || "Obra sin nombre";
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configurar el título de la pantalla
  useEffect(() => {
    navigation.setOptions({
      title: "Registrar avance",
      headerTitleAlign: "center",
      headerRight: () => (
        <Ionicons
          name="help-circle-outline"
          size={24}
          color="#3498db"
          style={{ marginRight: 16 }}
          onPress={showHelp}
        />
      ),
    });
  }, [navigation]);

  // Monitorear estado de conectividad
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected =
        state.isConnected !== false && state.isInternetReachable !== false;
      dispatch(setOnlineStatus(isConnected));
    });

    // Inicializar
    NetInfo.fetch().then((state) => {
      const isConnected =
        state.isConnected !== false && state.isInternetReachable !== false;
      dispatch(setOnlineStatus(isConnected));
      setIsLoading(false);
    });

    // Limpiar al desmontar
    return () => {
      unsubscribe();
      dispatch(clearCurrentAdvance());
    };
  }, [dispatch]);

  // Mostrar ayuda
  const showHelp = () => {
    Alert.alert(
      "Ayuda - Registro de avances",
      "Esta pantalla te permite registrar avances en conceptos de obra. " +
        "Para registrar un avance, sigue estos pasos:\n\n" +
        "1. Selecciona el concepto que deseas reportar\n" +
        "2. Ingresa la cantidad ejecutada\n" +
        "3. Toma al menos una foto como evidencia\n" +
        "4. Añade notas si es necesario\n" +
        '5. Presiona "Registrar avance"\n\n' +
        "Si estás sin conexión, el avance se guardará localmente y se sincronizará automáticamente cuando recuperes la conexión.",
      [{ text: "Entendido", style: "default" }]
    );
  };

  // Manejar éxito al registrar avance
  const handleAdvanceSuccess = () => {
    // Podríamos navegar a otra pantalla o mostrar un mensaje
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.constructionName}>{constructionName}</Text>
          <Text style={styles.headerDescription}>
            Registra los avances diarios para mantener actualizados los reportes
            de progreso.
          </Text>
        </View>

        <AdvanceForm
          constructionId={constructionId}
          onSuccess={handleAdvanceSuccess}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  constructionName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
});

export default AdvanceRegistrationScreen;
