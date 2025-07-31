import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/AdvanceSuccessModal.styles";
import { DesignTokens } from "../../../styles/designTokens";

export interface AdvanceFailureModalProps {
  onClose: () => void;
}

const AdvanceFailureModal: React.FC<AdvanceFailureModalProps> = ({
  onClose,
}) => {
  const width = Dimensions.get("window").width * 0.8;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width }]}>
          <Ionicons
            name="close-circle"
            size={64}
            color={DesignTokens.colors.error[500]}
            style={styles.icon}
          />
          <Text style={styles.title}>Hubo un error</Text>
          <Text style={styles.subtitle}>
            El avance no pudo guardarse correctamente, intente más tarde.
          </Text>
          <TouchableOpacity style={styles.registerButton} onPress={onClose}>
            <Text style={styles.registerButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AdvanceFailureModal;
