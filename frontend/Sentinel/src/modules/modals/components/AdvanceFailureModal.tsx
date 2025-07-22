import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/AdvanceSuccessModal.styles";
import { useTheme } from "react-native-paper";

export interface AdvanceFailureModalProps {
  onClose: () => void;
}

const AdvanceFailureModal: React.FC<AdvanceFailureModalProps> = ({
  onClose,
}) => {
  const width = Dimensions.get("window").width * 0.8;
  const theme = useTheme();

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width }]}>
          <Ionicons
            name="checkmark-circle"
            size={64}
            color={theme.colors.error}
            style={styles.icon}
          />
          <Text style={styles.title}>Hubo un error</Text>
          <Text style={styles.subtitle}>
            El avanze no pudo guardarse correctamente, intente mas tarde.
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={onClose}
          >
            <Text style={styles.registerButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AdvanceFailureModal;
