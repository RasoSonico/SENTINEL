import React, { useEffect, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";

import OfflineIndicator from "../components/OfflineIndicator";
import { useAdvancePhotoSync } from "../../../hooks/avance/useAdvancePhotoSync";
import { useAdvanceLocation } from "../../../hooks/avance/useAdvanceLocation";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setCurrentAdvanceData,
  setCurrentAdvancePhotos,
  selectCurrentAdvance,
  selectOfflineSync,
} from "../../../redux/slices/advanceSlice";
import AdvancePhotoSection from "./components/AdvancePhotoSection";
import AdvanceLocationSection from "./components/AdvanceLocationSection";
import SubmitButton from "../components/SubmitButton";
import styles from "./styles/AdvanceForm.styles";
import AdvanceFormFields from "./components/AdvanceFormFields";
import {
  advanceFormDefaultValues,
  AdvanceFormFieldsZod,
  advanceFormSchema,
} from "./util/advanceFormValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useModal } from "src/modules/modals/ModalContext";
import { ModalEnum } from "src/modules/modals/modalTypes";

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
  const navigation = useNavigation();

  const {
    photos,
    loading: loadingPhotos,
    takePhoto,
    pickImage,
    removePhoto,
  } = useAdvancePhotoSync({
    maxPhotos: 5,
    includeLocation: true,
  });

  const { location, loading: loadingLocation } = useAdvanceLocation({
    requestPermissionOnMount: true,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset: resetFormFields,
  } = useForm<AdvanceFormFieldsZod>({
    resolver: zodResolver(advanceFormSchema),
    mode: "onChange",
    defaultValues: advanceFormDefaultValues,
  });

  // Watchers for dependent logic
  const selectedCatalog = watch("catalog");
  const selectedPartida = watch("partida");
  const selectedConcept = watch("concept");
  const isCompleted = watch("isCompleted");

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

  // Manejar selección de concepto
  const handleConceptSelect = (conceptId: number) => {
    setValue("concept", conceptId, { shouldValidate: true });
  };

  // Manejar selección de catálogo
  const handleCatalogSelect = (catalogId: number) => {
    setValue("catalog", catalogId, { shouldValidate: true });
  };

  // Manejar selección de partida
  const handlePartidaSelect = (partidaId: number) => {
    setValue("partida", partidaId, { shouldValidate: true });
  };

  // Manejar el envío del formulario
  const onFormSubmit = async (data: AdvanceFormFieldsZod) => {
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
      resetFormFields();
      if (onSuccess) onSuccess();
      openModal(ModalEnum.AdvanceSuccess, {
        onRegisterAnother: () => {
          closeModal();
          scrollToTop();
        },
        onGoHome: () => {
          closeModal();
          navigation.goBack();
        },
      });
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

  // On submit with error, scroll to top if any error
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const { openModal, closeModal } = useModal();

  const handleEditConfirmSendModal = () => {
    closeModal();
    scrollToTop();
  };

  const handleConfirmSendModal = async () => {
    const valid = await trigger();
    if (valid) {
      handleSubmit(onFormSubmit)();
    } else {
      scrollToTop();
    }
  };

  const handleCustomSubmit = async () => {
    const valid = await trigger();
    if (valid) {
      openModal(ModalEnum.ConfirmSend, {
        onEdit: handleEditConfirmSendModal,
        onConfirm: handleConfirmSendModal,
        summary: {
          catalogo: selectedCatalog.toString() || "",
          partida: selectedPartida.toString() || "",
          concepto: selectedConcept.toString() || "",
          volumen: watch("quantity") || "0",
          actividades: watch("notes") || "",
        },
      });
    } else {
      scrollToTop();
    }
  };

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
          <AdvanceFormFields
            control={control}
            errors={errors}
            isCompleted={isCompleted}
            onCatalogSelect={handleCatalogSelect}
            onPartidaSelect={handlePartidaSelect}
            onConceptSelect={handleConceptSelect}
            disablePartida={!selectedCatalog}
            disableConcept={!selectedPartida}
            setFormValue={setValue}
            watchFormValue={watch}
          />
          <AdvancePhotoSection
            photos={photos}
            loading={loadingPhotos}
            onTakePhoto={takePhoto}
            onPickImage={pickImage}
            onRemovePhoto={removePhoto as any} // Accept string id for now
            style={styles.photoSection}
          />
          <AdvanceLocationSection
            loading={loadingLocation}
            location={
              location
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy ?? undefined,
                  }
                : null
            }
            error={false}
          />
        </View>

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
