/**
 * Categories Screen
 * Grid of every category with its product count; tapping one opens the Search
 * tab filtered to that category.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { Category } from '@/types/product';
import { ErrorState, Skeleton } from '@/components/CommonComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { useProductGrid } from '@/hooks/useProductGrid';
import { getErrorMessage } from '@/utils/errors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface CategoryWithCount extends Category {
  count: number;
}

const CATEGORY_ICONS: Record<string, IconName> = {
  beauty: 'lipstick',
  fragrances: 'spray',
  furniture: 'sofa',
  groceries: 'food-apple',
  'home-decoration': 'home-variant',
  'kitchen-accessories': 'silverware-fork-knife',
  laptops: 'laptop',
  'mens-shirts': 'tshirt-crew',
  'mens-shoes': 'shoe-formal',
  'mens-watches': 'watch',
  'mobile-accessories': 'headphones',
  motorcycle: 'motorbike',
  'skin-care': 'face-woman-shimmer',
  skincare: 'face-woman-shimmer',
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

export function getCategoryIcon(slug: string): IconName {
  return CATEGORY_ICONS[slug] ?? 'tag-outline';
}

export default function CategoriesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { numColumns, cardWidth, gap, horizontalPadding } = useProductGrid();

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      // 2 requests total: category list + every product's category (to count them)
      const [list, all] = await Promise.all([
        productApi.getCategories(),
        productApi.getProductSummaries({ limit: 0 }),
      ]);
      const counts = new Map<string, number>();
      all.products.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
      setCategories(list.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 })));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories(false);
  }, [loadCategories]);

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Categories</Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Browse products by category</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {header}
        <View style={[styles.skeletonGrid, { paddingHorizontal: horizontalPadding, gap }]}>
          {Array.from({ length: numColumns * 4 }).map((_, i) => (
            <Skeleton key={i} width={cardWidth} height={120} borderRadius={12} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={() => loadCategories(false)} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        key={numColumns}
        data={categories}
        numColumns={numColumns}
        keyExtractor={(item) => item.slug}
        ListHeaderComponent={header}
        columnWrapperStyle={numColumns > 1 ? { gap, paddingHorizontal: horizontalPadding } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadCategories(true)} colors={[theme.colors.primary]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: cardWidth }}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/(app)/(tabs)/search', params: { category: item.slug, ts: String(Date.now()) } })}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.count} products`}
          >
            <Card style={styles.card} elevation={1}>
              <Card.Content style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons name={getCategoryIcon(item.slug)} size={32} color={theme.colors.primary} />
                </View>
                <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.count, { color: theme.colors.onSurfaceVariant }]}>
                  {item.count} {item.count === 1 ? 'product' : 'products'}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  listContent: { paddingBottom: spacing.xl, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { borderRadius: 12 },
  cardContent: { alignItems: 'center', paddingVertical: spacing.lg },
  iconContainer: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', marginTop: spacing.md, textAlign: 'center', minHeight: 40 },
  count: { fontSize: 12, marginTop: 2 },
});