import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ProgramStatusBadge from "../components/ProgramStatusBadge";
import OfflineIndicator from "../components/OfflineIndicator";
import { AvanceStackParamList } from "../../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchAdvancesByConstruction,
  fetchAdvanceSummary,
  selectAdvances,
  selectAdvanceSummary,
  selectOfflineSync,
} from "../../../redux/slices/avance/advanceSlice";
import { PhysicalAdvance, UserConstruction } from "../../../types/entities";
import { constructionService } from "../../../services/api/constructionService";

type AdvanceListScreenNavigationProp = StackNavigationProp<
  AvanceStackParamList,
  "AvancesList"
>;

const AdvanceListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<AdvanceListScreenNavigationProp>();

  // Estados para almacenar la información de la construcción asignada
  const [assignedConstruction, setAssignedConstruction] =
    useState<UserConstruction | null>(null);
  const [loadingConstruction, setLoadingConstruction] = useState<boolean>(true);
  const [constructionError, setConstructionError] = useState<string | null>(
    null
  );

  // Obtener datos del estado global
  const {
    items: advances,
    loading,
    error,
    page,
    pages,
  } = useAppSelector(selectAdvances);
  const { data: summary, loading: summaryLoading } =
    useAppSelector(selectAdvanceSummary);
  const offlineSyncState = useAppSelector(selectOfflineSync);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Cargar la construcción asignada al contratista
  useEffect(() => {
    const loadAssignedConstruction = async () => {
      try {
        setLoadingConstruction(true);
        setConstructionError(null);

        // Obtener la construcción asignada al contratista actual
        const assigned = await constructionService.getAssignedConstruction();
        setAssignedConstruction(assigned);

        // Si encontramos una construcción asignada, cargar sus avances
        if (assigned) {
          // Configurar el título de la pantalla con el nombre de la obra
          navigation.setOptions({
            title: `Avances: ${assigned.construction_details.name}`,
          });

          // Cargar los avances y el resumen
          dispatch(
            fetchAdvancesByConstruction({
              constructionId: assigned.construction_details.id,
              status: statusFilter !== "all" ? statusFilter : undefined,
              page: 1,
            })
          );

          dispatch(fetchAdvanceSummary(assigned.construction_details.id));
        }
      } catch (error) {
        console.error("Error al cargar construcción asignada:", error);
        setConstructionError("No se pudo cargar tu obra asignada");
      } finally {
        setLoadingConstruction(false);
      }
    };

    loadAssignedConstruction();
  }, [dispatch, statusFilter]);

  // Configurar el título de la pantalla y el botón derecho para agregar avances
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={handleAddAdvance}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, assignedConstruction]);

  // Manejar la navegación al formulario de registro de avance
  const handleAddAdvance = () => {
    if (!assignedConstruction) {
      navigation.navigate("AvanceRegistration", {
        constructionId: assignedConstruction?.construction_details?.id ?? 1,
        constructionName: assignedConstruction?.construction_details?.name ?? "Obra sin nombre",
      });
    } else {
      Alert.alert(
        "Error",
        "No tienes una obra asignada para registrar avances.",
        [{ text: "Entendido", style: "default" }]
      );
    }
  };

  // Refrescar datos
  const handleRefresh = useCallback(() => {
    if (!assignedConstruction) return;

    setRefreshing(true);

    Promise.all([
      dispatch(
        fetchAdvancesByConstruction({
          constructionId: assignedConstruction.construction_details.id,
          status: statusFilter !== "all" ? statusFilter : undefined,
          page: 1,
        })
      ),
      dispatch(
        fetchAdvanceSummary(assignedConstruction.construction_details.id)
      ),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch, assignedConstruction, statusFilter]);

  // Cargar más avances
  const handleLoadMore = useCallback(() => {
    if (!assignedConstruction || loading || page >= pages) return;

    dispatch(
      fetchAdvancesByConstruction({
        constructionId: assignedConstruction.construction_details.id,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: page + 1,
      })
    );
  }, [dispatch, assignedConstruction, statusFilter, loading, page, pages]);

  // Renderizar un elemento de avance
  const renderAdvanceItem = ({ item }: { item: PhysicalAdvance }) => (
    <TouchableOpacity
      style={styles.advanceItem}
      onPress={() => {
        // Navegar a detalle de avance (implementar después)
        // navigation.navigate('AvanceDetail', { avanceId: item.id, title: 'Detalle de Avance' });
        Alert.alert(
          "Próximamente",
          "La vista de detalle de avance estará disponible pronto."
        );
      }}
    >
      <View style={styles.advanceHeader}>
        <View style={styles.conceptInfo}>
          <Text style={styles.conceptCode}>{item.concept_code}</Text>
          <Text style={styles.conceptName}>{item.concept_name}</Text>
        </View>

        {/* Estatus de aprobación */}
        <View
          style={[
            styles.statusChip,
            item.status === "approved"
              ? styles.approvedChip
              : item.status === "rejected"
              ? styles.rejectedChip
              : styles.pendingChip,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "approved"
                ? styles.approvedText
                : item.status === "rejected"
                ? styles.rejectedText
                : styles.pendingText,
            ]}
          >
            {item.status === "approved"
              ? "Aprobado"
              : item.status === "rejected"
              ? "Rechazado"
              : "Pendiente"}
          </Text>
        </View>
      </View>

      <View style={styles.advanceDetails}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cantidad:</Text>
          <Text style={styles.quantityValue}>
            {item.quantity} {item.concept_unit}
          </Text>
        </View>

        <Text style={styles.dateText}>
          {format(new Date(item.created_at), "dd MMM yyyy HH:mm", {
            locale: es,
          })}
        </Text>
      </View>

      {/* Miniatura de la primera foto */}
      {item.photos && item.photos.length > 0 && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: item.photos[0].url }}
            style={styles.photoThumbnail}
          />
          {item.photos.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>
                +{item.photos.length - 1}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Notas si existen */}
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notas:</Text>
          <Text style={styles.notesText} numberOfLines={2}>
            {item.notes}
          </Text>
        </View>
      )}

      {/* Mostrar estado del programa */}
      <View style={styles.programStatusContainer}>
        <ProgramStatusBadge
          status={
            item.is_completed
              ? "completed"
              : item.program_status === "ahead"
              ? "ahead"
              : item.program_status === "delayed"
              ? "delayed"
              : "onSchedule"
          }
          compact={true}
        />
      </View>
    </TouchableOpacity>
  );

  // Renderizar el encabezado con resumen
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {assignedConstruction ? (
        <Text style={styles.constructionName}>
          {assignedConstruction.construction_details.name}
        </Text>
      ) : (
        <Text style={styles.constructionName}>Mis Avances</Text>
      )}

      {summaryLoading ? (
        <View style={styles.summaryLoading}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.summaryLoadingText}>Cargando resumen...</Text>
        </View>
      ) : summary ? (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.total_advances}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.pending_advances}</Text>
            <Text style={styles.summaryLabel}>Pendientes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.approved_advances}</Text>
            <Text style={styles.summaryLabel}>Aprobados</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.rejected_advances}</Text>
            <Text style={styles.summaryLabel}>Rechazados</Text>
          </View>
        </View>
      ) : null}

      {/* Filtros de estado */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "all" && styles.activeFilterChip,
          ]}
          onPress={() => setStatusFilter("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "all" && styles.activeFilterChipText,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "pending" && styles.activeFilterChip,
          ]}
          onPress={() => setStatusFilter("pending")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "pending" && styles.activeFilterChipText,
            ]}
          >
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "approved" && styles.activeFilterChip,
          ]}
          onPress={() => setStatusFilter("approved")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "approved" && styles.activeFilterChipText,
            ]}
          >
            Aprobados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "rejected" && styles.activeFilterChip,
          ]}
          onPress={() => setStatusFilter("rejected")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "rejected" && styles.activeFilterChipText,
            ]}
          >
            Rechazados
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar el pie de la lista (loader)
  const renderFooter = () => {
    if (!loading || page === 1) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3498db" />
        <Text style={styles.footerLoaderText}>Cargando más avances...</Text>
      </View>
    );
  };

  // Renderizar la vista de lista vacía o error
  const renderEmpty = () => {
    // Si estamos cargando la construcción o los avances, mostrar indicador de carga
    if (loadingConstruction || (loading && page === 1)) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      );
    }

    // Si hay error al cargar la construcción
    if (constructionError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>{constructionError}</Text>
          <Text style={styles.errorSubtitle}>
            No se pueden mostrar avances sin una obra asignada
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoadingConstruction(true);
              constructionService
                .getAssignedConstruction()
                .then(setAssignedConstruction)
                .catch(() =>
                  setConstructionError("No se pudo cargar tu obra asignada")
                )
                .finally(() => setLoadingConstruction(false));
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Si no hay una construcción asignada
    if (!assignedConstruction) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color="#7f8c8d" />
          <Text style={styles.emptyTitle}>No tienes obras asignadas</Text>
          <Text style={styles.emptyDescription}>
            Contacta con tu administrador para que te asigne una obra
          </Text>
        </View>
      );
    }

    // Si hay error al cargar los avances
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Error al cargar avances</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Si no hay avances registrados para esta obra
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
        <Text style={styles.emptyTitle}>No hay avances registrados</Text>
        <Text style={styles.emptyDescription}>
          No se encontraron avances para los filtros seleccionados
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddAdvance}>
          <Text style={styles.emptyButtonText}>Registrar avance</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Indicador de modo offline */}
      <View style={styles.indicatorContainer}>
        <OfflineIndicator
          isOffline={!offlineSyncState.isOnline}
          pendingCount={offlineSyncState.pendingCount}
          isSyncing={offlineSyncState.isSyncing}
          lastSyncTime={
            offlineSyncState.lastSyncTime
              ? new Date(offlineSyncState.lastSyncTime)
              : null
          }
          onSyncPress={() => {
            // Implementar forzar sincronización
          }}
        />
      </View>

      <FlatList
        data={advances}
        renderItem={renderAdvanceItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3498db"]}
            tintColor="#3498db"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={
          advances.length === 0 ? styles.emptyListContent : styles.listContent
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  indicatorContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  constructionName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // Estilos para el resumen
  summaryContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLoading: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  summaryLoadingText: {
    marginLeft: 8,
    color: "#7f8c8d",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3498db",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
  },

  // Estilos para los filtros
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ecf0f1",
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: "#3498db",
  },
  filterChipText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  activeFilterChipText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Estilos para los elementos de avance
  advanceItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  advanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  conceptInfo: {
    flex: 1,
  },
  conceptCode: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  conceptName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  pendingChip: {
    backgroundColor: "#f39c1240",
  },
  approvedChip: {
    backgroundColor: "#2ecc7140",
  },
  rejectedChip: {
    backgroundColor: "#e74c3c40",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pendingText: {
    color: "#f39c12",
  },
  approvedText: {
    color: "#2ecc71",
  },
  rejectedText: {
    color: "#e74c3c",
  },
  advanceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginRight: 4,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  photoContainer: {
    position: "relative",
    marginBottom: 12,
  },
  photoThumbnail: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  notesText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  programStatusContainer: {
    alignItems: "flex-start",
  },

  // Estilos para el footer loader
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  footerLoaderText: {
    marginLeft: 8,
    color: "#7f8c8d",
  },

  // Estilos para la vista vacía
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7f8c8d",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Estilos para errores
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Estilos para carga
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 12,
  },
});

export default AdvanceListScreen;
