/**
 * Categories Screen - Marketplace
 * Browse products by category
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProductRecommendations from '@/components/ProductRecommendations';
import { productApi } from '@/services/productApi';
import { styles } from '@/styles/categoriesStyles';

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
      const categoryNames = await productApi.getCategories();
      // Get count for each category
      const categoriesWithCounts = await Promise.all(
        categoryNames.slice(0, 12).map(async (name) => {
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
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        router.push({
          pathname: '/(app)/search-results',
          params: { category: item.name },
        })
      }
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${item.name.replace(/-/g, ' ')}`}
    >
      <Card style={styles.card} mode="contained">
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name)}
              size={28}
              color="#75648A"
            />
          </View>
          <Text style={styles.categoryName}>
            {item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/-/g, ' ')}
          </Text>
          {item.count !== undefined && (
            <Text style={styles.categoryCount}>{item.count} products</Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#75648A" />
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
    <FlatList
      style={styles.container}
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.name}
      numColumns={2}
      columnWrapperStyle={styles.gridWrapper}
      contentContainerStyle={styles.gridContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <View>
          <Title style={styles.pageTitle}>Categories</Title>
          <Text style={styles.pageSubtitle}>Browse products by category</Text>
        </View>
      }
      ListFooterComponent={
        <View>
          <ProductRecommendations
            title="Popular search picks"
            subtitle="Products matched to your most frequent searches"
            searchBased
          />
          <View style={styles.guideContainer}>
            <Text style={styles.guideTitle}>Find your next favorite</Text>
            <Text style={styles.guideText}>
              Choose a category to browse products, compare prices, and check customer ratings.
            </Text>
          </View>
        </View>
      }
    />
  );
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function getCategoryIcon(category: string): IconName {
  const icons: Record<string, IconName> = {
    smartphones: 'cellphone',
    laptops: 'laptop',
    fragrances: 'spray',
    skincare: 'face-woman',
    groceries: 'cart',
    'home-decoration': 'home',
    furniture: 'sofa',
    'kitchen-accessories': 'silverware',
    'vehicle-accessories': 'car',
    'electronics-accessories': 'headphones',
  };
  return icons[category] || 'package-variant';
}