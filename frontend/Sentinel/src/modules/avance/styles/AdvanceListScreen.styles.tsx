import { StyleSheet } from "react-native";

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
  partidaName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  conceptDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 18,
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
    marginTop: 8,
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
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  programStatusContainer: {
    alignItems: "flex-start",
  },
  dateContainer: {
    alignItems: "flex-end",
  },
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
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 12,
  },
  loadingConceptContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingConceptText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#7f8c8d",
  },
});

export default styles;
