/**
 * Categories Screen - Cookbook
 * Grid of categories (recipe tags) with recipe counts. Tapping one opens Search filtered
 * by that category. Supports pull-to-refresh.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { getErrorMessage } from '@/services/authApi';
import { ErrorState, IconName, Skeleton } from '@/components/CommonComponents';
import type { CategorySummary } from '@/types/recipe';

const CATEGORY_ICONS: Record<string, string> = {
  pasta: 'pasta',
  pizza: 'pizza',
  dessert: 'cake-variant',
  cookies: 'cookie',
  baking: 'bread-slice',
  salad: 'leaf',
  vegetarian: 'leaf',
  vegan: 'leaf',
  soup: 'pot-steam',
  chicken: 'food-drumstick',
  beef: 'food-steak',
  seafood: 'fish',
  fish: 'fish',
  rice: 'rice',
  asian: 'noodles',
  noodles: 'noodles',
  burger: 'hamburger',
  breakfast: 'egg-fried',
  smoothie: 'cup',
  cocktail: 'glass-cocktail',
  snack: 'food-apple',
  italian: 'pasta',
  mexican: 'taco',
  taco: 'taco',
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category.toLowerCase()] ?? 'silverware-fork-knife';
}

export default function CategoriesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (force = false) => {
    setError(null);
    try {
      setCategories(await recipeApi.getCategories(force));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories(true);
  };

  const renderCategory = ({ item }: { item: CategorySummary }) => (
    <TouchableOpacity
      style={styles.cell}
      activeOpacity={0.8}
      onPress={() =>
        router.push({ pathname: '/(app)/(tabs)/search', params: { category: item.name } })
      }
      testID={`category-${item.name}`}
    >
      <Card style={{ backgroundColor: theme.colors.surface }} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name) as IconName}
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="titleMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.count} {item.count === 1 ? 'recipe' : 'recipes'}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Skeleton height={28} width="40%" style={styles.titleSkeleton} />
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} height={120} width="47%" borderRadius={16} style={styles.skeletonCell} />
          ))}
        </View>
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={() => loadCategories(true)} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              Categories
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Browse recipes by category
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 4, paddingBottom: 12, paddingTop: 16 },
  grid: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  cell: { width: '48%' },
  cardContent: { alignItems: 'center', paddingVertical: 18, gap: 4 },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  titleSkeleton: { margin: 20 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  skeletonCell: { marginBottom: 4 },
});
