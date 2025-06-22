import React from "react";
import { View, Text } from "react-native";
import SearchableDropdown, { DropdownItemType } from "src/components/ui/SearchableDropdown";
import styles from "./styles/LabeledDropdown.styles";
import { ActivityIndicator } from "react-native-paper";

interface LabeledDropdownProps {
  label: string;
  items: DropdownItemType[];
  selected: string | number | null;
  onSelect: (itemId: number) => void;
  error?: string | null;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
}

const LabeledDropdown: React.FC<LabeledDropdownProps> = ({
  label,
  items,
  selected,
  onSelect,
  error,
  disabled = false,
  isLoading = false,
  loadingLabel = "Cargando..."
}) =>
(
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    {
      isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.loadingText}>{loadingLabel}</Text>
        </View>
      ) : (
        <SearchableDropdown
          label="Selecciona una opción"
          searchLabel={`Busca y selecciona una ${label.toLowerCase()}`}
          items={items}
          onSelect={onSelect}
          selected={selected || ""}
          disabled={disabled}
        />
      )
    }
    {error ? (
      <Text style={{ color: "red", marginTop: 4 }}>{error}</Text>
    ) : null}
  </View>
);

export default LabeledDropdown;
