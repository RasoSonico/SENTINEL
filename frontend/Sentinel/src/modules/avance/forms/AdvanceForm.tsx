import React, { useEffect, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  findNodeHandle, // <-- add this import
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import PhotoCapture from "../components/PhotoCapture";
import OfflineIndicator from "../components/OfflineIndicator";
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
import LabeledDropdown from "../components/LabeledDropdown";
import QuantityInput from "../components/QuantityInput";
import CompletionSwitch from "../components/CompletionSwitch";
import StatusSection from "../components/StatusSection";
import NotesInput from "../components/NotesInput";
import LocationInfo from "../components/LocationInfo";
import SubmitButton from "../components/SubmitButton";
import styles from "./styles/AdvanceForm.styles";

// Zod schema for form validation
const advanceFormSchema = z.object({
  catalog: z.string().min(1, "Selecciona un catálogo"),
  partida: z.string().min(1, "Selecciona una partida"),
  concept: z.string().min(1, "Selecciona un concepto"),
  quantity: z
    .string()
    .refine((val) => !!val && !isNaN(Number(val)) && Number(val) > 0, {
      message: "Ingresa una cantidad válida mayor a cero",
    }),
  notes: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

type AdvanceFormFields = z.infer<typeof advanceFormSchema>;

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

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
    reset,
  } = useForm<AdvanceFormFields>({
    resolver: zodResolver(advanceFormSchema),
    mode: "onChange",
    defaultValues: {
      catalog: "",
      partida: "",
      concept: "",
      quantity: "",
      notes: "",
      isCompleted: false,
    },
  });

  // Watchers for dependent logic
  const selectedCatalog = watch("catalog");
  const selectedPartida = watch("partida");
  const selectedConcept = watch("concept");
  const quantity = watch("quantity");
  const isCompleted = watch("isCompleted");
  const notes = watch("notes");

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

      dispatch(setCurrentAdvancePhotos(photos)); // Por ahora usamos 0 como valor temporal
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

  // Efecto para obtener ubicación al montar
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        await getCurrentLocation();
      } catch (error) {
        console.error("Error al obtener ubicación:", error);
        // setHasLocationError(true);
      }
    };

    fetchLocation();
  }, []);

  // Manejar selección de concepto
  const handleConceptSelect = (conceptId: string) => {
    setValue("concept", conceptId, { shouldValidate: true });
  };

  // Manejar selección de catálogo
  const handleCatalogSelect = (catalogId: string) => {
    setValue("catalog", catalogId, { shouldValidate: true });
  };

  // Manejar selección de partida
  const handlePartidaSelect = (partidaId: string) => {
    setValue("partida", partidaId, { shouldValidate: true });
  };

  // Manejar el envío del formulario
  const onFormSubmit = async (data: AdvanceFormFields) => {
    // You may want to map concept string to Concept object if needed for executedQuantity, etc.
    // For now, keep executedQuantity logic as is.
    try {
      const advanceData = {
        construction_id: constructionId,
        concept_id: data.concept, // If you need the id, map it here
        quantity: parseFloat(data.quantity),
        is_completed: data.isCompleted || false,
        notes: data.notes?.trim() || "",
        latitude: location?.latitude,
        longitude: location?.longitude,
      };
      dispatch(setCurrentAdvanceData(advanceData));
      // await dispatch(
      //   registerAdvance({
      //     advance: advanceData,
      //     photos: photos,
      //   })
      // ).unwrap();
      reset();
      // setExecutedQuantity(0);
      if (onSuccess) onSuccess();
      Alert.alert(
        "Avance registrado",
        "El avance ha sido registrado exitosamente.",
        [{ text: "Aceptar", style: "default" }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo registrar el avance.",
        [{ text: "Entendido", style: "default" }]
      );
    }
  };

  // Refs for scrolling to fields
  const scrollViewRef = useRef<ScrollView>(null);
  const catalogRef = useRef<View>(null) as React.RefObject<View>;
  const partidaRef = useRef<View>(null) as React.RefObject<View>;
  const conceptRef = useRef<View>(null) as React.RefObject<View>;
  const quantityRef = useRef<View>(null) as React.RefObject<View>;

  // On submit with error, scroll to top if any error
  const scrollToTopIfError = () => {
    if (errors.catalog || errors.partida || errors.concept || errors.quantity) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // Custom submit handler to always scroll to top if error
  const handleCustomSubmit = async () => {
    const valid = await trigger();
    if (valid) {
      handleSubmit(onFormSubmit)();
    } else {
      scrollToTopIfError();
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          <View ref={catalogRef as any}>
            <Controller
              control={control}
              name="catalog"
              render={({ field: { value } }) => (
                <LabeledDropdown
                  label="Catálogo"
                  items={mockCatalogItems}
                  selected={value}
                  onSelect={handleCatalogSelect}
                  error={errors.catalog?.message}
                />
              )}
            />
          </View>
          <View ref={partidaRef as any}>
            <Controller
              control={control}
              name="partida"
              render={({ field: { value } }) => (
                <LabeledDropdown
                  label="Partida"
                  items={mockPartidaitems}
                  selected={value}
                  onSelect={handlePartidaSelect}
                  error={errors.partida?.message}
                />
              )}
            />
          </View>
          <View ref={conceptRef as any}>
            <Controller
              control={control}
              name="concept"
              render={({ field: { value } }) => (
                <LabeledDropdown
                  label="Concepto"
                  items={mockConceptItems}
                  selected={value}
                  onSelect={handleConceptSelect}
                  error={errors.concept?.message}
                />
              )}
            />
          </View>
          <View ref={quantityRef as any}>
            <Controller
              control={control}
              name="quantity"
              render={({ field: { value, onChange } }) => (
                <QuantityInput
                  quantity={value}
                  onChange={onChange}
                  unit={""}
                  error={errors.quantity?.message ?? null}
                />
              )}
            />
          </View>
          {/* Cantidad ejecutada y controles avanzados */}
          <Controller
            control={control}
            name="isCompleted"
            render={({ field: { value, onChange } }) => (
              <CompletionSwitch value={!!value} onValueChange={onChange} />
            )}
          />
          {/* Use a mock quantity value for status calculation since selectedConceptMock is a string */}
          <StatusSection status={isCompleted ? "completed" : "onSchedule"} />
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
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <NotesInput value={value || ""} onChange={onChange} />
            )}
          />
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
            error={false}
          />
        </View>
        {/* Botón de envío */}
        <SubmitButton
          loading={currentAdvance.loading}
          disabled={currentAdvance.loading}
          onPress={handleCustomSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdvanceForm;
