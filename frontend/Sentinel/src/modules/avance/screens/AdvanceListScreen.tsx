import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
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
import { useAppSelector } from "../../../redux/hooks";
import { selectOfflineSync } from "../../../redux/slices/avance/advanceSlice";
import { PhysicalAdvanceResponse } from "../../../types/entities";
import {
  useAssignedConstruction,
  useCatalogsByConstruction,
  useAdvancesByCatalog,
} from "../../../hooks/data/query/useAvanceQueries";
import styles from "../styles/AdvanceListScreen.styles";

type AdvanceListScreenNavigationProp = StackNavigationProp<
  AvanceStackParamList,
  "AvancesList"
>;

const AdvanceListScreen: React.FC = () => {
  const navigation = useNavigation<AdvanceListScreenNavigationProp>();

  // Estados para filtros y UI
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Query para obtener la construcción asignada
  const {
    data: assignedConstruction,
    isLoading: loadingConstruction,
    error: constructionError,
    refetch: refetchConstruction,
  } = useAssignedConstruction();

  // Query para obtener catálogos de la construcción
  const {
    data: catalogs,
    isLoading: loadingCatalogs,
    error: catalogsError,
  } = useCatalogsByConstruction(
    assignedConstruction?.id ? parseInt(assignedConstruction.id) : null
  );

  // Obtener el primer catálogo disponible
  const mainCatalog = catalogs?.[0];

  // Preparar parámetros para query de avances
  const advanceParams = useMemo(() => {
    const statusParam =
      statusFilter !== "all"
        ? (statusFilter.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED")
        : undefined;

    return {
      catalogId: mainCatalog?.id || null,
      status: statusParam,
      page: 1,
      pageSize: 20,
    };
  }, [mainCatalog?.id, statusFilter]);

  // Query para obtener avances
  const {
    data: advancesData,
    isLoading: loadingAdvances,
    error: advancesError,
    refetch: refetchAdvances,
  } = useAdvancesByCatalog(advanceParams);

  // Calcular resumen localmente
  const localSummary = useMemo(() => {
    if (!advancesData?.advances) return null;

    const advances = advancesData.advances;
    return {
      total_advances: advances.length,
      pending_advances: advances.filter((a) => a.status === "PENDING").length,
      approved_advances: advances.filter((a) => a.status === "APPROVED").length,
      rejected_advances: advances.filter((a) => a.status === "REJECTED").length,
    };
  }, [advancesData?.advances]);

  // Obtener datos del estado global
  const offlineSyncState = useAppSelector(selectOfflineSync);

  // Estados para refresh
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Configurar el título de la pantalla
  useEffect(() => {
    if (assignedConstruction) {
      navigation.setOptions({
        title: `Avances: ${assignedConstruction.name}`,
      });
    }
  }, [assignedConstruction, navigation]);

  // Configurar el botón derecho para agregar avances
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

  // Logs para debugging siguiendo el estilo de Giovanni
  useEffect(() => {
    console.log("🔧 [DEBUG] AdvanceListScreen - States:", {
      loadingConstruction,
      constructionError: !!constructionError,
      assignedConstruction: !!assignedConstruction,
      loadingCatalogs,
      catalogsError: !!catalogsError,
      catalogsCount: catalogs?.length || 0,
      mainCatalog: !!mainCatalog,
      loadingAdvances,
      advancesError: !!advancesError,
      advancesCount: advancesData?.advances?.length || 0,
    });
  }, [
    loadingConstruction, constructionError, assignedConstruction,
    loadingCatalogs, catalogsError, catalogs,
    mainCatalog, loadingAdvances, advancesError, advancesData
  ]);

  useEffect(() => {
    if (assignedConstruction) {
      console.log("✅ [DEBUG] Construcción final a usar:", assignedConstruction);
    }
  }, [assignedConstruction]);

  useEffect(() => {
    if (catalogs) {
      console.log("📁 [DEBUG] Catalogs loaded:", catalogs);
    }
  }, [catalogs]);

  useEffect(() => {
    if (mainCatalog) {
      console.log("✅ [FLOW] Using catalog:", mainCatalog);
    }
  }, [mainCatalog]);

  useEffect(() => {
    if (advanceParams.catalogId) {
      console.log("🔍 [DEBUG] Advance params:", advanceParams);
    }
  }, [advanceParams]);

  useEffect(() => {
    if (advancesData) {
      console.log(
        "✅ [FLOW] Complete! Advances loaded:",
        advancesData.advances.length
      );
      console.log("📊 Calculated summary:", localSummary);
    }
  }, [advancesData, localSummary]);

  // Manejar la navegación al formulario de registro de avance
  const handleAddAdvance = () => {
    if (assignedConstruction) {
      navigation.navigate("AvanceRegistration", {
        constructionId: assignedConstruction.id,
        constructionName: assignedConstruction.name,
      });
    } else {
      Alert.alert(
        "Error",
        "No tienes una obra asignada para registrar avances.",
        [{ text: "Entendido", style: "default" }]
      );
    }
  };

  // Refrescar datos usando las queries
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Refrescar todas las queries en paralelo
      await Promise.all([
        refetchConstruction(),
        refetchAdvances(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchConstruction, refetchAdvances]);

  // Cargar más avances (simplificado por ahora)
  const handleLoadMore = useCallback(() => {
    // TODO: Implementar paginación con useInfiniteQuery
    console.log("Load more functionality - to be implemented");
  }, []);

  // Renderizar un elemento de avance
  const renderAdvanceItem = ({ item }: { item: PhysicalAdvanceResponse }) => (
    <TouchableOpacity
      style={styles.advanceItem}
      onPress={() => {
        // Navegar a detalle de avance (implementar después)
        Alert.alert(
          "Próximamente",
          "La vista de detalle de avance estará disponible pronto."
        );
      }}
    >
      <View style={styles.advanceHeader}>
        <View style={styles.conceptInfo}>
          <Text style={styles.conceptCode}>Concepto #{item.concept}</Text>
          <Text style={styles.conceptName}>Avance físico</Text>
        </View>

        {/* Estatus de aprobación */}
        <View
          style={[
            styles.statusChip,
            item.status === "APPROVED"
              ? styles.approvedChip
              : item.status === "REJECTED"
              ? styles.rejectedChip
              : styles.pendingChip,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "APPROVED"
                ? styles.approvedText
                : item.status === "REJECTED"
                ? styles.rejectedText
                : styles.pendingText,
            ]}
          >
            {item.status === "APPROVED"
              ? "Aprobado"
              : item.status === "REJECTED"
              ? "Rechazado"
              : "Pendiente"}
          </Text>
        </View>
      </View>

      <View style={styles.advanceDetails}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Volumen:</Text>
          <Text style={styles.quantityValue}>{item.volume}</Text>
        </View>

        <Text style={styles.dateText}>
          {format(new Date(item.date), "dd MMM yyyy", {
            locale: es,
          })}
        </Text>
      </View>

      {/* Comentarios si existen */}
      {item.comments && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Comentarios:</Text>
          <Text style={styles.notesText} numberOfLines={2}>
            {item.comments}
          </Text>
        </View>
      )}

      {/* Mostrar estado del programa - simplificado ya que no tenemos estos datos */}
      <View style={styles.programStatusContainer}>
        <ProgramStatusBadge
          status={item.status === "APPROVED" ? "completed" : "onSchedule"}
          compact={true}
        />
      </View>
    </TouchableOpacity>
  );

  // Renderizar el encabezado con resumen
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {assignedConstruction ? (
        <Text style={styles.constructionName}>{assignedConstruction.name}</Text>
      ) : (
        <Text style={styles.constructionName}>Mis Avances</Text>
      )}

      {loadingAdvances ? (
        <View style={styles.summaryLoading}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.summaryLoadingText}>Cargando resumen...</Text>
        </View>
      ) : localSummary ? (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {localSummary.total_advances}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {localSummary.pending_advances}
            </Text>
            <Text style={styles.summaryLabel}>Pendientes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {localSummary.approved_advances}
            </Text>
            <Text style={styles.summaryLabel}>Aprobados</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {localSummary.rejected_advances}
            </Text>
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
    if (!loadingAdvances) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3498db" />
        <Text style={styles.footerLoaderText}>Cargando más avances...</Text>
      </View>
    );
  };

  // Renderizar la vista de lista vacía o error
  const renderEmpty = () => {
    // Si estamos cargando la construcción, mostrar indicador de carga
    if (loadingConstruction) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando construcción...</Text>
        </View>
      );
    }

    // Si hay error al cargar la construcción
    if (constructionError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Error al cargar construcción</Text>
          <Text style={styles.errorSubtitle}>
            No se puede obtener la obra asignada
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchConstruction()}
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

    // Si estamos cargando catálogos
    if (loadingCatalogs) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando catálogos...</Text>
        </View>
      );
    }

    // Si hay error al cargar catálogos
    if (catalogsError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Error al cargar catálogos</Text>
          <Text style={styles.errorSubtitle}>
            No se pueden obtener los catálogos de la obra
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Si no hay catálogos
    if (!mainCatalog) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-outline" size={64} color="#7f8c8d" />
          <Text style={styles.emptyTitle}>No hay catálogos disponibles</Text>
          <Text style={styles.emptyDescription}>
            Esta obra no tiene catálogos configurados
          </Text>
        </View>
      );
    }

    // Si estamos cargando los avances
    if (loadingAdvances) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando avances...</Text>
        </View>
      );
    }

    // Si hay error al cargar los avances
    if (advancesError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Error al cargar avances</Text>
          <Text style={styles.errorSubtitle}>
            No se pueden obtener los avances del catálogo
          </Text>
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
        data={advancesData?.advances || []}
        renderItem={renderAdvanceItem}
        keyExtractor={(item) => item.id.toString()}
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
          !advancesData?.advances?.length
            ? styles.emptyListContent
            : styles.listContent
        }
      />
    </SafeAreaView>
  );
};

export default AdvanceListScreen;