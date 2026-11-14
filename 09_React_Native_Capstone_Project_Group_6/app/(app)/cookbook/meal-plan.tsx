/**
 * Meal Plan - route: /cookbook/meal-plan
 * A weekly planner (Monday to Sunday). Each day has Breakfast / Lunch /
 * Dinner / Snack slots. Use the arrows to look at other weeks, and send the
 * week's ingredients to the shopping list in one tap.
 */
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Appbar,
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useCookbook } from '@/context/CookbookContext';
import { useRecipeCatalog } from '@/hooks';
import { OfflineBanner } from '@/components/OfflineBanner';
import { RecipePickerDialog } from '@/components/RecipePickerDialog';
import { MEAL_SLOTS, type MealSlot } from '@/types/cookbook';
import {
  DAY_NAMES,
  addWeeks,
  formatDayShort,
  formatWeekRange,
  getWeekDays,
  recipeIdsForDates,
  toDateKey,
} from '@/utils/cookbook';

interface PickTarget {
  date: string;
  slot: MealSlot;
}

export default function MealPlanScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { mealPlan, planMeal, unplanMeal, clearPlanDates, addRecipesToShopping } = useCookbook();
  const { recipes, loading } = useRecipeCatalog();

  const [weekOffset, setWeekOffset] = useState(0);
  const [pickTarget, setPickTarget] = useState<PickTarget | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const days = useMemo(() => getWeekDays(addWeeks(new Date(), weekOffset)), [weekOffset]);
  const dateKeys = useMemo(() => days.map(toDateKey), [days]);
  const todayKey = toDateKey(new Date());
  const plannedCount = mealPlan.filter((m) => dateKeys.includes(m.date)).length;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/cookbook');
  };

  const addWeekToShopping = () => {
    const weekRecipes = recipeIdsForDates(mealPlan, dateKeys)
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);
    if (weekRecipes.length === 0) {
      setMessage('Recipes are still loading, try again in a moment');
      return;
    }
    addRecipesToShopping(weekRecipes);
    setMessage(`Added ingredients from ${weekRecipes.length} ${weekRecipes.length === 1 ? 'recipe' : 'recipes'}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="Meal plan" />
        <Appbar.Action
          icon="cart-outline"
          onPress={() => router.push('/(app)/cookbook/shopping-list')}
          accessibilityLabel="Open shopping list"
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <OfflineBanner />

        {/* Week switcher */}
        <View style={styles.weekRow}>
          <IconButton icon="chevron-left" onPress={() => setWeekOffset((w) => w - 1)} accessibilityLabel="Previous week" />
          <View style={styles.weekLabel}>
            <Text variant="titleMedium" style={{ color: colors.onSurface }}>
              {formatWeekRange(days)}
            </Text>
            {weekOffset !== 0 && (
              <Button compact onPress={() => setWeekOffset(0)}>
                This week
              </Button>
            )}
          </View>
          <IconButton icon="chevron-right" onPress={() => setWeekOffset((w) => w + 1)} accessibilityLabel="Next week" />
        </View>

        {/* Days */}
        {days.map((day) => {
          const key = toDateKey(day);
          const isToday = key === todayKey;
          return (
            <Card
              key={key}
              mode="outlined"
              style={[styles.dayCard, isToday && { borderColor: colors.primary, borderWidth: 2 }]}
            >
              <Card.Content>
                <Text variant="titleMedium" style={{ color: isToday ? colors.primary : colors.onSurface }}>
                  {DAY_NAMES[day.getDay()]} · {formatDayShort(day)}
                  {isToday ? ' (today)' : ''}
                </Text>

                {MEAL_SLOTS.map((slot) => {
                  const meals = mealPlan.filter((m) => m.date === key && m.slot === slot);
                  return (
                    <View key={slot} style={styles.slotRow}>
                      <Text variant="labelLarge" style={[styles.slotName, { color: colors.onSurfaceVariant }]}>
                        {slot}
                      </Text>
                      <View style={styles.flex}>
                        {meals.length === 0 ? (
                          <Text style={{ color: colors.outline }}>-</Text>
                        ) : (
                          meals.map((meal) => (
                            <View key={meal.id} style={styles.mealRow}>
                              <TouchableOpacity
                                style={styles.flex}
                                onPress={() => router.push(`/recipe/${meal.recipeId}`)}
                                accessibilityRole="button"
                              >
                                <Text numberOfLines={1} style={{ color: colors.onSurface }}>
                                  {byId.get(meal.recipeId)?.name ?? `Recipe #${meal.recipeId}`}
                                </Text>
                              </TouchableOpacity>
                              <IconButton
                                icon="close"
                                size={16}
                                onPress={() => unplanMeal(meal.id)}
                                accessibilityLabel="Remove from plan"
                              />
                            </View>
                          ))
                        )}
                      </View>
                      <IconButton
                        icon="plus-circle-outline"
                        size={22}
                        onPress={() => setPickTarget({ date: key, slot })}
                        accessibilityLabel={`Add ${slot} on ${formatDayShort(day)}`}
                      />
                    </View>
                  );
                })}
              </Card.Content>
            </Card>
          );
        })}

        <Button
          mode="contained"
          icon="cart-plus"
          onPress={addWeekToShopping}
          disabled={plannedCount === 0 || loading}
          style={styles.bigButton}
        >
          {"Add this week's ingredients to shopping list"}
        </Button>
        <Button
          mode="text"
          textColor={colors.error}
          onPress={() => setConfirmClear(true)}
          disabled={plannedCount === 0}
        >
          Clear this week
        </Button>
      </ScrollView>

      <RecipePickerDialog
        visible={pickTarget !== null}
        title={pickTarget ? `${pickTarget.slot} - pick a recipe` : 'Pick a recipe'}
        recipes={recipes}
        onDismiss={() => setPickTarget(null)}
        onPick={(recipe) => {
          if (pickTarget) planMeal(pickTarget.date, pickTarget.slot, recipe.id);
          setPickTarget(null);
        }}
      />

      <Portal>
        <Dialog visible={confirmClear} onDismiss={() => setConfirmClear(false)} style={styles.dialog}>
          <Dialog.Title>Clear this week</Dialog.Title>
          <Dialog.Content>
            <Text>{`Remove all ${plannedCount} planned meals for ${formatWeekRange(days)}?`}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmClear(false)}>Cancel</Button>
            <Button
              onPress={() => {
                clearPlanDates(dateKeys);
                setConfirmClear(false);
              }}
            >
              Clear
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={2500}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16 },
  weekRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  weekLabel: { alignItems: 'center' },
  dayCard: { marginBottom: 12 },
  slotRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  slotName: { width: 84 },
  mealRow: { flexDirection: 'row', alignItems: 'center' },
  bigButton: { marginTop: 8, marginBottom: 4 },
  dialog: { borderRadius: 24 },
});
