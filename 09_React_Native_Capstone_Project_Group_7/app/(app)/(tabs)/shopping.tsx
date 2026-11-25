/**
 * Shopping List Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Button, TextInput as PaperTextInput, IconButton } from 'react-native-paper';
import { shoppingStorage, ShoppingItem } from '@/utils/storage';
import { APP_COLORS } from '@/constants/theme';

export default function ShoppingScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputText, setInputText] = useState('');

  const loadItems = useCallback(async () => {
    const data = await shoppingStorage.getItems();
    setItems(data);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAdd = async () => {
    if (!inputText.trim()) return;
    await shoppingStorage.addItem(inputText.trim());
    setInputText('');
    loadItems();
  };

  const handleToggle = async (id: string) => {
    await shoppingStorage.toggleItem(id);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    await shoppingStorage.removeItem(id);
    loadItems();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Market Basket</Title>
        <Text style={styles.subtitle}>Ingredients checklist for your upcoming dishes</Text>
      </View>
      <View style={styles.inputRow}>
        <PaperTextInput
          placeholder="Add ingredient (e.g., Fresh Basil)"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleAdd}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={APP_COLORS.primary}
          outlineColor={APP_COLORS.border}
        />
        <Button mode="contained" onPress={handleAdd} buttonColor={APP_COLORS.primary} style={styles.addButton}>
          Add
        </Button>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Your market basket is empty</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={[styles.itemCard, item.checked && styles.checkedCard]} elevation={0}>
            <View style={styles.itemRow}>
              <IconButton
                icon={item.checked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                iconColor={item.checked ? APP_COLORS.primaryLight : APP_COLORS.textSecondary}
                onPress={() => handleToggle(item.id)}
              />
              <Text style={[styles.itemText, item.checked && styles.checkedText]}>{item.name}</Text>
              <IconButton icon="trash-can-outline" iconColor={APP_COLORS.accent} onPress={() => handleDelete(item.id)} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: APP_COLORS.textPrimary },
  subtitle: { fontSize: 14, color: APP_COLORS.textSecondary },
  inputRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 10, alignItems: 'center' },
  input: { flex: 1, backgroundColor: APP_COLORS.surfaceElevated, height: 48 },
  addButton: { justifyContent: 'center', borderRadius: 12, height: 48, paddingHorizontal: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  itemCard: {
    marginBottom: 8,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  checkedCard: {
    backgroundColor: APP_COLORS.background,
    opacity: 0.75,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 6 },
  itemText: { flex: 1, fontSize: 15, fontWeight: '600', color: APP_COLORS.textPrimary },
  checkedText: { textDecorationLine: 'line-through', color: APP_COLORS.textSecondary },
  emptyBox: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 15, color: APP_COLORS.textSecondary },
});