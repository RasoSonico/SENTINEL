import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import {
  selectIncidents,
  selectIncidentCatalogs,
  selectIncidentFilters,
  fetchIncidents,
  fetchIncidentTypes,
  fetchIncidentClassifications,
  setFilters,
  setPage,
} from "../../../redux/slices/incidencia/incidenciaSlice";
import {
  setTypesById,
  setClassificationsById,
} from "../../../redux/slices/incidencia/incidenciaFormDataSlice";
import { Incident } from "../../../types/incidencia";
import { IncidentListScreenNavigationProp } from "../../../navigation/types";
import IncidentCard from "../components/IncidentCard";
import styles from "../styles/IncidentListScreen.styles";
import { DesignTokens } from "../../../styles/designTokens";

const IncidentListScreen: React.FC = () => {
  const navigation = useNavigation<IncidentListScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Estados de Redux
  const incidents = useAppSelector(selectIncidents);
  const catalogs = useAppSelector(selectIncidentCatalogs);
  const filters = useAppSelector(selectIncidentFilters);

  // Estados locales para filtros UI
  const [classificationFilter, setClassificationFilter] = useState<
    "all" | number
  >("all");

  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos en paralelo para mejor rendimiento
  useEffect(() => {
    const loadInitialData = async () => {
      const promises = [];

      // Solo cargar si no existen
      if (catalogs.types.items.length === 0) {
        promises.push(
          dispatch(fetchIncidentTypes()).then((result) => {
            if (fetchIncidentTypes.fulfilled.match(result)) {
              dispatch(setTypesById(result.payload));
            }
          })
        );
      }

      if (catalogs.classifications.items.length === 0) {
        promises.push(
          dispatch(fetchIncidentClassifications()).then((result) => {
            if (fetchIncidentClassifications.fulfilled.match(result)) {
              dispatch(setClassificationsById(result.payload));
            }
          })
        );
      }

      // Cargar incidencias en paralelo
      promises.push(dispatch(fetchIncidents(filters)));

      // Ejecutar todas las promesas en paralelo
      await Promise.all(promises);
    };

    loadInitialData();
  }, [dispatch]);

  // Recargar incidencias solo cuando cambien los filtros (no en mount inicial)
  useEffect(() => {
    // Skip primera carga que ya se hace en el useEffect anterior
    if (
      catalogs.types.items.length > 0 ||
      catalogs.classifications.items.length > 0
    ) {
      dispatch(fetchIncidents(filters));
    }
  }, [filters]);

  // Función para refrescar la lista
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchIncidents(filters));
    setRefreshing(false);
  }, [dispatch, filters]);

  // Función para cargar más incidencias (paginación)
  const loadMore = useCallback(() => {
    if (!incidents.loading && incidents.hasNextPage) {
      dispatch(setPage(incidents.page + 1));
    }
  }, [dispatch, incidents.loading, incidents.hasNextPage, incidents.page]);

  // Función para manejar cambio de filtro de clasificación
  const handleClassificationFilterChange = useCallback(
    (value: "all" | number) => {
      setClassificationFilter(value);

      const newFilters = {
        ...filters,
        clasification: value === "all" ? undefined : value,
        page: 1, // Reset to first page
      };

      dispatch(setFilters(newFilters));
    },
    [dispatch, filters]
  );

  // Función para navegar al detalle de incidencia
  const handleIncidentPress = useCallback(
    (incident: Incident) => {
      navigation.navigate("IncidentDetail", { incident });
    },
    [navigation]
  );

  // Función para navegar a registro de nueva incidencia
  const handleNewIncident = useCallback(() => {
    navigation.navigate("IncidentRegistration");
  }, [navigation]);

  // Render del item de la lista
  const renderIncidentItem = useCallback(
    ({ item }: { item: Incident }) => (
      <IncidentCard incident={item} onPress={handleIncidentPress} />
    ),
    [handleIncidentPress]
  );

  // Render del footer de la lista (loading más items)
  const renderFooter = useCallback(() => {
    if (!incidents.loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator
          size="small"
          color={DesignTokens.colors.primary[500]}
        />
        <Text style={styles.footerText}>Cargando más incidencias...</Text>
      </View>
    );
  }, [incidents.loading]);

  // Memoizar chips de filtro para evitar re-renders innecesarios
  const filterChips = useMemo(() => {
    return catalogs.classifications.items.map((classification) => ({
      id: classification.id,
      name: classification.name,
      isActive: classificationFilter === classification.id,
    }));
  }, [catalogs.classifications.items, classificationFilter]);

  // Componente memoizado para cada chip de filtro
  const FilterChip = memo(
    ({
      id,
      name,
      isActive,
      onPress,
    }: {
      id: number;
      name: string;
      isActive: boolean;
      onPress: (id: number) => void;
    }) => (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => onPress(id)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {name}
        </Text>
      </TouchableOpacity>
    )
  );

  // Render del header con filtros optimizado
  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Incidencias</Text>

        {/* Filter buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              classificationFilter === "all" && styles.filterButtonActive,
            ]}
            onPress={() => handleClassificationFilterChange("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                classificationFilter === "all" && styles.filterButtonTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          {filterChips.map((chip) => (
            <FilterChip
              key={chip.id}
              id={chip.id}
              name={chip.name}
              isActive={chip.isActive}
              onPress={handleClassificationFilterChange}
            />
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {incidents.total} incidencia{incidents.total !== 1 ? "s" : ""}{" "}
            encontrada{incidents.total !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    ),
    [
      classificationFilter,
      filterChips,
      incidents.total,
      handleClassificationFilterChange,
    ]
  );

  // Loading inicial
  if (incidents.loading && incidents.items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={DesignTokens.colors.primary[500]}
        />
        <Text style={styles.loadingText}>Cargando incidencias...</Text>
      </View>
    );
  }

  // Error state
  if (incidents.error && incidents.items.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Error al cargar incidencias</Text>
        <Text style={styles.errorMessage}>{incidents.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={incidents.items}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[DesignTokens.colors.primary[500]]}
            tintColor={DesignTokens.colors.primary[500]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          incidents.items.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          !incidents.loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No hay incidencias</Text>
              <Text style={styles.emptyMessage}>
                Aún no se han registrado incidencias para mostrar
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewIncident}
        activeOpacity={0.8}
      >
        <Ionicons
          name="add"
          size={24}
          color={DesignTokens.colors.background.primary}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default IncidentListScreen;
