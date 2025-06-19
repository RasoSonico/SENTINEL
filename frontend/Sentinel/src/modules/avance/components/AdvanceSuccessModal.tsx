import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./AdvanceSuccessModal.styles";

interface AdvanceSuccessModalProps {
  visible: boolean;
  onRegisterAnother: () => void;
  onGoHome: () => void;
  onClose: () => void;
}

const AdvanceSuccessModal: React.FC<AdvanceSuccessModalProps> = ({
  visible,
  onRegisterAnother,
  onGoHome,
  onClose,
}) => {
  const width = Dimensions.get("window").width * 0.8;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width }]}>
          <Ionicons
            name="checkmark-circle"
            size={64}
            color="#4BB543"
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AdvanceSuccessModal;
