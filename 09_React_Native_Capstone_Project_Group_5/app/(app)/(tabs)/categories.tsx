/**
 * Categories Screen - Cookbook
 * Browse recipes by category
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { styles } from './categoriesStyles';

interface Category {
  name: string;
  count?: number;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryNames, response] = await Promise.all([
        recipeApi.getCategories(),
        recipeApi.getRecipes({ limit: 50 }),
      ]);
      const recipes = response.recipes;
      const aliases: Record<string, string[]> = { Seafood: ['shrimp'] };
      const categoriesWithCounts = categoryNames.map((name) => {
        const normalizedName = name.toLowerCase();
        const searchTerms = [normalizedName, ...(aliases[name] ?? [])];
        const count = recipes.filter((recipe) => {
          const tags = recipe.tags.map((tag) => tag.toLowerCase());
          if (tags.includes(normalizedName)) return true;

          const recipeText = [recipe.name, ...recipe.ingredients].join(' ').toLowerCase();
          return searchTerms.some((term) => recipeText.includes(term));
        }).length;

        return { name, count };
      });
      setCategories(categoriesWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadCategories();
  }, [loadCategories]));

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push({
        pathname: '/(app)/(tabs)/search',
        params: { category: item.name, view: 'category' },
      })}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name) as any}
              size={32}
              color="#E85D04"
            />
          </View>
          <Title style={styles.categoryName}>{item.name}</Title>
          {item.count !== undefined && (
            <Text style={styles.categoryCount}>{item.count} recipes</Text>
          )}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Beef: 'cow',
    Chicken: 'chicken',
    Dessert: 'cake',
    Lamb: 'sheep',
    Pasta: 'noodles',
    Pork: 'pig',
    Seafood: 'fish',
    Vegetarian: 'leaf',
    Breakfast: 'sunrise',
    Appetizer: 'silverware-fork-knife',
    'Side Dish': 'bowl',
    'Main Course': 'plate',
    Soup: 'bowl-outline',
    Salad: 'leaf-circle',
    Drink: 'glass-mug',
  };
  return icons[category] || 'food';
}
