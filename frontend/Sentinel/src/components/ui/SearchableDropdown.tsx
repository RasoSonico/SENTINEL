import React, { useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { TextInput, List, Portal, Modal } from "react-native-paper";
import { useDebounce } from "src/hooks/utils/useDebounce";

export interface DropdownItemType {
  value: number;
  label: string;
}

interface SearchableDropdownProps {
  label: string;
  searchLabel?: string;
  items: DropdownItemType[];
  onSelect: (valueId: number) => void;
  selected?: string | number;
  disabled?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  searchLabel,
  items,
  onSelect,
  selected = "",
  disabled = false,
}) => {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);

  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.label.toLowerCase().includes(debouncedQuery.toLowerCase())
      ),
    [debouncedQuery, items]
  );

  const value = useMemo(
    () => {
      const selectedIndex = items.findIndex(item => item.value === selected);

      return items[selectedIndex]?.label || '';
    },
    [selected, items]
  );

  const handleSelect = (item: DropdownItemType) => {
    setVisible(false);
    setQuery("");
    onSelect(item.value);
  };

  return (
    <View>
      <TextInput
        label={label}
        value={value}
        onFocus={() => setVisible(true)}
        editable
        right={
          <TextInput.Icon icon="menu-down" onPress={() => setVisible(true)} />
        }
        theme={{ colors: { primary: "#009BE1" } }}
        style={{ backgroundColor: "white", borderRadius: 8 }}
        multiline
        disabled={disabled}
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <TextInput
            style={{ backgroundColor: "white", borderRadius: 8 }}
            theme={{ colors: { primary: "#009BE1" } }}
            label={searchLabel || "Buscar..."}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <List.Item title={item.label} onPress={() => handleSelect(item)} />
            )}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 4,
  },
});

export default SearchableDropdown;
