/**
 * Categories Screen - Cookbook
 *
 * DummyJSON has no "category" endpoint for recipes; its categories are the recipe
 * TAGS (Beef, Pasta, Dessert, Italian, ...). So we load the recipes once
 * (limit=0 returns all of them, only id + tags) and count how many recipes use
 * each tag. One request instead of one per category.
 *
 * Tapping a category goes to Search with ?category=<tag>. The Search screen
 * should read that param and load GET /recipes/tag/{tag}.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { useSettings } from '@/context/SettingsContext';
import { getCategoriesStyles } from './categoriesStyles';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Category {
  name: string;
  count: number;
}

const CATEGORY_ICONS: Record<string, IconName> = {
  beef: 'cow',
  steak: 'food-steak',
  chicken: 'food-drumstick',
  pizza: 'pizza',
  pasta: 'pasta',
  noodles: 'noodles',
  rice: 'rice',
  dessert: 'cake-variant',
  cookies: 'cookie',
  snack: 'cookie',
  soup: 'pot-steam',
  salad: 'leaf',
  vegetarian: 'leaf',
  seafood: 'fish',
  fish: 'fish',
  burger: 'hamburger',
  mexican: 'taco',
  taco: 'taco',
  breakfast: 'egg-fried',
  baking: 'bread-slice',
  bread: 'bread-slice',
  drink: 'cup',
  smoothie: 'cup',
  'ice cream': 'ice-cream',
};

function getCategoryIcon(category: string): IconName {
  return CATEGORY_ICONS[category.toLowerCase()] ?? 'food';
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const styles = getCategoriesStyles(settings.darkModeEnabled);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      // limit=0 -> all recipes; select keeps the payload small
      const response = await recipeApi.getRecipes({ limit: 0, select: 'id,tags' });

      const counts = new Map<string, number>();
      response.recipes.forEach((recipe) => {
        // Set: count each tag once per recipe
        new Set(recipe.tags ?? []).forEach((tag) => {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        });
      });

      setCategories(
        Array.from(counts, ([name, count]) => ({ name, count })).sort(
          (a, b) => b.count - a.count || a.name.localeCompare(b.name)
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
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

  const openCategory = (name: string) => {
    router.push({ pathname: '/(app)/(tabs)/search', params: { category: name } });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => openCategory(item.name)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={getCategoryIcon(item.name)} size={32} color="#E85D04" />
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => loadCategories()} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.pageTitle}>Categories</Title>
      <Text style={styles.pageSubtitle}>Browse recipes by category</Text>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E85D04']} />
        }
        ListEmptyComponent={<Text style={styles.pageSubtitle}>No categories found</Text>}
      />
    </View>
  );
}