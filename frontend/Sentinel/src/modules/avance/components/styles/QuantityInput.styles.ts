import { StyleSheet } from "react-native";

const quantityInputStyles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    height: 48,
    fontSize: 16,
  },
  unitInput: {
    color: "#7f8c8d",
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    width: 120,
    height: 48,
    fontSize: 16,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default quantityInputStyles;
