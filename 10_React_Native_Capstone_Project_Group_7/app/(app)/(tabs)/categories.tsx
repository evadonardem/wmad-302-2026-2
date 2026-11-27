/**
 * Categories Screen - Marketplace
 * Browse products by category
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { styles as baseStyles } from './categoriesStyles';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { getThemedStyles } from '@/utils/themeStyles';

interface Category {
  name: string;
  count?: number;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { colorMode, t } = useAppPreferences();
  const styles = getThemedStyles(baseStyles, colorMode === 'dark');
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
        categoryNames.map(async (name) => {
          const res = await productApi.getProductsByCategory(name, { limit: 1 });
          return { name, count: res.total };
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
      onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item.name)}`)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.name)}
              size={32}
              color="#66BB6A"
            />
          </View>
          <Title style={styles.categoryName}>
            {item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('-', ' ')}
          </Title>
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
        <ActivityIndicator size="large" color="#66BB6A" />
        <Text style={styles.loadingText}>{t('Loading categories...')}</Text>
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
      <Title style={styles.pageTitle}>{t('Categories')}</Title>
      <Text style={styles.pageSubtitle}>{t('Browse products by category')}</Text>

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

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function getCategoryIcon(category: string): IconName {
  const normalized = category.toLowerCase().trim();
  const icons: Record<string, IconName> = {
    beauty: 'lipstick',
    smartphones: 'cellphone',
    laptops: 'laptop',
    fragrances: 'spray',
    skincare: 'face-woman',
    'skin-care': 'face-woman',
    groceries: 'cart',
    'home-decoration': 'home',
    furniture: 'sofa',
    'kitchen-accessories': 'silverware',
    'vehicle-accessories': 'car',
    vehicle: 'car',
    motorcycle: 'motorbike',
    'electronics-accessories': 'headphones',
    'mobile-accessories': 'headphones',
    'mens-shirts': 'tshirt-crew-outline',
    'mens-shoes': 'shoe-sneaker',
    'mens-watches': 'watch',
    'womens-dresses': 'tshirt-crew-outline',
    'womens-bags': 'bag-personal',
    'womens-jewellery': 'diamond-stone',
    'womens-shoes': 'shoe-heel',
    'womens-watches': 'watch',
    'sports-accessories': 'basketball',
    sunglasses: 'sunglasses',
    tablets: 'tablet',
    tops: 'hanger',
  };
  return icons[normalized] || 'package-variant';
}