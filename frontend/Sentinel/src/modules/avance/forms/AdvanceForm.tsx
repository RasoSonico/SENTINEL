import React, { useEffect, useRef } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useForm } from "react-hook-form";

import OfflineIndicator from "../components/OfflineIndicator";
import { useAdvancePhotoSync } from "../../../hooks/avance/useAdvancePhotoSync";
import { useAdvanceLocation } from "../../../hooks/avance/useAdvanceLocation";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setCurrentAdvancePhotos,
  selectOfflineSync,
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
import useAdvancesSubmission from "src/hooks/avance/useAdvancesSubmission";

interface AdvanceFormProps {
  constructionId: number;
  onSuccess?: () => void;
}

const AdvanceForm: React.FC<AdvanceFormProps> = ({
  constructionId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
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
    submitAdvanceWithPhotos,
    mutation: {
      isPending: isSubmittingAdvance,
      isSuccess: isAdvanceSubmitted,
      isError: isAdvanceSubmissionError,
    },
  } = useAdvancesSubmission({ constructionId });

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
  });

  useEffect(() => {
    // Si hay fotos en el estado local, actualizarlas en el global
    if (photos.length > 0) {
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
      submitAdvanceWithPhotos({
        concept: data.concept,
        volume: Number(data.quantity),
        comments: data.notes ?? "",
        photos,
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      openModal(ModalEnum.AdvanceFailure);
    }
  };

  useEffect(() => {
    if (isSubmittingAdvance) {
      openModal(ModalEnum.AdvancePending);
    }
  }, [isSubmittingAdvance]);

  useEffect(() => {
    if (isAdvanceSubmissionError) {
      openModal(ModalEnum.AdvanceFailure);
    }
  }, [isAdvanceSubmissionError]);

  useEffect(() => {
    if (isAdvanceSubmitted) {
      resetFormFields();
      clearPhotos();

      onSuccess?.();

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
    }
  }, [isAdvanceSubmitted]);

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

  const handleSubmitForm = async () => {
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
          loading={isSubmittingAdvance}
          disabled={isSubmittingAdvance}
          onPress={handleSubmitForm}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdvanceForm;
