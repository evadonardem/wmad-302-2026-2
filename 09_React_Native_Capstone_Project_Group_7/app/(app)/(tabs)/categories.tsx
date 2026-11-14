/**
 * Categories Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { APP_COLORS } from '@/constants/theme';
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

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoryNames = await recipeApi.getCategories();
      const categoriesWithCounts = await Promise.all(
        categoryNames.slice(0, 12).map(async (name) => {
          try {
            const res = await recipeApi.getRecipesByCategory(name, { limit: 1 });
            return { name, count: res.total };
          } catch {
            return { name, count: 0 };
          }
        })
      );
      setCategories(categoriesWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item.name)}` as any)}
      activeOpacity={0.85}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name) as any}
              size={30}
              color={APP_COLORS.primary}
            />
          </View>
          <Title style={styles.categoryName}>{item.name}</Title>
          {item.count !== undefined && (
            <Text style={styles.categoryCount}>{item.count} dishes</Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>Loading pantry categories...</Text>
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
      <Title style={styles.pageTitle}>Culinary Categories</Title>
      <Text style={styles.pageSubtitle}>Select an ingredient or course style</Text>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Beef: 'food-steak',
    Chicken: 'food-drumstick',
    Dessert: 'cupcake',
    Lamb: 'silverware-fork-knife',
    Pasta: 'pasta',
    Pork: 'grill',
    Seafood: 'fish',
    Vegetarian: 'leaf',
    Breakfast: 'coffee',
    Appetizer: 'cheese',
    'Side Dish': 'bowl-mix',
    'Main Course': 'pot-steam',
    Soup: 'bowl',
    Salad: 'sprout',
    Drink: 'glass-cocktail',
  };
  return icons[category] || 'food';
}