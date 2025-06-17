import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextInput, List, Portal, Modal } from 'react-native-paper';
import { useDebounce } from 'src/hooks/utils/useDebounce';

interface SearchableDropdownProps {
  label: string;
  items: string[];
  onSelect: (value: string) => void;
  selected?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  items,
  onSelect,
  selected = '',
}) => {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(selected);

  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(
    () =>
      items.filter(item =>
        item.toLowerCase().includes(debouncedQuery.toLowerCase())
      ),
    [debouncedQuery, items]
  );

  const handleSelect = (item: string) => {
    setValue(item);
    setVisible(false);
    setQuery('');
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onFocus={() => setVisible(true)}
        editable
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <TextInput
            label="Search"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <List.Item
                title={item}
                onPress={() => handleSelect(item)}
              />
            )}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  modal: {
    margin: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 4,
  },
});

export default SearchableDropdown;
