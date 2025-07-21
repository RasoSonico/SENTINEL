import React, { useEffect, useRef } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useForm } from "react-hook-form";

import OfflineIndicator from "../components/OfflineIndicator";
import { useAdvancePhotoSync } from "../../../hooks/avance/useAdvancePhotoSync";
import { useAdvanceLocation } from "../../../hooks/avance/useAdvanceLocation";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setCurrentAdvancePhotos,
  selectCurrentAdvance,
  selectOfflineSync,
  registerAdvance,
} from "../../../redux/slices/avance/advanceSlice";
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
import { useModal } from "../../modals/ModalContext";
import { ModalEnum } from "../../modals/modalTypes";
import {
  useCatalogNameById,
  useConceptDescriptionById,
  usePartidaNameById,
} from "../../../redux/selectors/avance/avanceFormDataSelectors";
import { AdvanceRegistration } from "../../../types/entities";
import { useSubmitAdvance } from "../../../hooks/data/query/useAvanceQueries";
import { useAdvanceSubmission } from "../../../hooks/avance/useAdvanceSubmission";

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

  const {
    mutate: submitAdvance,
    isPending: submitAdvanceIsPending,
    isSuccess: submitAdvanceWasSuccessful,
    isError: submitAdvanceHadError,
    error: submitAdvanceError,
  } = useSubmitAdvance();

  // Nuevo hook para envío completo (avance + fotos)
  const advanceSubmission = useAdvanceSubmission({
    constructionId: parseInt(constructionId),
    onProgress: (progress) => {
      console.log("Submission progress:", progress);
      // Aquí podrías mostrar progreso en la UI
    },
  });

  // Watchers for dependent logic
  const selectedCatalogId = watch("catalog");
  const selectedPartidaId = watch("partida");
  const selectedConceptId = watch("concept");
  const isCompleted = watch("isCompleted");
  const selectedNotes = watch("notes");
  const selectedVolume = watch("quantity");

  // Get names/descriptions for summary modal
  const catalogName = useCatalogNameById(selectedCatalogId);
  const partidaName = usePartidaNameById(selectedPartidaId);
  const conceptDescription = useConceptDescriptionById(selectedConceptId);

  // Hook de fotos (debe ir después de definir partidaName y conceptDescription)
  const {
    photos,
    loading: loadingPhotos,
    takePhoto,
    pickImage,
    removePhoto,
    clearPhotos,
    updatePhotoFilename,
  } = useAdvancePhotoSync({
    maxPhotos: 5,
    includeLocation: true,
    partidaName: partidaName || "",
    conceptName: "", // Ya no usamos conceptName para generar nombres
  });

  // Efecto para cargar la cantidad ejecutada cuando se selecciona un concepto
  useEffect(() => {
    if (selectedConceptId) {
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
  }, [selectedConceptId]);

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

  const onFormSubmit = async (data: AdvanceFormFieldsZod) => {
    try {
      // Usar el nuevo hook que maneja avance + fotos
      const success = await advanceSubmission.submitAdvanceWithPhotos({
        concept: data.concept,
        volume: Number(data.quantity),
        comments: data.notes ?? "",
        photos: photos, // Fotos del hook de captura
        location: location || undefined, // Ubicación del hook de geolocalización
      });

      if (success) {
        // Limpiar formulario y fotos
        resetFormFields();
        clearPhotos(); // Limpiar fotos del hook

        onSuccess?.();

        openModal(ModalEnum.AdvanceSuccess, {
          onRegisterAnother: () => {
            closeModal();
            scrollToTop();
            advanceSubmission.resetSubmission();
          },
          onGoHome: () => {
            closeModal();
            navigation.goBack();
          },
        });
      } else {
        openModal(ModalEnum.AdvanceFailure);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      openModal(ModalEnum.AdvanceFailure);
    }
  };

  // Manejar estados del nuevo hook de submission
  useEffect(() => {
    if (advanceSubmission.isSubmitting) {
      openModal(ModalEnum.AdvancePending);
    }
  }, [advanceSubmission.isSubmitting]);

  // Comentar los viejos useEffects para evitar conflictos
  // useEffect(() => {
  //   if (submitAdvanceIsPending) {
  //     openModal(ModalEnum.AdvancePending)
  //   }
  // }, [submitAdvanceIsPending])

  // useEffect(() => {
  //   if(submitAdvanceHadError) {
  //     openModal(ModalEnum.AdvanceFailure)
  //   }
  // }, [submitAdvanceHadError, submitAdvanceError])

  // useEffect(() => {
  //   if (submitAdvanceWasSuccessful) {
  //     resetFormFields();

  //     onSuccess?.();

  //     openModal(ModalEnum.AdvanceSuccess, {
  //       onRegisterAnother: () => {
  //         closeModal();
  //         scrollToTop();
  //       },
  //       onGoHome: () => {
  //         closeModal();
  //         navigation.goBack();
  //       },
  //     });
  //   }
  // }, [submitAdvanceWasSuccessful])

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
          catalog: catalogName,
          partida: partidaName,
          concept: conceptDescription,
          volume: selectedVolume || "0",
          notes: selectedNotes || "",
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
            disablePartida={!selectedCatalogId}
            disableConcept={!selectedPartidaId}
            setFormValue={setValue}
            watchFormValue={watch}
          />
          <AdvancePhotoSection
            photos={photos}
            loading={loadingPhotos}
            onTakePhoto={takePhoto}
            onPickImage={pickImage}
            onRemovePhoto={removePhoto as any} // Accept string id for now
            onUpdatePhotoFilename={updatePhotoFilename}
            partidaName={partidaName || ""}
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
          loading={advanceSubmission.isSubmitting}
          disabled={advanceSubmission.isSubmitting}
          onPress={handleCustomSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdvanceForm;
