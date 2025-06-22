import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Checkbox } from "react-native-paper";
import styles from "./styles/ConfirmSendModal.styles";

interface ConfirmSendModalProps {
  visible: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onClose: () => void;
  summary: {
    catalogo: string;
    partida: string;
    concepto: string;
    volumen: string;
    actividades: string;
  };
}

const ConfirmSendModal: React.FC<ConfirmSendModalProps> = ({
  visible,
  onEdit,
  onConfirm,
  onClose,
  summary,
}) => {
  const width = Dimensions.get("window").width * 0.9;
  const [checked, setChecked] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Confirmar Envío</Text>
            <Text style={styles.subtitle}>
              Revisa los datos antes de enviar
            </Text>
          </View>
          <Text style={styles.sectionTitle}>Resumen de envío:</Text>
          <View style={styles.summaryBox}>
            <ScrollView>
              <Text style={styles.summaryLabel}>Catalogo</Text>
              <Text style={styles.summaryValue}>{summary.catalogo}</Text>
              <Text style={styles.summaryLabel}>Partida</Text>
              <Text style={styles.summaryValue}>{summary.partida}</Text>
              <Text style={styles.summaryLabel}>Concepto</Text>
              <Text style={styles.summaryValue}>{summary.concepto}</Text>
              <Text style={styles.summaryLabel}>Volumen</Text>
              <Text style={styles.summaryValue}>{summary.volumen}</Text>
              <Text style={styles.summaryLabel}>Actividades</Text>
              <Text style={styles.summaryValue}>{summary.actividades}</Text>
            </ScrollView>
          </View>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() => setChecked(!checked)}
              color="#3498db"
            />
            <Text style={styles.checkboxLabel}>
              Confirmo que los datos son correctos y decido enviar los avances
              ingresados
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !checked && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={!checked}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ fontSize: 22, color: "#888" }}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmSendModal;
