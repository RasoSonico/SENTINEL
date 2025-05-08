import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ObraNavigationProp } from "../../../navigation/types";
import { Construction } from "../../../types/entities";
import { constructionService } from "../../../services";

const ObrasListScreen = () => {
  const navigation = useNavigation<ObraNavigationProp>();
  const [obras, setObras] = useState<Construction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObras = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await constructionService.getMyConstructions();
      setObras(response);
    } catch (err) {
      console.error("Error obteniendo obras:", err);
      setError("No se pudieron cargar las obras");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchObras();
  };

  const navigateToDetail = (obra: Construction) => {
    navigation.navigate("ObraDetail", {
      obraId: obra.id,
      title: obra.name,
    });
  };

  const renderObraItem = ({ item }: { item: Construction }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigateToDetail(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.start_date).toLocaleDateString()} -
            {new Date(item.end_date).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PLANNING":
        return "#FFB74D";
      case "IN_PROGRESS":
        return "#4CAF50";
      case "COMPLETED":
        return "#2196F3";
      case "SUSPENDED":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "PLANNING":
        return "Planificación";
      case "IN_PROGRESS":
        return "En Progreso";
      case "COMPLETED":
        return "Completada";
      case "SUSPENDED":
        return "Suspendida";
      default:
        return "Desconocido";
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0366d6" />
        <Text style={styles.loadingText}>Cargando obras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={obras}
        renderItem={renderObraItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Mis Obras</Text>
            <Text style={styles.subtitle}>
              {obras.length}{" "}
              {obras.length === 1 ? "obra asignada" : "obras asignadas"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchObras}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color="#9E9E9E" />
              <Text style={styles.emptyText}>No tienes obras asignadas</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFF",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  cardFooter: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    marginTop: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0366d6",
    borderRadius: 8,
  },
  retryText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ObrasListScreen;
