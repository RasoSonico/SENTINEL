import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConceptSelector from "./ConceptSelector";
import PhotoCapture from "./PhotoCapture";
import ProgramStatusBadge from "./ProgramStatusBadge";
import OfflineIndicator from "./OfflineIndicator";
import { Concept } from "../../../types/entities";
import { usePhotoCapture } from "../../../hooks/avance/usePhotoCapture";
import { useGeolocation } from "../../../hooks/avance/useGeolocation";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setCurrentAdvanceData,
  setCurrentAdvancePhotos,
  registerAdvance,
  selectCurrentAdvance,
  selectOfflineSync,
  // Añadir un selector para obtener los avances físicos si existe
  // selectPhysicalAdvances,
} from "../../../redux/slices/advanceSlice";

interface AdvanceFormProps {
  constructionId: string;
  onSuccess?: () => void;
}

const AdvanceForm: React.FC<AdvanceFormProps> = ({
  constructionId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const currentAdvance = useAppSelector(selectCurrentAdvance);
  const offlineSyncState = useAppSelector(selectOfflineSync);

  // Si tienes un estado para los avances físicos, podemos usarlo
  // const physicalAdvances = useAppSelector(selectPhysicalAdvances);

  // Estado local para el formulario
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasLocationError, setHasLocationError] = useState<boolean>(false);

  // Añadir estado para la cantidad ya ejecutada
  const [executedQuantity, setExecutedQuantity] = useState<number>(0);

  // Estados de validación
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [formIsValid, setFormIsValid] = useState<boolean>(false);

  // Hooks personalizados
  const {
    photos,
    loading: loadingPhotos,
    takePhoto,
    pickImage,
    removePhoto,
  } = usePhotoCapture({
    maxPhotos: 5,
    includeLocation: true,
  });

  const {
    location,
    loading: loadingLocation,
    getCurrentLocation,
  } = useGeolocation({
    requestPermissionOnMount: true,
  });

  // Efecto para cargar la cantidad ejecutada cuando se selecciona un concepto
  useEffect(() => {
    if (selectedConcept) {
      // Aquí deberíamos cargar la cantidad ya ejecutada para este concepto
      // De manera temporal, lo inicializamos en 0
      // En una implementación real, haríamos una llamada a la API o usaríamos datos en redux

      // Ejemplo de API call (reemplazar con tu lógica real):
      // async function loadExecutedQuantity() {
      //   try {
      //     const response = await advanceService.getConceptProgress(selectedConcept.id);
      //     setExecutedQuantity(response.executed_quantity || 0);
      //   } catch (error) {
      //     console.error('Error al cargar progreso del concepto:', error);
      //     setExecutedQuantity(0);
      //   }
      // }
      // loadExecutedQuantity();

      setExecutedQuantity(0); // Por ahora usamos 0 como valor temporal
    } else {
      setExecutedQuantity(0);
    }
  }, [selectedConcept]);

  // Sincronizar estado del slice con el estado local
  useEffect(() => {
    if (currentAdvance.photos.length > 0) {
      // Si hay fotos en el estado global, usarlas
    } else if (photos.length > 0) {
      // Si hay fotos en el estado local, actualizarlas en el global
      dispatch(setCurrentAdvancePhotos(photos));
    }
  }, [photos, dispatch]);

  // Efecto para validar el formulario
  useEffect(() => {
    const validateForm = () => {
      // Validar concepto
      if (!selectedConcept) {
        setFormIsValid(false);
        return;
      }

      // Validar cantidad
      if (!quantity || parseFloat(quantity) <= 0) {
        setFormIsValid(false);
        return;
      }

      // Validar que la cantidad no exceda lo disponible
      const remainingQuantity = selectedConcept.quantity - executedQuantity;
      if (parseFloat(quantity) > remainingQuantity) {
        setFormIsValid(false);
        return;
      }

      // Validar fotos (al menos una)
      if (photos.length === 0) {
        setFormIsValid(false);
        return;
      }

      // Validar ubicación (opcional, pero mostrar error si falla)
      if (!location && hasLocationError) {
        // Permitimos continuar, pero con advertencia
      }

      // Todo validado
      setFormIsValid(true);
    };

    validateForm();
  }, [
    selectedConcept,
    quantity,
    photos,
    location,
    hasLocationError,
    executedQuantity,
  ]);

  // Efecto para obtener ubicación al montar
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        await getCurrentLocation();
      } catch (error) {
        console.error("Error al obtener ubicación:", error);
        setHasLocationError(true);
      }
    };

    fetchLocation();
  }, []);

  // Manejar selección de concepto
  const handleConceptSelect = (concept: Concept) => {
    setSelectedConcept(concept);
    setQuantity("");
    setIsCompleted(false);
  };

  // Validar cantidad ingresada
  const validateQuantity = (value: string) => {
    if (!selectedConcept) return;

    if (!value || value === "0") {
      setQuantityError("Ingresa una cantidad mayor a cero");
      return;
    }

    const numValue = parseFloat(value);
    const remainingQuantity = selectedConcept.quantity - executedQuantity;

    if (numValue <= 0) {
      setQuantityError("La cantidad debe ser mayor a cero");
    } else if (numValue > remainingQuantity) {
      setQuantityError(
        `La cantidad máxima disponible es ${remainingQuantity} ${selectedConcept.unit}`
      );
    } else {
      setQuantityError(null);
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (value: string) => {
    // Permitir solo números y punto decimal
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value === "" || regex.test(value)) {
      setQuantity(value);
      validateQuantity(value);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async () => {
    if (!formIsValid || !selectedConcept) {
      Alert.alert(
        "Formulario incompleto",
        "Por favor, completa todos los campos requeridos.",
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }

    try {
      // Preparar datos para el avance
      const advanceData = {
        construction_id: constructionId,
        concept_id: selectedConcept.id,
        quantity: parseFloat(quantity),
        is_completed: isCompleted,
        notes: notes.trim(),
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      // Actualizar el estado global
      dispatch(setCurrentAdvanceData(advanceData));

      // Registrar el avance
      await dispatch(
        registerAdvance({
          advance: advanceData,
          photos: photos,
        })
      ).unwrap();

      // Resetear formulario en caso de éxito
      setSelectedConcept(null);
      setQuantity("");
      setNotes("");
      setIsCompleted(false);

      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }

      // Mostrar mensaje de éxito
      Alert.alert(
        "Avance registrado",
        "El avance ha sido registrado exitosamente.",
        [{ text: "Aceptar", style: "default" }]
      );
    } catch (error) {
      // Mostrar mensaje de error
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo registrar el avance.",
        [{ text: "Entendido", style: "default" }]
      );
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Indicador de modo offline */}
        <OfflineIndicator
          isOffline={!offlineSyncState.isOnline}
          pendingCount={offlineSyncState.pendingCount}
          isSyncing={offlineSyncState.isSyncing}
          lastSyncTime={
            offlineSyncState.lastSyncTime
              ? new Date(offlineSyncState.lastSyncTime)
              : null
          }
        />

        {/* Selector de concepto */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Concepto</Text>
          <ConceptSelector
            constructionId={constructionId}
            onSelectConcept={handleConceptSelect}
            selectedConcept={selectedConcept}
          />
        </View>

        {/* Cantidad ejecutada */}
        {selectedConcept && (
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>
                Cantidad ejecutada ({selectedConcept.unit})
              </Text>
              {quantityError && (
                <Text style={styles.errorText}>{quantityError}</Text>
              )}
            </View>
            <View
              style={[
                styles.inputContainer,
                { borderColor: quantityError ? "#e74c3c" : "#ddd" },
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder={`Ingresa cantidad en ${selectedConcept.unit}`}
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                autoCapitalize="none"
              />
              {quantityError && (
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#e74c3c"
                  style={styles.inputIcon}
                />
              )}
            </View>

            {/* Checkbox para marcar como completado */}
            <View style={styles.completedContainer}>
              <Text style={styles.completedLabel}>
                Marcar concepto como completado
              </Text>
              <Switch
                value={isCompleted}
                onValueChange={setIsCompleted}
                trackColor={{ false: "#ecf0f1", true: "#2ecc7180" }}
                thumbColor={isCompleted ? "#2ecc71" : "#bdc3c7"}
              />
            </View>

            {/* Estado respecto al programa */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Estado del avance:</Text>
              <ProgramStatusBadge
                status={
                  isCompleted
                    ? "completed"
                    : /*
                     * Como no tenemos programmed_quantity, usaremos un cálculo basado
                     * en el porcentaje de avance respecto a la cantidad total.
                     * Podemos considerar:
                     * - 'ahead': cuando se completa más del 75% con este avance
                     * - 'delayed': cuando se completa menos del 25% con este avance
                     * - 'onSchedule': para valores entre 25% y 75%
                     */
                    (parseFloat(quantity || "0") + executedQuantity) /
                        selectedConcept.quantity >
                      0.75
                    ? "ahead"
                    : (parseFloat(quantity || "0") + executedQuantity) /
                        selectedConcept.quantity <
                      0.25
                    ? "delayed"
                    : "onSchedule"
                }
              />
            </View>
          </View>
        )}

        {/* Captura de fotos */}
        <View style={styles.formGroup}>
          <PhotoCapture
            photos={photos}
            loading={loadingPhotos}
            onTakePhoto={takePhoto}
            onPickImage={pickImage}
            onRemovePhoto={removePhoto}
          />
        </View>

        {/* Notas */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notas (opcional)</Text>
          <View style={styles.textareaContainer}>
            <TextInput
              style={styles.textarea}
              placeholder="Escribe cualquier observación relevante..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Información de ubicación */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ubicación</Text>
          {loadingLocation ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.locationLoadingText}>
                Obteniendo ubicación...
              </Text>
            </View>
          ) : location ? (
            <View style={styles.locationInfo}>
              <Ionicons
                name="location"
                size={20}
                color="#3498db"
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>
                Lat: {location.latitude.toFixed(6)}, Lon:{" "}
                {location.longitude.toFixed(6)}
                {location.accuracy
                  ? ` • Precisión: ${location.accuracy.toFixed(1)}m`
                  : ""}
              </Text>
            </View>
          ) : (
            <View style={styles.locationError}>
              <Ionicons
                name="warning"
                size={20}
                color="#e67e22"
                style={styles.locationIcon}
              />
              <Text style={styles.locationErrorText}>
                No se pudo obtener la ubicación. El avance se registrará sin
                coordenadas geográficas.
              </Text>
            </View>
          )}
        </View>

        {/* Botón de envío */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !formIsValid && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!formIsValid || currentAdvance.loading}
        >
          {currentAdvance.loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="save"
                size={20}
                color="#fff"
                style={styles.submitIcon}
              />
              <Text style={styles.submitText}>Registrar avance</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  inputIcon: {
    marginLeft: 8,
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textarea: {
    height: 100,
    fontSize: 16,
  },
  completedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 4,
  },
  completedLabel: {
    fontSize: 14,
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  locationLoading: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    padding: 12,
    borderRadius: 8,
  },
  locationLoadingText: {
    marginLeft: 8,
    color: "#7f8c8d",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f4f8",
    padding: 12,
    borderRadius: 8,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    color: "#2980b9",
    flex: 1,
  },
  locationError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef9e7",
    padding: 12,
    borderRadius: 8,
  },
  locationErrorText: {
    color: "#d35400",
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  submitIcon: {
    marginRight: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AdvanceForm;
