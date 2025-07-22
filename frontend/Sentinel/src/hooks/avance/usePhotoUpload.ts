import { useState } from "react";
import photoService, {
  PhotoUploadRequest,
} from "../../services/api/photoService";
import { Photo } from "./usePhotoCapture";
import { LocationData } from "./useGeolocation";
import * as Device from "expo-device";

export interface PhotoUploadProgress {
  photoId: string;
  filename: string;
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number; // 0-100
  error?: string;
}

export interface UploadResult {
  success: boolean;
  uploadedPhotos: number;
  totalPhotos: number;
  errors: string[];
  details: PhotoUploadProgress[];
}

interface UsePhotoUploadProps {
  constructionId: number;
  onProgress?: (progress: PhotoUploadProgress[]) => void;
  onComplete?: (result: UploadResult) => void;
}

export const usePhotoUpload = ({
  constructionId,
  onProgress,
  onComplete,
}: UsePhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<PhotoUploadProgress[]>(
    []
  );

  /**
   * Preparar datos de foto para upload
   */
  const preparePhotoData = async (
    photo: Photo,
    physicalAdvanceId: number,
    location?: LocationData
  ): Promise<PhotoUploadRequest> => {
    const fileSize = await photoService.getFileSize(photo.uri);
    // Usar el filename personalizable de la foto
    const filename = photo.filename;

    return {
      physical_advance_id: physicalAdvanceId,
      construction_id: constructionId,
      filename,
      file_size: fileSize,
      content_type: "image/jpeg",
      device_model: Device.modelName ?? "Unknown Device",
      latitude: location?.latitude || photo.location?.latitude,
      longitude: location?.longitude || photo.location?.longitude,
      gps_accuracy: location?.accuracy || undefined,
      taken_at: new Date(photo.timestamp).toISOString(),
    };
  };

  /**
   * Actualizar progreso de una foto específica
   */
  const updatePhotoProgress = (
    photoId: string,
    updates: Partial<PhotoUploadProgress>
  ) => {
    setUploadProgress((prev) => {
      const updated = prev.map((p) =>
        p.photoId === photoId ? { ...p, ...updates } : p
      );
      onProgress?.(updated);
      return updated;
    });
  };

  /**
   * Subir una sola foto
   */
  const uploadSinglePhoto = async (
    photo: Photo,
    physicalAdvanceId: number,
    location?: LocationData
  ): Promise<boolean> => {
    const photoId = photo.id;

    try {
      // Preparar datos
      const photoData = await preparePhotoData(
        photo,
        physicalAdvanceId,
        location
      );

      updatePhotoProgress(photoId, { status: "uploading", progress: 10 });

      // Paso 1: Solicitar SAS token
      const uploadResponse = await photoService.requestSingleUpload(photoData);
      updatePhotoProgress(photoId, { progress: 30 });

      // Paso 2: Convertir URI a Blob
      const fileBlob = await photoService.uriToBlob(photo.uri);
      updatePhotoProgress(photoId, { progress: 50 });

      // Paso 3: Subir a Azure Blob
      const uploadSuccess = await photoService.uploadToAzureBlob(
        uploadResponse.upload_url,
        fileBlob,
        "image/jpeg"
      );
      updatePhotoProgress(photoId, { progress: 80 });

      // Paso 4: Confirmar subida
      await photoService.confirmUpload({
        photo_id: uploadResponse.photo_id,
        upload_successful: uploadSuccess,
        error_message: uploadSuccess
          ? undefined
          : "Failed to upload to Azure Blob",
      });

      updatePhotoProgress(photoId, {
        status: uploadSuccess ? "completed" : "failed",
        progress: 100,
        error: uploadSuccess ? undefined : "Failed to upload to Azure Blob",
      });

      return uploadSuccess;
    } catch (error) {
      console.error("Error uploading single photo:", error);
      updatePhotoProgress(photoId, {
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  };

  /**
   * Subir múltiples fotos usando bulk upload
   */
  const uploadMultiplePhotos = async (
    photos: Photo[],
    physicalAdvanceId: number,
    location?: LocationData
  ): Promise<UploadResult> => {
    try {
      // Preparar datos para todas las fotos
      const photosData = await Promise.all(
        photos.map((photo) =>
          preparePhotoData(photo, physicalAdvanceId, location)
        )
      );

      // Inicializar progreso
      photos.forEach((photo) => {
        updatePhotoProgress(photo.id, { status: "uploading", progress: 10 });
      });

      // Paso 1: Solicitar SAS tokens en bulk
      const bulkResponse = await photoService.requestBulkUpload({
        photos: photosData,
      });

      // Actualizar progreso después de obtener tokens
      photos.forEach((photo) => {
        updatePhotoProgress(photo.id, { progress: 30 });
      });

      // Paso 2: Subir fotos en paralelo a Azure Blob
      const uploadPromises = bulkResponse.results.map(async (result, index) => {
        const photo = photos[index];
        const photoId = photo.id;

        if (!result.success || !result.upload_url) {
          updatePhotoProgress(photoId, {
            status: "failed",
            progress: 0,
            error: result.error || "Failed to get upload URL",
          });
          return { photoId, success: false, error: result.error };
        }

        try {
          // Convertir URI a Blob
          const fileBlob = await photoService.uriToBlob(photo.uri);
          updatePhotoProgress(photoId, { progress: 50 });

          // Subir a Azure
          const uploadSuccess = await photoService.uploadToAzureBlob(
            result.upload_url,
            fileBlob,
            "image/jpeg"
          );
          updatePhotoProgress(photoId, { progress: 80 });

          // Confirmar subida
          if (result.photo_id) {
            await photoService.confirmUpload({
              photo_id: result.photo_id,
              upload_successful: uploadSuccess,
              error_message: uploadSuccess
                ? undefined
                : "Failed to upload to Azure Blob",
            });
          }

          updatePhotoProgress(photoId, {
            status: uploadSuccess ? "completed" : "failed",
            progress: 100,
            error: uploadSuccess ? undefined : "Failed to upload to Azure Blob",
          });

          return { photoId, success: uploadSuccess };
        } catch (error) {
          updatePhotoProgress(photoId, {
            status: "failed",
            progress: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return {
            photoId,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Calcular resultados finales
      const successful = uploadResults.filter((r) => r.success).length;
      const errors = uploadResults
        .filter((r) => !r.success)
        .map((r) => r.error || "Unknown error");

      return {
        success: successful > 0,
        uploadedPhotos: successful,
        totalPhotos: photos.length,
        errors,
        details: uploadProgress,
      };
    } catch (error) {
      console.error("Error in bulk upload:", error);

      // Marcar todas las fotos como fallidas
      photos.forEach((photo) => {
        updatePhotoProgress(photo.id, {
          status: "failed",
          progress: 0,
          error: error instanceof Error ? error.message : "Bulk upload failed",
        });
      });

      return {
        success: false,
        uploadedPhotos: 0,
        totalPhotos: photos.length,
        errors: [error instanceof Error ? error.message : "Bulk upload failed"],
        details: uploadProgress,
      };
    }
  };

  /**
   * Función principal para subir fotos (decide entre single o bulk)
   */
  const uploadPhotos = async (
    photos: Photo[],
    physicalAdvanceId: number,
    location?: LocationData
  ): Promise<UploadResult> => {
    if (photos.length === 0) {
      return {
        success: true,
        uploadedPhotos: 0,
        totalPhotos: 0,
        errors: [],
        details: [],
      };
    }

    setIsUploading(true);

    // Inicializar progreso
    const initialProgress: PhotoUploadProgress[] = photos.map((photo) => ({
      photoId: photo.id,
      filename: photo.filename,
      status: "pending" as const,
      progress: 0,
    }));

    setUploadProgress(initialProgress);
    onProgress?.(initialProgress);

    let result: UploadResult;

    try {
      if (photos.length === 1) {
        // Usar single upload para una foto
        const success = await uploadSinglePhoto(
          photos[0],
          physicalAdvanceId,
          location
        );
        result = {
          success,
          uploadedPhotos: success ? 1 : 0,
          totalPhotos: 1,
          errors: success ? [] : ["Failed to upload photo"],
          details: uploadProgress,
        };
      } else {
        // Usar bulk upload para múltiples fotos
        result = await uploadMultiplePhotos(
          photos,
          physicalAdvanceId,
          location
        );
      }

      onComplete?.(result);
      return result;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadPhotos,
    isUploading,
    uploadProgress,
  };
};
