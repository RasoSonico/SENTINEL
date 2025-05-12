import apiClient from "../../../services/api/apiClient";
import * as FileSystem from "expo-file-system";

// Interfaz para respuesta de carga de imagen
export interface PhotoUploadResponse {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileSize: number;
  width: number;
  height: number;
  contentType: string;
  createdAt: string;
}

/**
 * Servicio para gestión de fotos
 */
class PhotoService {
  /**
   * Subir una foto al servidor
   * @param uri URI de la foto a subir
   * @param type Tipo de entidad relacionada ('advance', 'estimation', etc.)
   * @param entityId ID de la entidad relacionada
   * @param metadata Metadatos adicionales
   * @returns Información de la foto subida
   */
  async uploadPhoto(
    uri: string,
    type: "advance" | "estimation" | "issue" | "general",
    entityId?: string,
    metadata?: Record<string, any>
  ): Promise<PhotoUploadResponse> {
    try {
      // Crear un formData para la carga multipart
      const formData = new FormData();

      // Extraer nombre de archivo de la URI
      const fileNameMatch = uri.match(/[\w-]+\.(jpg|jpeg|png)$/i);
      const fileName = fileNameMatch
        ? fileNameMatch[0]
        : `photo-${Date.now()}.jpg`;

      // Añadir archivo
      formData.append("file", {
        uri,
        name: fileName,
        type: "image/jpeg",
      } as any);

      // Añadir metadatos
      formData.append("type", type);
      if (entityId) {
        formData.append("entity_id", entityId);
      }

      // Añadir metadatos adicionales si existen
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          formData.append(
            key,
            typeof value === "string" ? value : JSON.stringify(value)
          );
        });
      }

      const response = await apiClient.post("/media/photos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error al subir foto:", error);
      throw error;
    }
  }

  /**
   * Subir varias fotos al servidor
   * @param uris URIs de las fotos a subir
   * @param type Tipo de entidad relacionada
   * @param entityId ID de la entidad relacionada
   * @param metadata Metadatos adicionales
   * @returns Información de las fotos subidas
   */
  async uploadMultiplePhotos(
    uris: string[],
    type: "advance" | "estimation" | "issue" | "general",
    entityId?: string,
    metadata?: Record<string, any>
  ): Promise<PhotoUploadResponse[]> {
    try {
      // Subir fotos en paralelo
      const uploadPromises = uris.map((uri) =>
        this.uploadPhoto(uri, type, entityId, metadata)
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error al subir múltiples fotos:", error);
      throw error;
    }
  }

  /**
   * Eliminar una foto del servidor
   * @param photoId ID de la foto a eliminar
   * @returns true si se eliminó correctamente
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/media/photos/${photoId}/`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar foto ${photoId}:`, error);
      throw error;
    }
  }

  /**
   * Guardar foto localmente
   * @param uri URI de la foto
   * @param fileName Nombre de archivo opcional
   * @returns URI local de la foto guardada
   */
  async savePhotoLocally(uri: string, fileName?: string): Promise<string> {
    try {
      const directory = `${FileSystem.documentDirectory}sentinel-photos/`;

      // Verificar si el directorio existe
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      // Generar nombre de archivo si no se proporciona
      const name = fileName || `photo-${Date.now()}.jpg`;
      const localUri = `${directory}${name}`;

      // Copiar archivo
      await FileSystem.copyAsync({
        from: uri,
        to: localUri,
      });

      return localUri;
    } catch (error) {
      console.error("Error al guardar foto localmente:", error);
      throw error;
    }
  }

  /**
   * Eliminar foto local
   * @param uri URI local de la foto a eliminar
   * @returns true si se eliminó correctamente
   */
  async deleteLocalPhoto(uri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error al eliminar foto local ${uri}:`, error);
      throw error;
    }
  }

  /**
   * Obtener URI de foto en caché si existe
   * @param photoId ID de la foto
   * @returns URI local si existe, null en caso contrario
   */
  async getCachedPhotoUri(photoId: string): Promise<string | null> {
    try {
      const directory = `${FileSystem.documentDirectory}sentinel-photos/`;
      const localUri = `${directory}${photoId}.jpg`;

      const fileInfo = await FileSystem.getInfoAsync(localUri);
      return fileInfo.exists ? localUri : null;
    } catch (error) {
      console.error(`Error al obtener URI de foto en caché ${photoId}:`, error);
      return null;
    }
  }
}

export default new PhotoService();
