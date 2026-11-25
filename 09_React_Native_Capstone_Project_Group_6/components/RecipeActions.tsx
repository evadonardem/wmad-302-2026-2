/**
 * Three buttons for the recipe page:
 *   Collection    - put the recipe in one (or more) of the user's collections
 *   Plan meal     - choose a day and meal for the weekly planner
 *   Shopping list - add this recipe's ingredients to the shopping list
 * Results are reported to the parent through onMessage (shown in its Snackbar).
 */
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useCookbook } from '@/context/CookbookContext';
import { MEAL_SLOTS, type MealSlot } from '@/types/cookbook';
import type { Recipe } from '@/types/recipe';
import { formatDayShort, getUpcomingDays, toDateKey } from '@/utils/cookbook';

type DialogName = 'collection' | 'plan' | null;

interface RecipeActionsProps {
  recipe: Recipe;
  onMessage: (message: string) => void;
}

/** Pick the recipe's own meal type as the starting slot when it matches. */
function defaultSlot(recipe: Recipe): MealSlot {
  const found = MEAL_SLOTS.find((slot) => recipe.mealType.includes(slot));
  return found ?? 'Dinner';
}

export function RecipeActions({ recipe, onMessage }: RecipeActionsProps) {
  const { colors } = useTheme();
  const {
    collections,
    collectionsContaining,
    createCollection,
    addToCollection,
    removeFromCollection,
    planMeal,
    addRecipesToShopping,
  } = useCookbook();

  const [dialog, setDialog] = useState<DialogName>(null);
  const [newName, setNewName] = useState('');
  const days = useMemo(() => getUpcomingDays(new Date(), 14), []);
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));
  const [slot, setSlot] = useState<MealSlot>(() => defaultSlot(recipe));

  const inCollections = collectionsContaining(recipe.id);

  const toggleCollection = (id: string, isIn: boolean) => {
    if (isIn) removeFromCollection(id, recipe.id);
    else addToCollection(id, recipe.id);
  };

  const createAndAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createCollection(name);
    addToCollection(id, recipe.id);
    setNewName('');
    onMessage(`Added to "${name}"`);
  };

  const confirmPlan = () => {
    planMeal(dateKey, slot, recipe.id);
    setDialog(null);
    const day = days.find((d) => toDateKey(d) === dateKey);
    onMessage(`Planned for ${slot}${day ? ` on ${formatDayShort(day)}` : ''}`);
  };

  const addIngredients = () => {
    addRecipesToShopping([recipe]);
    onMessage(`Added ${recipe.ingredients.length} ingredients to your shopping list`);
  };

  return (
    <>
      <View style={styles.row}>
        <Button
          mode="outlined"
          icon={inCollections.length > 0 ? 'folder-check-outline' : 'folder-plus-outline'}
          compact
          onPress={() => setDialog('collection')}
        >
          Collection
        </Button>
        <Button mode="outlined" icon="calendar-plus" compact onPress={() => setDialog('plan')}>
          Plan meal
        </Button>
        <Button mode="outlined" icon="cart-plus" compact onPress={addIngredients}>
          Shopping list
        </Button>
      </View>

      <Portal>
        {/* Collections */}
        <Dialog visible={dialog === 'collection'} onDismiss={() => setDialog(null)} style={styles.dialog}>
          <Dialog.Title>Add to collection</Dialog.Title>
          <Dialog.Content>
            {collections.length === 0 ? (
              <Text style={{ color: colors.onSurfaceVariant }}>
                You have no collections yet. Create one below.
              </Text>
            ) : (
              <ScrollView style={styles.list}>
                {collections.map((collection) => {
                  const isIn = collection.recipeIds.includes(recipe.id);
                  return (
                    <Checkbox.Item
                      key={collection.id}
                      label={collection.name}
                      status={isIn ? 'checked' : 'unchecked'}
                      onPress={() => toggleCollection(collection.id, isIn)}
                      position="leading"
                      labelStyle={styles.checkLabel}
                    />
                  );
                })}
              </ScrollView>
            )}
            <TextInput
              label="New collection"
              accessibilityLabel="New collection"
              mode="outlined"
              dense
              value={newName}
              onChangeText={setNewName}
              onSubmitEditing={createAndAdd}
              style={styles.input}
            />
            <Button mode="contained-tonal" onPress={createAndAdd} disabled={!newName.trim()}>
              Create and add
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Done</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Meal plan */}
        <Dialog visible={dialog === 'plan'} onDismiss={() => setDialog(null)} style={styles.dialog}>
          <Dialog.Title>Plan this meal</Dialog.Title>
          <Dialog.Content>
            <Text variant="labelLarge" style={styles.label}>
              Day
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {days.map((day) => {
                const key = toDateKey(day);
                return (
                  <Chip key={key} selected={key === dateKey} onPress={() => setDateKey(key)}>
                    {formatDayShort(day)}
                  </Chip>
                );
              })}
            </ScrollView>
            <Text variant="labelLarge" style={styles.label}>
              Meal
            </Text>
            <View style={styles.chipsWrap}>
              {MEAL_SLOTS.map((s) => (
                <Chip key={s} selected={s === slot} onPress={() => setSlot(s)}>
                  {s}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancel</Button>
            <Button onPress={confirmPlan}>Add to plan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  dialog: { borderRadius: 24 },
  list: { maxHeight: 200 },
  checkLabel: { textAlign: 'left' },
  input: { marginTop: 12, marginBottom: 8 },
  label: { marginTop: 8, marginBottom: 8 },
  chips: { gap: 8, paddingRight: 8 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
