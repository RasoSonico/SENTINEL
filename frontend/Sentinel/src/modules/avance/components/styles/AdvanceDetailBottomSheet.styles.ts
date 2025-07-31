import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // BottomSheet container styles
  bottomSheetContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  bottomSheetBackground: {
    backgroundColor: "#92a4bdff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: "#92a4bdff",
  },
  handleIndicator: {
    backgroundColor: "#C7C7CC",
    width: 48,
    height: 4,
    borderRadius: 2,
  },

  // Content container
  contentContainer: {
    backgroundColor: "#f3f4f6",
    paddingBottom: 0,
  },

  // Header - Ejecutivo con gradiente sutil
  fixedHeader: {
    backgroundColor: "#c5cfddc7", // Mismo color que el fondo del bottom sheet
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA", // Línea separadora opcional
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#308320ff",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E5E9",
    position: "relative",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#21371fff",
    alignItems: "flex-start",
    letterSpacing: -0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  subheaderSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 1,
    flexWrap: "nowrap", // Evita que los elementos se envuelvan
    minHeight: 32,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  statusContainer: {
    alignContent: "center",
    maxWidth: "60%",
    paddingLeft: 10,
    backgroundColor: "transparent",
    paddingBottom: 8,
  },
  dateContainer: {
    alignItems: "flex-start",
    paddingRight: 25,
    backgroundColor: "transparent",
  },

  // Item container - Minimalista
  itemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#F3F4F6",
  },

  // Item label - Minimalista
  itemLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "flex-start",
  },
  editIconContainer: {
    padding: 4,
    marginLeft: "auto",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Values - Minimalista
  valueText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 18,
    fontWeight: "400",
    paddingLeft: 32,
  },

  // Volume specific - Destacado
  volumeValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    paddingLeft: 32,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  amountValue: {
    fontSize: 15,
    color: "#059669",
    fontWeight: "600",
    paddingLeft: 32,
  },

  // Comment specific - Minimalista
  commentText: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 20,
    paddingLeft: 32,
  },

  // Status badge - Minimalista
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: "#DCFCE7",
  },
  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  // Status text - Minimalista
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  approvedText: {
    color: "#059669",
  },
  rejectedText: {
    color: "#DC2626",
  },
  pendingText: {
    color: "#D97706",
  },

  // Input styles
  volumeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 32,
  },
  volumeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  commentsInput: {
    fontSize: 15,
    color: "#6B7280",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    minHeight: 80,
    textAlignVertical: "top",
    marginLeft: 32,
  },
  inputError: {
    borderColor: "#e74c3c",
    backgroundColor: "#FFF5F5",
  },
  unitText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    minWidth: 40,
  },

  // Error styles
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 32,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    flex: 1,
  },
  actionButtonsContainer: {
    backgroundColor: "#F3F4F6",
    borderTopWidth: 0.5,
    borderTopColor: "#F3F4F6",
    paddingBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 5,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    borderColor: "#3B82F6",
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#C7C7CC",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default styles;
