import { StyleSheet } from "react-native";

const labeledDropdownStyles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
});

export default labeledDropdownStyles;
