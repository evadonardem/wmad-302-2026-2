/**
 * Categories Screen - Marketplace
 * Browse products by category with counts and pull-to-refresh
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
import { Button, Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { styles } from './categoriesStyles';

interface CategoryItem {
  name: string;
  count: number;
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function getCategoryIcon(category: string): IconName {
  const icons: Record<string, IconName> = {
    smartphones: 'cellphone',
    laptops: 'laptop',
    fragrances: 'spray',
    skincare: 'face-woman-shimmer',
    groceries: 'food-apple',
    'home-decoration': 'lamp',
    furniture: 'sofa',
    tops: 'tshirt-crew',
    'womens-dresses': 'hanger',
    'womens-shoes': 'shoe-heel',
    'mens-shirts': 'tshirt-v',
    'mens-shoes': 'shoe-formal',
    'mens-watches': 'watch',
    'womens-watches': 'watch-variant',
    'womens-bags': 'bag-personal',
    'womens-jewellery': 'ring',
    sunglasses: 'sunglasses',
    automotive: 'car',
    motorcycle: 'motorbike',
    lighting: 'lightbulb-outline',
  };
  return icons[category] ?? 'tag-outline';
}

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
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

      const categoryNames = await productApi.getCategories();
      const categoriesWithCounts = await Promise.all(
        categoryNames.map(async (name) => {
          try {
            const res = await productApi.getProductsByCategory(name, { limit: 1 });
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories(false);
  }, [loadCategories]);

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item.name)}`)
      }
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name)}
              size={32}
              color="#1A73E8"
            />
          </View>
          <Title style={styles.categoryName}>
            {item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/-/g, ' ')}
          </Title>
          <Text style={styles.categoryCount}>{item.count} products</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => loadCategories(false)} style={{ marginTop: 12 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.pageTitle}>Categories</Title>
      <Text style={styles.pageSubtitle}>Browse products by category</Text>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCategories(true)}
            colors={['#1A73E8']}
          />
        }
      />
    </View>
  );
}