import React, { useMemo, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
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

const ITEM_HEIGHT = 56; // Approximate height per List.Item
const MAX_VISIBLE_ITEMS = 5; // Threshold before scrolling
const MAX_LIST_HEIGHT = ITEM_HEIGHT * MAX_VISIBLE_ITEMS;

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
  const [searchFocused, setSearchFocused] = useState(false);

  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.label.toLowerCase().includes(debouncedQuery.toLowerCase())
      ),
    [debouncedQuery, items]
  );

  const value = useMemo(() => {
    const selectedIndex = items.findIndex((item) => item.value === selected);

    return items[selectedIndex]?.label || "";
  }, [selected, items]);

  const handleSelect = (item: DropdownItemType) => {
    setVisible(false);
    setQuery("");
    setSearchFocused(false);
    onSelect(item.value);
  };

  const handleOnPress = () => (!disabled ? setVisible(true) : undefined);

  return (
    <View>
      {/* TouchableOpacity onPress is to handle Android actions */}
      <TouchableOpacity onPress={handleOnPress}>
        <TextInput
          label={label}
          value={value}
          editable={false}
          right={
            <TextInput.Icon
              disabled={disabled}
              icon="menu-down"
              onPress={handleOnPress}
            />
          }
          theme={{ colors: { primary: "#009BE1" } }}
          style={styles.input}
          multiline
          disabled={disabled}
          // TextInput onPress is to handle iOS actions
          onPress={handleOnPress}
        />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            setSearchFocused(false);
            setQuery("");
          }}
          contentContainerStyle={styles.modal}
        >
          <TextInput
            style={styles.input}
            theme={{ colors: { primary: "#009BE1" } }}
            label={searchLabel || "Buscar..."}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            autoFocus={searchFocused}
          />
          {filtered.length === 0 ? (
            <View style={styles.noOptions}>
              <List.Item
                title="No hay opciones disponibles"
                titleStyle={styles.noOptionsText}
                disabled
              />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <List.Item
                  title={item.label}
                  onPress={() => handleSelect(item)}
                />
              )}
              style={[
                styles.list,
                {
                  maxHeight: Math.min(
                    filtered.length * ITEM_HEIGHT,
                    MAX_LIST_HEIGHT
                  ),
                },
              ]}
              showsVerticalScrollIndicator={true}
            />
          )}
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
  input: {
    backgroundColor: "white",
    borderRadius: 8,
  },
  list: {
    marginTop: 10,
  },
  noOptions: {
    padding: 16,
  },
  noOptionsText: {
    color: "#888",
    textAlign: "center",
  },
});

export default SearchableDropdown;
