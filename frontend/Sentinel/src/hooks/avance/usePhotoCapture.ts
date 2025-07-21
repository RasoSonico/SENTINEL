import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export interface Photo {
  id: string;
  uri: string;
  localUri: string; // Uri para almacenamiento local
  timestamp: number;
  filename: string; // Nombre personalizable de la foto
  location?: {
    latitude: number;
    longitude: number;
  };
  synced: boolean;
}

interface UsePhotoCaptureProps {
  maxPhotos?: number;
  compressionQuality?: number;
  includeLocation?: boolean;
  locationData?: { latitude: number; longitude: number } | null;
  partidaName?: string;
  conceptName?: string;
}

/**
 * Hook personalizado para gestionar la captura de fotos
 */
export const usePhotoCapture = ({
  maxPhotos = 5,
  compressionQuality = 0.7,
  includeLocation = true,
  locationData = null,
  partidaName = "",
  conceptName = "",
}: UsePhotoCaptureProps = {}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  /**
   * Genera un nombre automático para la foto basado solo en partida
   */
  const generateAutoFilename = (photoIndex: number): string => {
    // Limpiar nombre de partida para que sea seguro para archivos
    const cleanPartida = partidaName.replace(/[^a-zA-Z0-9]/g, "") || "Partida";
    const numero = String(photoIndex + 1).padStart(2, "0");

    return `${cleanPartida}_${numero}.jpg`;
  };

  // Solicitar permisos al montar el componente
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") {
        Alert.alert(
          "Se requieren permisos",
          "Necesitamos acceso a la cámara para capturar evidencia fotográfica.",
          [{ text: "Entendido", style: "default" }]
        );
      }
    })();
  }, []);

  /**
   * Optimiza una imagen antes de guardarla
   */
  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }], // Redimensionar a máximo 1200px de ancho
        { compress: compressionQuality, format: SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error("Error al optimizar imagen:", error);
      return uri; // En caso de error, devolver la URI original
    }
  };

  /**
   * Guarda una imagen localmente para disponibilidad offline
   */
  const saveImageLocally = async (uri: string): Promise<string> => {
    try {
      const fileName = `sentinel-photo-${Date.now()}.jpg`;
      const directory = `${FileSystem.documentDirectory}photos/`;

      // Asegurarse de que el directorio existe
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const localUri = `${directory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: localUri });
      return localUri;
    } catch (error) {
      console.error("Error al guardar imagen localmente:", error);
      return uri; // En caso de error, devolver la URI original
    }
  };

  /**
   * Toma una foto usando la cámara
   */
  const takePhoto = async () => {
    if (!hasPermission) {
      Alert.alert(
        "Permiso denegado",
        "No tienes permisos para acceder a la cámara.",
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }

    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Límite alcanzado",
        `Solo puedes tomar hasta ${maxPhotos} fotos.`,
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }

    try {
      setLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1, // Calidad máxima inicial, optimizaremos después
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        const optimizedUri = await optimizeImage(photoUri);
        const localUri = await saveImageLocally(optimizedUri);

        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          uri: optimizedUri,
          localUri,
          timestamp: Date.now(),
          filename: generateAutoFilename(photos.length),
          synced: false,
        };

        // Añadir ubicación si está disponible y solicitada
        if (includeLocation && locationData) {
          newPhoto.location = {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          };
        }

        setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert(
        "Error al capturar",
        "No se pudo tomar la foto. Intenta de nuevo.",
        [{ text: "Entendido", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Selecciona una imagen de la galería
   */
  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Límite alcanzado",
        `Solo puedes seleccionar hasta ${maxPhotos} fotos.`,
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }

    try {
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        const optimizedUri = await optimizeImage(photoUri);
        const localUri = await saveImageLocally(optimizedUri);

        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          uri: optimizedUri,
          localUri,
          timestamp: Date.now(),
          filename: generateAutoFilename(photos.length),
          synced: false,
        };

        // Añadir ubicación si está disponible y solicitada
        if (includeLocation && locationData) {
          newPhoto.location = {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          };
        }

        setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert(
        "Error al seleccionar",
        "No se pudo seleccionar la imagen. Intenta de nuevo.",
        [{ text: "Entendido", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una foto por su ID
   */
  const removePhoto = (photoId: string) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.id !== photoId)
    );
  };

  /**
   * Elimina todas las fotos
   */
  const clearPhotos = () => {
    setPhotos([]);
  };

  /**
   * Marca una foto como sincronizada
   */
  const markPhotoAsSynced = (photoId: string) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, synced: true } : photo
      )
    );
  };

  /**
   * Actualiza el nombre de una foto
   */
  const updatePhotoFilename = (photoId: string, newFilename: string) => {
    // Sanitizar el nuevo nombre
    const sanitizedFilename = newFilename.replace(/[^a-zA-Z0-9._-]/g, "_");

    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, filename: sanitizedFilename } : photo
      )
    );
  };

  return {
    photos,
    loading,
    hasPermission,
    takePhoto,
    pickImage,
    removePhoto,
    clearPhotos,
    markPhotoAsSynced,
    updatePhotoFilename,
  };
};
