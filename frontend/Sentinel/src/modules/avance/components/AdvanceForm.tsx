import React, { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import PhotoCapture from "./PhotoCapture";
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
} from "../../../redux/slices/advanceSlice";
import LabeledDropdown from "./LabeledDropdown";
import QuantityInput from "./QuantityInput";
import CompletionSwitch from "./CompletionSwitch";
import StatusSection from "./StatusSection";
import NotesInput from "./NotesInput";
import LocationInfo from "./LocationInfo";
import SubmitButton from "./SubmitButton";
import { Alert } from "react-native";
import styles from "./styles/AdvanceForm.styles";

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
      // Handle edge cases where either the advance or photos endpoint is offline or returns an error
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

  const mockCatalogItems: string[] = [
    "Catalogo 1",
    "Catalogo 2",
    "Catalogo 3",
    "Catalogo 4",
    "Catalogo 5",
  ];

  const mockPartidaitems: string[] = [
    "Partida 1",
    "Partida 2",
    "Partida 3",
    "Partida 4",
    "Partida 5",
  ];

  const mockConceptItems: string[] = [
    "Concepto 1",
    "Concepto 2",
    "Concepto 3",
    "Concepto 4",
    "Concepto 5",
  ];

  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [selectedPartida, setSelectedPartida] = useState<string | null>(null);
  const [selectedConceptMock, setSelectedConceptMock] = useState<string | null>(
    null
  );

  const handleCatalogSelect = (item: string) => {
    setSelectedCatalog(item);
  };

  const handlePartidaSelect = (item: string) => {
    setSelectedPartida(item);
  };

  const handleConceptSelectMock = (item: string) => {
    setSelectedConceptMock(item);
    // If you want to keep setSelectedConcept, you need to map string to Concept object here if available
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

        <View style={styles.formSection}>
          <LabeledDropdown
            label="Catálogo"
            items={mockCatalogItems}
            selected={selectedCatalog}
            onSelect={handleCatalogSelect}
          />
          <LabeledDropdown
            label="Partida"
            items={mockPartidaitems}
            selected={selectedPartida}
            onSelect={handlePartidaSelect}
          />
          <LabeledDropdown
            label="Concepto"
            items={mockConceptItems}
            selected={selectedConceptMock}
            onSelect={handleConceptSelectMock}
          />

          <QuantityInput
            quantity={quantity}
            onChange={handleQuantityChange}
            unit={selectedConcept ? selectedConcept.unit : ""}
            error={quantityError}
          />

          {/* Cantidad ejecutada y controles avanzados */}
          {selectedConcept && (
            <View style={styles.advancedSection}>
              {/* Checkbox para marcar como completado */}
              <CompletionSwitch
                value={isCompleted}
                onValueChange={setIsCompleted}
              />
              {/* Estado respecto al programa */}
              <StatusSection
                status={
                  isCompleted
                    ? "completed"
                    : (parseFloat(quantity || "0") + executedQuantity) /
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
          )}

          {/* Captura de fotos */}
          <View style={styles.photoSection}>
            <PhotoCapture
              photos={photos}
              loading={loadingPhotos}
              onTakePhoto={takePhoto}
              onPickImage={pickImage}
              onRemovePhoto={removePhoto}
            />
          </View>

          {/* Notas */}
          <NotesInput value={notes} onChange={setNotes} />

          {/* Información de ubicación */}
          <LocationInfo
            loading={loadingLocation}
            location={
              location
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                  }
                : null
            }
            error={hasLocationError}
          />
        </View>

        {/* Botón de envío */}
        <SubmitButton
          loading={currentAdvance.loading}
          disabled={!formIsValid || currentAdvance.loading}
          onPress={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdvanceForm;
