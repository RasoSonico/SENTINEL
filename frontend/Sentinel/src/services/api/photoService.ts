import { getTokenResponse } from "src/utils/auth";
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
  results: Array<{
    photo_id?: string;
    filename: string;
    upload_url?: string;
    blob_path?: string;
    expires_at?: string;
    success: boolean;
    error?: string;
  }>;
  total_requested: number;
  successful: number;
  failed: number;
}

export interface ConfirmUploadRequest {
  photo_id: string;
  upload_successful: boolean;
  error_message?: string;
}

export interface ConfirmUploadResponse {
  message: string;
  photo_id: string;
  status: string;
}

/**
 * Servicio para gestión de fotos de avances físicos
 */
class PhotoService {
  /**
   * Solicitar SAS token para subir una foto individual
   */
  async requestSingleUpload(
    photoData: PhotoUploadRequest
  ): Promise<PhotoUploadResponse> {
    return await apiRequest<PhotoUploadResponse>(
      "post",
      API_CONFIG.endpoints.photos.upload,
      "Error al solicitar token de subida",
      photoData
    );
  }

  /**
   * Solicitar SAS tokens para subir múltiples fotos
   */
  async requestBulkUpload(
    photosData: BulkUploadRequest
  ): Promise<BulkUploadResponse> {
    return await apiRequest<BulkUploadResponse>(
      "post",
      API_CONFIG.endpoints.photos.bulkUpload,
      "Error al solicitar tokens de subida múltiple",
      photosData
    );
  }

  /**
   * Subir archivo directamente a Azure Blob Storage
   */
  async uploadToAzureBlob(
    uploadUrl: string,
    fileData: Blob,
    contentType: string
  ): Promise<boolean> {
    try {
      const token = await getTokenResponse();
      const response = await apiRequest<Response>(
        "put",
        uploadUrl,
        "Error al subir archivo a Azure Blob",
        fileData,
        {
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": contentType,
            "Authorization": `Bearer ${token?.accessToken}`
          },
          raw: true,
        }
      );

      return response.status === 201; // Verificar si la subida fue exitosa
    } catch (error) {
      console.error("Error uploading to Azure Blob:", error);
      return false;
    }
  }

  /**
   * Confirmar que la subida fue exitosa
   */
  async confirmUpload(
    confirmData: ConfirmUploadRequest
  ): Promise<ConfirmUploadResponse> {
    return await apiRequest<ConfirmUploadResponse>(
      "post",
      API_CONFIG.endpoints.photos.confirmUpload,
      "Error al confirmar subida de foto",
      confirmData
    );
  }

  /**
   * Convertir URI de imagen a Blob para upload
   */
  async uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  }

  /**
   * Obtener el tamaño de archivo desde la URI
   */
  async getFileSize(uri: string): Promise<number> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;
    } catch (error) {
      console.error("Error getting file size:", error);
      return 0;
    }
  }
}

const photoService = new PhotoService();

export default photoService;
