import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/OfflineIndicator.styles";

interface OfflineIndicatorProps {
  isOffline: boolean;
  pendingCount?: number;
  isSyncing?: boolean;
  lastSyncTime?: Date | null;
  onSyncPress?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOffline,
  pendingCount = 0,
  isSyncing = false,
  lastSyncTime = null,
  onSyncPress,
}) => {
  // Si está online y no hay elementos pendientes, no mostrar
  if (!isOffline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  // Formatear fecha de última sincronización
  const formatLastSync = () => {
    if (!lastSyncTime) return "Nunca";

    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();

    // Si es menos de un minuto
    if (diff < 60000) {
      return "Hace unos segundos";
    }

    // Si es menos de una hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    }

    // Si es menos de un día
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }

    // Si es más de un día
    const days = Math.floor(diff / 86400000);
    return `Hace ${days} ${days === 1 ? "día" : "días"}`;
  };

  return (
    <View
      style={[
        styles.container,
        isOffline ? styles.offlineContainer : styles.onlineContainer,
      ]}
    >
      <View style={styles.infoContainer}>
        <Ionicons
          name={isOffline ? "cloud-offline" : "cloud-upload"}
          size={18}
          color={isOffline ? "#e74c3c" : "#3498db"}
          style={styles.icon}
        />

        <View>
          <Text style={styles.statusText}>
            {isOffline
              ? "Modo sin conexión"
              : isSyncing
              ? "Sincronizando..."
              : pendingCount > 0
              ? `${pendingCount} pendientes de sincronizar`
              : "Sincronizado"}
          </Text>

          {lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Última sincronización: {formatLastSync()}
            </Text>
          )}
        </View>
      </View>

      {!isOffline && pendingCount > 0 && !isSyncing && onSyncPress && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={onSyncPress}
          disabled={isSyncing}
        >
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.syncButtonText}>Sincronizar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default OfflineIndicator;
