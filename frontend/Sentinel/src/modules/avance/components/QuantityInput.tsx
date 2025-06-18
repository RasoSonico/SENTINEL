import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/QuantityInput.styles";

interface QuantityInputProps {
  quantity: string;
  onChange: (value: string) => void;
  unit: string;
  error: string | null;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  quantity,
  onChange,
  unit,
  error,
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>Volumen ejecutado</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        placeholder="Volumen"
        value={quantity}
        onChangeText={onChange}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.unitInput}
        placeholder="Unidad"
        value={unit}
        editable={false}
      />
    </View>
    {error && (
      <View style={styles.errorRow}>
        <Ionicons name="alert-circle" size={18} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

export default QuantityInput;
