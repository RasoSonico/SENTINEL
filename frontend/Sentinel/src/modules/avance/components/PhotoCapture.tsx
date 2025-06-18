import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Photo } from "../../../hooks/avance/usePhotoCapture";

interface PhotoCaptureProps {
  photos: Photo[];
  loading: boolean;
  maxPhotos?: number;
  onTakePhoto: () => void;
  onPickImage: () => void;
  onRemovePhoto: (photoId: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  photos,
  loading,
  maxPhotos = 5,
  onTakePhoto,
  onPickImage,
  onRemovePhoto,
}) => {
  // Verificar si se alcanzó el límite de fotos
  const hasReachedLimit = photos.length >= maxPhotos;

  // Mostrar diálogo de opciones para añadir foto
  const handleAddPhoto = () => {
    if (hasReachedLimit) {
      Alert.alert(
        "Límite alcanzado",
        `Solo puedes añadir hasta ${maxPhotos} fotos.`,
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }

    Alert.alert("Añadir foto", "¿Cómo quieres añadir la foto?", [
      {
        text: "Tomar foto",
        onPress: onTakePhoto,
      },
      {
        text: "Seleccionar de galería",
        onPress: onPickImage,
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  // Confirmar eliminación de foto
  const handleRemovePhoto = (photoId: string) => {
    Alert.alert(
      "Eliminar foto",
      "¿Estás seguro de que quieres eliminar esta foto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onRemovePhoto(photoId),
        },
      ]
    );
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Evidencia fotográfica</Text>
        <Text style={styles.subtitle}>
          {photos.length} de {maxPhotos} fotos
        </Text>
      </View>

      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosContainer}
        >
          {/* Lista de fotos */}
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />

              {/* Indicador de sincronización */}
              {photo.synced ? (
                <View style={styles.syncedIndicator}>
                  <Ionicons name="cloud-done" size={12} color="#fff" />
                </View>
              ) : null}

              {/* Botón para eliminar foto */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(photo.id)}
              >
                <Ionicons name="close-circle" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Botón para añadir más fotos si no se alcanzó el límite */}
          {!hasReachedLimit && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
              disabled={loading}
            >
              <Ionicons name="add" size={32} color="#3498db" />
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        // Vista cuando no hay fotos
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={handleAddPhoto}
          disabled={loading}
        >
          <Ionicons name="camera-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>Toca para añadir fotos</Text>
          <Text style={styles.emptySubtext}>
            Añade evidencia fotográfica del avance realizado
          </Text>
        </TouchableOpacity>
      )}

      {/* Indicador de carga */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  photosContainer: {
    padding: 4,
  },
  photoContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  syncedIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#27ae60",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#3498db",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
  },
  emptyContainer: {
    borderWidth: 2,
    borderColor: "#bdc3c7",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    height: 150,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
});

export default PhotoCapture;
