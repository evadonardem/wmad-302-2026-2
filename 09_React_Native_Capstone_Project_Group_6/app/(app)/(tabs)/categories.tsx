/**
 * Categories Screen - Cookbook
 * DummyJSON has no "category" endpoint, so categories are the recipes' meal
 * types and tags, counted from the catalog. Tapping one opens Search with
 * that filter applied.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, SegmentedButtons, Title, useTheme } from 'react-native-paper';
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

const local = StyleSheet.create({
  toggle: { marginHorizontal: 16, marginBottom: 12 },
  retry: { marginTop: 12 },
});

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

  const onRefresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  const openCategory = (name: string) => {
    router.push(`/(app)/(tabs)/search?${kind}=${encodeURIComponent(name)}`);
  };

  const renderCategory = ({ item }: { item: CountedItem }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => openCategory(item.name)} activeOpacity={0.8}>
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={kind === 'mealType' ? (MEAL_TYPE_ICONS[item.name] ?? 'food') : 'tag-outline'}
              size={32}
              color={colors.primary}
            />
          </View>
          <Title style={styles.categoryName} numberOfLines={1}>
            {item.name}
          </Title>
          <Text style={styles.categoryCount}>
            {item.count} {item.count === 1 ? 'recipe' : 'recipes'}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => reload(true)} style={local.retry}>
          Try again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.pageTitle}>Categories</Title>
      <Text style={styles.pageSubtitle}>Browse recipes by meal type or tag</Text>

      <SegmentedButtons
        style={local.toggle}
        value={kind}
        onValueChange={(value) => setKind(value === 'tag' ? 'tag' : 'mealType')}
        buttons={[
          { value: 'mealType', label: 'Meal types' },
          { value: 'tag', label: 'Tags' },
        ]}
      />

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
      />
    </View>
  );
}
