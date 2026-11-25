/**
 * Categories Screen - Cookbook
 * DummyJSON has no "category" endpoint, so categories are the recipes' meal
 * types and tags, counted from the catalog. Tapping one opens Search with
 * that filter applied.
 *
 * Design: "Browse by category" title, a two-pill toggle (selected = dark pill,
 * same as Home and Search) and rounded tiles with a round recipe photo.
 * Colors come from Paper's theme so light and dark both work.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRecipeCatalog } from '@/hooks';
import { CountedItem, countBy } from '@/utils/recipeFilters';
import { useThemedStyles } from '@/context/ThemeContext';
import { styles as rawStyles } from './categoriesStyles';

type Kind = 'mealType' | 'tag';
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const MEAL_TYPE_ICONS: Record<string, IconName> = {
  Breakfast: 'coffee',
  Lunch: 'food',
  Dinner: 'silverware-fork-knife',
  Snack: 'cookie',
  Dessert: 'cake-variant',
  Beverage: 'cup',
};

const KINDS: { value: Kind; label: string }[] = [
  { value: 'mealType', label: 'Meal types' },
  { value: 'tag', label: 'Tags' },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const styles = useThemedStyles(rawStyles);
  const { colors } = useTheme();
  const { recipes, loading, error, reload } = useRecipeCatalog();
  const [kind, setKind] = useState<Kind>('mealType');
  const [refreshing, setRefreshing] = useState(false);

  const items = useMemo(
    () => countBy(recipes, (recipe) => (kind === 'mealType' ? recipe.mealType : recipe.tags)),
    [recipes, kind]
  );

  // Photo for each category: the first recipe that has it
  const imageFor = (name: string): string | undefined =>
    recipes.find((r) => (kind === 'mealType' ? r.mealType : r.tags).includes(name))?.image;

  const onRefresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  const openCategory = (name: string) => {
    router.push(`/(app)/(tabs)/search?${kind}=${encodeURIComponent(name)}`);
  };

  const renderCategory = ({ item }: { item: CountedItem }) => (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => openCategory(item.name)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.count} ${item.count === 1 ? 'recipe' : 'recipes'}`}
    >
      {imageFor(item.name) ? (
        <Image source={{ uri: imageFor(item.name) }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons
            name={kind === 'mealType' ? (MEAL_TYPE_ICONS[item.name] ?? 'food') : 'tag-outline'}
            size={28}
            color={colors.primary}
          />
        </View>
      )}
      <Text style={styles.tileName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.tileCount}>
        {item.count} {item.count === 1 ? 'recipe' : 'recipes'}
      </Text>
    </TouchableOpacity>
  );

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Loading categories...</Text>
      </View>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.centerText, { color: colors.error }]}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => reload(true)}
          buttonColor={colors.onSurface}
          textColor={colors.surface}
          style={styles.retry}
        >
          Try again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        key={kind}
        data={items}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View>
            <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
              Browse by <Text style={{ color: colors.primary }}>category</Text>
            </Text>
            <Text style={styles.pageSubtitle}>Pick a meal type or tag to see matching recipes</Text>

            <View style={styles.toggleRow}>
              {KINDS.map((option) => {
                const selected = kind === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.8}
                    onPress={() => setKind(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.toggle,
                      selected && { backgroundColor: colors.onSurface, borderColor: colors.onSurface },
                    ]}
                  >
                    <Text style={[styles.toggleText, selected && { color: colors.surface }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
      />
    </View>
  );
}