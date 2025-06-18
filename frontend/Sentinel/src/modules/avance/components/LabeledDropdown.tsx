import React from "react";
import { View, Text } from "react-native";
import SearchableDropdown from "src/components/ui/SearchableDropdown";
import styles from "./styles/LabeledDropdown.styles";

interface LabeledDropdownProps {
  label: string;
  items: string[];
  selected: string | null;
  onSelect: (item: string) => void;
  error?: string | null;
}

const LabeledDropdown: React.FC<LabeledDropdownProps> = ({
  label,
  items,
  selected,
  onSelect,
  error,
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <SearchableDropdown
      label="Selecciona una opción"
      searchLabel={`Busca y selecciona una ${label.toLowerCase()}`}
      items={items}
      onSelect={onSelect}
      selected={selected ? selected : ""}
    />
    {error ? <Text style={{ color: "red", marginTop: 4 }}>{error}</Text> : null}
  </View>
);

export default LabeledDropdown;
