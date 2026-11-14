
/**
 * Categories Screen - Cookbook
 * Browse recipes by category
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { styles } from './categoriesStyles';

interface Category {
  name: string;
  count: number;
}

type MaterialCommunityIconName =
  React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function CategoriesScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const categoryNames = await recipeApi.getCategories();

      const categoriesWithCounts = await Promise.all(
        categoryNames.slice(0, 12).map(async (name) => {
          try {
            const response = await recipeApi.getRecipesByCategory(
              name,
              { limit: 1 }
            );

            return {
              name,
              count: response.total,
            };
          } catch {
            return {
              name,
              count: 0,
            };
          }
        })
      );

      setCategories(categoriesWithCounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load categories.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCategory = (categoryName: string) => {
    router.push({
      pathname: '/(app)/(tabs)/search',
      params: { category: categoryName },
    });
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
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name)}
              size={32}
              color="#E85D04"
            />
          </View>

          <Title style={styles.categoryName}>
            {item.name}
          </Title>

          <Text style={styles.categoryCount}>
            {item.count} recipes
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingText}>
          Loading categories...
        </Text>
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          onPress={() => loadCategories()}
          style={{
            backgroundColor: '#E85D04',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListHeaderComponent={
          <View>
            <Title style={styles.pageTitle}>
              Categories
            </Title>

            <Text style={styles.pageSubtitle}>
              Browse recipes by category
            </Text>

            {error && (
              <Text style={{ color: '#D32F2F', marginBottom: 12 }}>
                Some category counts could not be loaded.
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.errorText}>
            No categories available.
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCategories(true)}
            colors={['#E85D04']}
          />
        }
      />
    </View>
  );
}

function getCategoryIcon(
  category: string
): MaterialCommunityIconName {
  const icons: Record<string, MaterialCommunityIconName> = {
    Beef: 'cow',
    Chicken: 'food-drumstick',
    Dessert: 'cake',
    Lamb: 'sheep',
    Pasta: 'noodles',
    Pork: 'pig',
    Seafood: 'fish',
    Vegetarian: 'leaf',
    Breakfast: 'weather-sunset-up',
    Appetizer: 'silverware-fork-knife',
    'Side Dish': 'bowl',
    'Main Course': 'silverware-fork-knife',
    Soup: 'bowl-outline',
    Salad: 'leaf-circle',
    Drink: 'glass-mug',
  };

  return icons[category] || 'food';
}
