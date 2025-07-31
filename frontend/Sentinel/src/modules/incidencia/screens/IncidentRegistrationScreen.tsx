import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import {
  selectIncidentCatalogs,
  selectNewIncident,
  fetchIncidentTypes,
  fetchIncidentClassifications,
  createNewIncident,
  clearNewIncident,
  clearNewIncidentError,
} from "../../../redux/slices/incidencia/incidenciaSlice";
import {
  setTypesById,
  setClassificationsById,
} from "../../../redux/slices/incidencia/incidenciaFormDataSlice";
import { useCreateIncidentMutation } from "../../../hooks/data/query/useIncidenciaQueries";
import { IncidentRegistrationScreenNavigationProp } from "../../../navigation/types";
import IncidentForm from "../forms/IncidentForm";
import { CreateIncident } from "../../../types/incidencia";
import { incidentFormDefaultValues } from "../forms/util/incidentFormValidation";
import styles from "../styles/IncidentRegistrationScreen.styles";

const IncidentRegistrationScreen: React.FC = () => {
  const navigation = useNavigation<IncidentRegistrationScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Estados de Redux
  const catalogs = useAppSelector(selectIncidentCatalogs);
  const newIncident = useAppSelector(selectNewIncident);

  // Mutation de React Query como alternativa
  const createIncidentMutation = useCreateIncidentMutation();

  // Estado local del formulario
  const [formData, setFormData] = useState<CreateIncident>({
    type: incidentFormDefaultValues.type,
    clasification: incidentFormDefaultValues.clasification,
    description: incidentFormDefaultValues.description,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogs = async () => {
      if (catalogs.types.items.length === 0) {
        const typesResult = await dispatch(fetchIncidentTypes());
        if (fetchIncidentTypes.fulfilled.match(typesResult)) {
          dispatch(setTypesById(typesResult.payload));
        }
      }

      if (catalogs.classifications.items.length === 0) {
        const classificationsResult = await dispatch(
          fetchIncidentClassifications()
        );
        if (
          fetchIncidentClassifications.fulfilled.match(classificationsResult)
        ) {
          dispatch(setClassificationsById(classificationsResult.payload));
        }
      }
    };

    loadCatalogs();
  }, [
    dispatch,
    catalogs.types.items.length,
    catalogs.classifications.items.length,
  ]);

  // Manejar éxito de creación
  useEffect(() => {
    if (newIncident.success) {
      Alert.alert(
        "Incidencia Registrada",
        "La incidencia ha sido registrada exitosamente.",
        [
          {
            text: "OK",
            onPress: () => {
              dispatch(clearNewIncident());
              navigation.goBack();
            },
          },
        ]
      );
    }
  }, [newIncident.success, dispatch, navigation]);

  // Manejar errores
  useEffect(() => {
    if (newIncident.error) {
      Alert.alert("Error", newIncident.error, [
        {
          text: "OK",
          onPress: () => dispatch(clearNewIncidentError()),
        },
      ]);
    }
  }, [newIncident.error, dispatch]);

  // Función para manejar el envío del formulario usando Redux
  const handleSubmitWithRedux = async (data: CreateIncident) => {
    setIsSubmitting(true);
    try {
      await dispatch(createNewIncident(data));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar el envío del formulario usando React Query
  const handleSubmitWithQuery = async (data: CreateIncident) => {
    setIsSubmitting(true);
    try {
      await createIncidentMutation.mutateAsync(data);
      Alert.alert(
        "Incidencia Registrada",
        "La incidencia ha sido registrada exitosamente.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un error al registrar la incidencia. Inténtelo de nuevo.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función principal de envío (usando React Query por defecto)
  const handleSubmit = async (data: CreateIncident) => {
    await handleSubmitWithQuery(data);
  };

  // Función para manejar la cancelación
  const handleCancel = () => {
    Alert.alert(
      "Cancelar Registro",
      "¿Está seguro que desea cancelar el registro de la incidencia? Se perderán los datos ingresados.",
      [
        {
          text: "Continuar Editando",
          style: "cancel",
        },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => {
            dispatch(clearNewIncident());
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Loading de catálogos
  if (catalogs.types.loading || catalogs.classifications.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando formulario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error de catálogos
  if (catalogs.types.error || catalogs.classifications.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Error al cargar el formulario</Text>
          <Text style={styles.errorMessage}>
            {catalogs.types.error || catalogs.classifications.error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Incidencia</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Form */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <IncidentForm
            initialData={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || newIncident.loading}
            onCancel={handleCancel}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default IncidentRegistrationScreen;
