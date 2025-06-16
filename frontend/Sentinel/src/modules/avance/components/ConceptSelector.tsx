import React, { useState, useEffect, useDeferredValue } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Concept, WorkItem } from "../../../types/entities";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchAvailableConcepts,
  selectAvailableConcepts,
} from "../../../redux/slices/advanceSlice";

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

  // Estado local para almacenar información de progreso
  const [conceptsWithProgress, setConceptsWithProgress] = useState<
    ConceptWithProgress[]
  >([]);
  const [selectedConceptProgress, setSelectedConceptProgress] = useState<{
    executed_quantity: number;
    work_item_name: string;
  }>({ executed_quantity: 0, work_item_name: "" });

  // Cargar conceptos disponibles al montar el componente o cuando cambian los filtros
  useEffect(() => {
    if (showSelector) {
      dispatch(
        fetchAvailableConcepts({
          constructionId,
          workItemId: workItemFilter,
          query: deferredSearchQuery,
          page: 1,
        })
      );
    }
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
    const getProgressInfo = async (concepts: Concept[]) => {
      // Aquí deberías hacer una llamada API para obtener el progreso real
      // Por ahora simulamos datos de progreso
      return concepts.map((concept) => ({
        ...concept,
        executed_quantity: 0, // Valor temporal, reemplazar con datos reales
        work_item_name: concept.work_item || "Partida", // Usar work_item o un valor por defecto
      }));
    };

    if (items.length > 0) {
      getProgressInfo(items).then((conceptsWithInfo) => {
        setConceptsWithProgress(conceptsWithInfo);
      });
    }
  }, [items]);

  // Actualizar información de progreso cuando se selecciona un concepto
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
  const handleLoadMore = () => {
    if (loading || page >= pages) return;

    dispatch(
      fetchAvailableConcepts({
        constructionId,
        workItemId: workItemFilter,
        query: searchQuery,
        page: page + 1,
      })
    );
  };

  // Manejar la selección de un concepto
  const handleSelectConcept = (concept: Concept) => {
    onSelectConcept(concept);
    setShowSelector(false);
  };

  // Renderizar un elemento de la lista de conceptos
  const renderConceptItem = ({ item }: { item: ConceptWithProgress }) => {
    // Encontrar el progreso para este concepto
    const executed = item.executed_quantity || 0;
    const remaining = item.quantity - executed;
    const progressPercentage = (executed / item.quantity) * 100;

    return (
      <TouchableOpacity
        style={styles.conceptItem}
        onPress={() => handleSelectConcept(item)}
      >
        <View style={styles.conceptInfo}>
          <Text style={styles.conceptCode}>{item.code}</Text>
          <Text style={styles.conceptName}>{item.description}</Text>
          {/* Usar description en lugar de name */}
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
  };

  // Renderizar el separador entre elementos
  const renderSeparator = () => <View style={styles.separator} />;

  // Renderizar el indicador de carga al final de la lista
  const renderFooter = () => {
    if (!loading || page === 1) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3498db" />
      </View>
    );
  };

  // Renderizar el indicador de lista vacía
  const renderEmpty = () => {
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
  };

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
                >
                  <Text style={styles.workItemFilterText}>
                    {workItemFilter
                      ? "Filtrar por partida"
                      : "Todas las partidas"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#3498db" />
                </TouchableOpacity>
              </View>

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
                  contentContainerStyle={
                    conceptsWithProgress.length === 0
                      ? { flex: 1 }
                      : styles.listContent
                  }
                />
              )}

              {/* Botón para cerrar el selector */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSelector(false)}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  // Estilos para el concepto seleccionado
  selectedConceptContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  selectedConceptInfo: {
    flex: 1,
  },
  selectedConceptCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3498db",
    marginBottom: 4,
  },
  selectedConceptName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  selectedConceptDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityLabel: {
    fontSize: 14,
    color: "#555",
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  changeButton: {
    justifyContent: "center",
    paddingLeft: 12,
  },
  changeButtonText: {
    color: "#3498db",
    fontWeight: "600",
  },

  // Estilos para el botón de selección
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    padding: 12,
    justifyContent: "center",
  },
  selectButtonText: {
    marginLeft: 8,
    color: "#3498db",
    fontWeight: "600",
  },

  // Estilos para el selector desplegado
  selectorContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    maxHeight: 400,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderRadius: 6,
  },
  workItemFilterContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  workItemFilterButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  workItemFilterText: {
    color: "#3498db",
  },

  // Estilos para los elementos de la lista
  listContent: {
    paddingBottom: 8,
  },
  conceptItem: {
    padding: 12,
  },
  conceptInfo: {
    marginBottom: 8,
  },
  conceptCode: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  conceptName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  conceptDetails: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#ecf0f1",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 12,
  },

  // Estilos para estados de carga y vacío
  loaderContainer: {
    padding: 24,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 8,
    color: "#7f8c8d",
  },
  footerLoader: {
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 4,
  },

  // Botón para cerrar el selector
  closeButton: {
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  closeButtonText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
});

export default ConceptSelector;
