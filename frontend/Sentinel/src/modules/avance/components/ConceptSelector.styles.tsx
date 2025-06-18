import { StyleSheet } from "react-native";

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

export default styles;
