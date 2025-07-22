import { StyleSheet } from "react-native";

const submitButtonStyles = StyleSheet.create({
  button: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default submitButtonStyles;
