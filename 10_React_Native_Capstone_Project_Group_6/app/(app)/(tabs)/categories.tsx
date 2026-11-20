/**
 * Categories Screen - Marketplace
 * Grid of all categories with product counts. Tap one to see its products
 * (opens the Search tab with that category selected). Pull down to refresh.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { formatCategory } from '@/utils/productFilters';
import { createStyles } from './categoriesStyles';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';

interface Category {
  name: string; // the slug, e.g. "home-decoration"
  count: number;
}

export default function CategoriesScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Two requests in total (instead of one per category):
      // the category names, and every product's category so we can count them.
      const [names, all] = await Promise.all([
        productApi.getCategories(),
        productApi.getProducts({ limit: 0, select: 'category' }),
      ]);

      const counts: Record<string, number> = {};
      all.products.forEach((p) => {
        counts[p.category] = (counts[p.category] ?? 0) + 1;
      });

      setCategories(names.map((name) => ({ name, count: counts[name] ?? 0 })));
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

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item.name)}`)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${formatCategory(item.name)}, ${item.count} products`}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={getCategoryIcon(item.name)} size={32} color={colors.primary} />
          </View>
          <Title style={styles.categoryName}>{formatCategory(item.name)}</Title>
          <Text style={styles.categoryCount}>
            {item.count} {item.count === 1 ? 'product' : 'products'}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
      <Text style={styles.pageSubtitle}>Browse products by category</Text>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.gridWrapper}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={() => loadCategories(true)}
        ListEmptyComponent={<Text style={styles.pageSubtitle}>No categories found.</Text>}
      />
    </View>
  );
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/** One icon per DummyJSON category; unknown ones fall back to a box icon. */
function getCategoryIcon(category: string): IconName {
  const icons: Record<string, IconName> = {
    beauty: 'lipstick',
    fragrances: 'spray',
    furniture: 'sofa',
    groceries: 'basket',
    'home-decoration': 'home-variant',
    'kitchen-accessories': 'silverware-fork-knife',
    laptops: 'laptop',
    'mens-shirts': 'tshirt-crew',
    'mens-shoes': 'shoe-formal',
    'mens-watches': 'watch',
    'mobile-accessories': 'cellphone-link',
    motorcycle: 'motorbike',
    'skin-care': 'face-woman',
    smartphones: 'cellphone',
    'sports-accessories': 'basketball',
    sunglasses: 'sunglasses',
    tablets: 'tablet',
    tops: 'tshirt-v',
    vehicle: 'car',
    'womens-bags': 'bag-personal',
    'womens-dresses': 'hanger',
    'womens-jewellery': 'diamond-stone',
    'womens-shoes': 'shoe-heel',
    'womens-watches': 'watch-variant',
  };
  return icons[category] ?? 'package-variant';
}