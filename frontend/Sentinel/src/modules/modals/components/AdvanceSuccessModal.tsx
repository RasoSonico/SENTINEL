import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/AdvanceSuccessModal.styles";
import { BaseModalProps } from "../modalTypes";
import { DesignTokens } from "../../../styles/designTokens";

export interface AdvanceSuccessModalProps extends BaseModalProps {
  onRegisterAnother: () => void;
  onGoHome: () => void;
  onClose: () => void;
}

const AdvanceSuccessModal: React.FC<AdvanceSuccessModalProps> = ({
  onRegisterAnother,
  onGoHome,
  onClose,
}) => {
  const width = Dimensions.get("window").width * 0.8;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width }]}>
          <Ionicons
            name="checkmark-circle"
            size={64}
            color={DesignTokens.colors.success[500]}
            style={styles.icon}
          />
          <Text style={styles.title}>¡Avance registrado!</Text>
          <Text style={styles.subtitle}>
            El avance ha sido registrado exitosamente.
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={onRegisterAnother}
          >
            <Text style={styles.registerButtonText}>Registrar otro avance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
            <Text style={styles.homeButtonText}>Ir al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AdvanceSuccessModal;
