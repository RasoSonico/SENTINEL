import React, {
  useState,
  useEffect,
  useDeferredValue,
  useCallback,
  useMemo,
} from "react";
import debounce from "lodash.debounce";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Concept, WorkItem } from "../../../types/entities";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchAvailableConcepts,
  selectAvailableConcepts,
} from "../../../redux/slices/advanceSlice";
import styles from "./ConceptSelector.styles";

// Interfaz extendida para información adicional que necesitamos en la UI
interface ConceptWithProgress extends Concept {
  // Propiedades adicionales que obtendremos del backend o calcularemos
  executed_quantity?: number;
  work_item_name?: string;
}

interface ConceptSelectorProps {
  constructionId: string;
  onSelectConcept: (concept: Concept) => void;
  selectedConcept?: Concept | null;
}

const ConceptSelector: React.FC<ConceptSelectorProps> = ({
  constructionId,
  onSelectConcept,
  selectedConcept,
}) => {
  const dispatch = useAppDispatch();
  const { items, loading, error, total, page, pages } = useAppSelector(
    selectAvailableConcepts
  );

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [workItemFilter, setWorkItemFilter] = useState<string | undefined>(
    undefined
  );
  const [showSelector, setShowSelector] = useState(false);
  const [conceptsWithProgress, setConceptsWithProgress] = useState<
    ConceptWithProgress[]
  >([]);
  const [selectedConceptProgress, setSelectedConceptProgress] = useState<{
    executed_quantity: number;
    work_item_name: string;
  }>({ executed_quantity: 0, work_item_name: "" });

  // Cargar conceptos disponibles al montar el componente o cuando cambian los filtros
  useEffect(() => {
    if (!showSelector) return;
    const debouncedFetch = debounce(() => {
      dispatch(
        fetchAvailableConcepts({
          constructionId,
          workItemId: workItemFilter,
          query: deferredSearchQuery,
          page: 1,
        })
      );
    }, 300);

    debouncedFetch();

    return () => debouncedFetch.cancel();
  }, [
    dispatch,
    constructionId,
    workItemFilter,
    deferredSearchQuery,
    showSelector,
  ]);

  // Transformar conceptos para añadir información de progreso
  useEffect(() => {
    // Función que podría llamar a una API para obtener el progreso
    // En este caso simulamos datos
    const getProgressInfo = (concepts: Concept[]) => {
      // Aquí deberías hacer una llamada API para obtener el progreso real
      // Por ahora simulamos datos de progreso
      return concepts.map((concept) => ({
        ...concept,
        executed_quantity: 0, // Valor temporal, reemplazar con datos reales
        work_item_name: concept.work_item || "Partida", // Usar work_item o un valor por defecto
      }));
    };

    if (items.length > 0) {
      setConceptsWithProgress(getProgressInfo(items));
    } else {
      setConceptsWithProgress([]);
    }
  }, [items]);

  useEffect(() => {
    if (selectedConcept) {
      // Aquí deberías hacer una llamada API para obtener el progreso real
      // Por ahora usamos valores temporales
      setSelectedConceptProgress({
        executed_quantity: 0, // Valor temporal
        work_item_name: selectedConcept.work_item || "Partida", // Usar work_item o un valor por defecto
      });
    }
  }, [selectedConcept]);

  // Cargar más conceptos al llegar al final de la lista
  const handleLoadMore = useCallback(() => {
    if (loading || page >= pages) return;
    dispatch(
      fetchAvailableConcepts({
        constructionId,
        workItemId: workItemFilter,
        query: searchQuery,
        page: page + 1,
      })
    );
  }, [
    loading,
    page,
    pages,
    dispatch,
    constructionId,
    workItemFilter,
    searchQuery,
  ]);

  // Manejar la selección de un concepto
  const handleSelectConcept = useCallback(
    (concept: Concept) => {
      onSelectConcept(concept);
      setShowSelector(false);
    },
    [onSelectConcept]
  );

  // Renderizar un elemento de la lista de conceptos
  const renderConceptItem = useCallback(
    ({ item }: { item: ConceptWithProgress }) => {
      const executed = item.executed_quantity || 0;
      const remaining = item.quantity - executed;
      const progressPercentage = (executed / item.quantity) * 100;
      return (
        <TouchableOpacity
          style={styles.conceptItem}
          onPress={() => handleSelectConcept(item)}
          accessible
          accessibilityLabel={`Seleccionar concepto ${item.code} ${item.description}`}
        >
          <View style={styles.conceptInfo}>
            <Text style={styles.conceptCode}>{item.code}</Text>
            <Text style={styles.conceptName}>{item.description}</Text>
            <Text style={styles.conceptDetails}>
              {item.work_item_name} • {item.unit} • Restante: {remaining}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor:
                    progressPercentage >= 90 ? "#e74c3c" : "#3498db",
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelectConcept]
  );

  // Separador
  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  // Footer
  const renderFooter = useCallback(() => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3498db" />
      </View>
    );
  }, [loading, page]);

  // Empty
  const renderEmpty = useCallback(() => {
    if (loading && page === 1) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color="#bdc3c7" />
        <Text style={styles.emptyText}>
          No se encontraron conceptos disponibles
        </Text>
        <Text style={styles.emptySubtext}>
          Intenta con otros criterios de búsqueda
        </Text>
      </View>
    );
  }, [loading, page]);

  // Error feedback
  const renderError = useCallback(() => {
    if (!error) return null;
    return (
      <View
        style={{
          padding: 12,
          backgroundColor: "#fdecea",
          borderRadius: 8,
          margin: 8,
        }}
      >
        <Text style={{ color: "#e74c3c", fontWeight: "600" }}>
          Error: {error}
        </Text>
      </View>
    );
  }, [error]);

  // Memoize contentContainerStyle
  const contentContainerStyle = useMemo(
    () =>
      conceptsWithProgress.length === 0 ? { flex: 1 } : styles.listContent,
    [conceptsWithProgress.length]
  );

  return (
    <View style={styles.container}>
      {/* Vista de concepto seleccionado (si hay) */}
      {selectedConcept && !showSelector ? (
        <View style={styles.selectedConceptContainer}>
          <View style={styles.selectedConceptInfo}>
            <Text style={styles.selectedConceptCode}>
              {selectedConcept.code}
            </Text>
            <Text style={styles.selectedConceptName}>
              {selectedConcept.description}
            </Text>
            {/* Usar description en lugar de name */}
            <Text style={styles.selectedConceptDetails}>
              {selectedConceptProgress.work_item_name} • {selectedConcept.unit}
            </Text>
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Avance: </Text>
              <Text style={styles.quantityValue}>
                {selectedConceptProgress.executed_quantity} /{" "}
                {selectedConcept.quantity} {selectedConcept.unit}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowSelector(true)}
            accessible
            accessibilityLabel="Cambiar concepto seleccionado"
          >
            <Text style={styles.changeButtonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Botón para mostrar selector */}
          {!showSelector && (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowSelector(true)}
              accessible
              accessibilityLabel="Seleccionar concepto"
            >
              <Ionicons name="construct-outline" size={20} color="#3498db" />
              <Text style={styles.selectButtonText}>Seleccionar concepto</Text>
            </TouchableOpacity>
          )}

          {/* Selector desplegado */}
          {showSelector && (
            <View style={styles.selectorContainer}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar concepto por descripción o código..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  accessible
                  accessibilityLabel="Buscar concepto"
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    dispatch(
                      fetchAvailableConcepts({
                        constructionId,
                        workItemId: workItemFilter,
                        query: searchQuery,
                        page: 1,
                      })
                    );
                  }}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => {
                    dispatch(
                      fetchAvailableConcepts({
                        constructionId,
                        workItemId: workItemFilter,
                        query: searchQuery,
                        page: 1,
                      })
                    );
                  }}
                  accessible
                  accessibilityLabel="Buscar"
                >
                  <Ionicons name="search" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.workItemFilterContainer}>
                {/* Aquí podrías implementar un dropdown de partidas */}
                {/* Por ahora lo simplificaremos */}
                <TouchableOpacity
                  style={styles.workItemFilterButton}
                  onPress={() => setWorkItemFilter(undefined)}
                  accessible
                  accessibilityLabel="Filtrar por partida"
                >
                  <Text style={styles.workItemFilterText}>
                    {workItemFilter
                      ? "Filtrar por partida"
                      : "Todas las partidas"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#3498db" />
                </TouchableOpacity>
              </View>
              {renderError()}
              {/* Lista de conceptos */}
              {loading && page === 1 ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#3498db" />
                  <Text style={styles.loaderText}>Cargando conceptos...</Text>
                </View>
              ) : (
                <FlatList
                  data={conceptsWithProgress}
                  keyExtractor={(item) => item.id}
                  renderItem={renderConceptItem}
                  ItemSeparatorComponent={renderSeparator}
                  ListFooterComponent={renderFooter}
                  ListEmptyComponent={renderEmpty}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.3}
                  contentContainerStyle={contentContainerStyle}
                  accessibilityLabel="Lista de conceptos"
                />
              )}

              {/* Botón para cerrar el selector */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSelector(false)}
                accessible
                accessibilityLabel="Cancelar selección"
              >
                <Text style={styles.closeButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default ConceptSelector;
