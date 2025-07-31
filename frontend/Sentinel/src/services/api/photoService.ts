import { apiRequest } from "./apiClient";
import { API_CONFIG } from "./config";

// Interfaces para el servicio de fotos
export interface PhotoUploadRequest {
  physical_advance_id: number;
  construction_id: number;
  filename: string;
  file_size: number;
  content_type: string;
  device_model?: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number;
  taken_at: string; // ISO string
  image_width?: number;
  image_height?: number;
}

export interface PhotoUploadResponse {
  photo_id: string;
  upload_url: string;
  blob_path: string;
  expires_at: string;
  instructions: {
    method: string;
    headers: {
      "x-ms-blob-type": string;
      "Content-Type": string;
    };
    note: string;
  };
}

export interface BulkUploadRequest {
  photos: PhotoUploadRequest[];
}

export interface BulkUploadResponse {
  upload_sessions?: Array<{
    photo_id: string;
    filename: string;
    upload_url: string;
    blob_path?: string;
    expires_at: string;
  }>;
  // Formato alternativo para compatibilidad
  results?: Array<{
    photo_id: string;
    filename: string;
    upload_url: string;
    blob_path?: string;
    expires_at: string;
    success?: boolean;
    error?: string;
  }>;
  total_requested?: number;
  successful?: number;
  failed?: number;
}

export interface CameraInfo {
  make?: string;
  model?: string;
  datetime?: string;
}

export interface ConfirmUploadRequest {
  photo_id: string;
  upload_successful: boolean;
  error_message?: string;
  camera_info?: CameraInfo;
}

export interface ConfirmUploadResponse {
  message: string;
  photo_id: string;
  status: string;
}

/**
 * Solicitar SAS token para subir una foto individual
 */
export const requestSingleUpload = async (
  photoData: PhotoUploadRequest
): Promise<PhotoUploadResponse> => {
  return await apiRequest<PhotoUploadResponse>(
    "post",
    API_CONFIG.endpoints.photos.upload,
    "Error al solicitar token de subida",
    photoData
  );
};

/**
 * Solicitar SAS tokens para subir múltiples fotos
 */
export const requestBulkUpload = async (
  photosData: BulkUploadRequest
): Promise<BulkUploadResponse> => {
  console.log("📤 [API] Requesting bulk upload with data:", photosData);
  console.log("📤 [API] Endpoint:", API_CONFIG.endpoints.photos.bulkUpload);

  const response = await apiRequest<BulkUploadResponse>(
    "post",
    API_CONFIG.endpoints.photos.bulkUpload,
    "Error al solicitar tokens de subida múltiple",
    photosData
  );

  console.log("📤 [API] Bulk upload response:", response);
  return response;
};

/**
 * Subir archivo directamente a Azure Blob Storage
 */
export const uploadToAzureBlob = async (
  uploadUrl: string,
  fileData: Blob,
  contentType: string
): Promise<boolean> => {
  try {
    console.log("🔵 Azure Blob Upload - Starting direct upload to:", uploadUrl);
    console.log("🔵 File info:", { size: fileData.size, type: contentType });

    // Hacer llamada directa a Azure (no usar apiRequest)
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: fileData,
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": contentType,
      },
    });

    console.log("🔵 Azure Blob Upload - Response status:", response.status);
    console.log(
      "🔵 Azure Blob Upload - Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const success = response.status === 201;
    console.log("🔵 Azure Blob Upload - Success:", success);

    return success;
  } catch (error) {
    console.error("❌ Error uploading to Azure Blob:", error);
    return false;
  }
};

/**
 * Confirmar que la subida fue exitosa
 */
export const confirmUpload = async (
  confirmData: ConfirmUploadRequest
): Promise<ConfirmUploadResponse> => {
  console.log("🟡 Confirm Upload - Sending data:", confirmData);
  console.log(
    "🟡 Confirm Upload - Endpoint:",
    API_CONFIG.endpoints.photos.confirmUpload
  );
  console.log("🟡 Confirm Upload - Method: POST");

  try {
    const result = await apiRequest<ConfirmUploadResponse>(
      "post",
      API_CONFIG.endpoints.photos.confirmUpload,
      "Error al confirmar subida de foto",
      confirmData
    );

    console.log("🟡 Confirm Upload - Success:", result);
    return result;
  } catch (error) {
    console.error("🟡 Confirm Upload - Error:", error);
    throw error;
  }
};

/**
 * Convertir URI de imagen a Blob para upload
 */
export const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

/**
 * Obtener el tamaño de archivo desde la URI
 */
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};

/**
 * Obtener las dimensiones de la imagen usando React Native Image.getSize
 */
export const getImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number }> => {
  try {
    // En React Native, usamos Image.getSize para obtener dimensiones
    const { Image } = await import("react-native");

    return new Promise((resolve) => {
      Image.getSize(
        uri,
        (width, height) => {
          resolve({ width, height });
        },
        (error) => {
          console.warn("Could not get image dimensions:", error);
          resolve({ width: 1200, height: 800 }); // Valores por defecto razonables
        }
      );
    });
  } catch (error) {
    console.warn("Error getting image dimensions:", error);
    return { width: 1200, height: 800 }; // Valores por defecto
  }
};

/**
 * Obtener información de la cámara/dispositivo
 */
export const getCameraInfo = async (): Promise<CameraInfo> => {
  try {
    // Importar Device dinámicamente para evitar errores si no está disponible
    const Device = await import("expo-device");

    return {
      make: Device.default?.manufacturer || "Mobile Device",
      model: Device.default?.modelName || "Unknown Device",
      datetime: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Could not get device info, using fallback:", error);
    return {
      make: "Mobile Device",
      model: "Unknown Device",
      datetime: new Date().toISOString(),
    };
  }
};
