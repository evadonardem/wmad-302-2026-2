/**
 * Popup that lets the user search the recipe list and tap one.
 * Used by Collections ("Add recipes"), Meal Plan (pick a recipe for a slot)
 * and the Shopping List ("Add from a recipe").
 */
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Portal, Searchbar, Text, useTheme } from 'react-native-paper';
import type { Recipe } from '@/types/recipe';

interface RecipePickerDialogProps {
  visible: boolean;
  title: string;
  recipes: Recipe[];
  onDismiss: () => void;
  onPick: (recipe: Recipe) => void;
}

export function RecipePickerDialog({
  visible,
  title,
  recipes,
  onDismiss,
  onPick,
}: RecipePickerDialogProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? recipes.filter((r) => r.name.toLowerCase().includes(q)) : recipes;
  }, [recipes, query]);

  const close = () => {
    setQuery('');
    onDismiss();
  };

  const pick = (recipe: Recipe) => {
    setQuery('');
    onPick(recipe);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={close} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Searchbar
            placeholder="Search recipes"
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
        </Dialog.Content>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {matches.length === 0 ? (
              <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>
                No recipes found
              </Text>
            ) : (
              matches.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.row}
                  onPress={() => pick(recipe)}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${recipe.name}`}
                >
                  <Image source={{ uri: recipe.image }} style={styles.thumb} />
                  <View style={styles.info}>
                    <Text variant="bodyLarge" numberOfLines={1} style={{ color: colors.onSurface }}>
                      {recipe.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {recipe.cuisine} · {recipe.mealType.join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={close}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { borderRadius: 24 },
  search: { height: 44 },
  scrollArea: { maxHeight: 320, paddingHorizontal: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  info: { flex: 1 },
  empty: { textAlign: 'center', padding: 24 },
});
