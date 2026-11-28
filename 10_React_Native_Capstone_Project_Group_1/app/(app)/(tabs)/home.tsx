/**
 * Home Screen - Product discovery
 * - infinite-scroll product grid (limit/skip pagination)
 * - category shortcuts and a Flash Deals row (highest discounts)
 * - skeleton loading, pull-to-refresh, error + retry
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Snackbar, useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useInfiniteScroll } from '@/hooks';
import { useProductGrid } from '@/hooks/useProductGrid';
import { productApi } from '@/services/productApi';
import { Category, ProductSummary } from '@/types/product';
import {
  CategoryChip,
  ErrorState,
  EmptyState,
  ProductCard,
  ProductCardSkeleton,
} from '@/components/CommonComponents';
import { Logo } from '@/components/Logo';
import { Snowfall } from '@/components/Snowfall';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { christmas } from '@/constants/theme';

const PAGE_SIZE = 20;
const FLASH_DEAL_CARD_WIDTH = 170;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { addProduct } = useCart();
  const { numColumns, cardWidth, gap, horizontalPadding } = useProductGrid();

  const [categories, setCategories] = useState<Category[]>([]);
  const [flashDeals, setFlashDeals] = useState<ProductSummary[]>([]);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, limit: number) => {
    const response = await productApi.getProductSummaries({ limit, skip: page * limit });
    return {
      data: response.products,
      hasMore: response.skip + response.products.length < response.total,
    };
  }, []);

  const { data, initialLoading, loadingMore, refreshing, error, loadMore, refresh, retry } = useInfiniteScroll(
    fetchPage,
    PAGE_SIZE
  );

  // Categories and flash deals are secondary content - failures just hide the section
  useEffect(() => {
    productApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    productApi
      .getProductSummaries({ limit: 10, sortBy: 'discountPercentage', order: 'desc' })
      .then((response) => setFlashDeals(response.products))
      .catch(() => setFlashDeals([]));
  }, []);

  const openProduct = (id: number) => router.push(`/(app)/product/${id}`);

  const handleAdd = (product: ProductSummary) => {
    addProduct(product, 1);
    setSnackbar(`${product.title} added to cart`);
  };

  const header = (
    <View>
      <View style={styles.welcome}>
        <Snowfall count={14} />
        <View style={styles.welcomeText}>
          <Text style={styles.greeting}>{user ? `Merry Christmas, ${user.firstName}! 🎄` : 'Merry Christmas! 🎄'}</Text>
          <Text style={styles.subtitle}>Find the perfect gifts at festive prices</Text>
        </View>
        <Logo size={84} />
      </View>

      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Categories</Text>
            <Button compact onPress={() => router.push('/(app)/(tabs)/categories')}>
              See all
            </Button>
          </View>
          <FlatList
            data={categories.slice(0, 12)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContent}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.name}
                onPress={() =>
                  router.push({ pathname: '/(app)/(tabs)/search', params: { category: item.slug, ts: String(Date.now()) } })
                }
              />
            )}
          />
        </View>
      )}

      {flashDeals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>🎁 Holiday Deals</Text>
            <Button
              compact
              onPress={() => router.push({ pathname: '/(app)/(tabs)/search', params: { sort: 'discount', ts: String(Date.now()) } })}
            >
              See all
            </Button>
          </View>
          <FlatList
            data={flashDeals}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContent}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <View style={{ width: gap }} />}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                width={FLASH_DEAL_CARD_WIDTH}
                onPress={() => openProduct(item.id)}
                onAddToCart={() => handleAdd(item)}
              />
            )}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.gridTitle, { color: theme.colors.onSurface }]}>
        Gift Ideas for You
      </Text>
    </View>
  );

  if (initialLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {header}
        <View style={[styles.skeletonGrid, { paddingHorizontal: horizontalPadding, gap }]}>
          {Array.from({ length: numColumns * 2 }).map((_, i) => (
            <ProductCardSkeleton key={i} width={cardWidth} />
          ))}
        </View>
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={retry} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        key={numColumns} // FlatList can't change numColumns on the fly
        data={data}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        columnWrapperStyle={numColumns > 1 ? { gap, paddingHorizontal: horizontalPadding } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={cardWidth}
            onPress={() => openProduct(item.id)}
            onAddToCart={() => handleAdd(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="package-variant" title="No products yet" message="Pull down to refresh." />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color={theme.colors.primary} />
          ) : error ? (
            <Button onPress={loadMore} style={styles.footer}>
              Couldn&apos;t load more - tap to retry
            </Button>
          ) : (
            <View style={styles.footer} />
          )
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[theme.colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
      />
      <Snackbar
        visible={snackbar !== null}
        onDismiss={() => setSnackbar(null)}
        duration={2000}
        action={{ label: 'View cart', onPress: () => router.push('/(app)/(tabs)/cart') }}
      >
        {snackbar ?? ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingBottom: spacing.lg, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' },
  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: christmas.red,
    borderBottomWidth: 4,
    borderBottomColor: christmas.gold,
    overflow: 'hidden',
  },
  welcomeText: { flex: 1, marginRight: spacing.md },
  greeting: { fontSize: 19, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 14, marginTop: 4, color: 'rgba(255,255,255,0.9)' },
  section: { marginBottom: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  gridTitle: { paddingHorizontal: spacing.md, marginTop: spacing.sm, marginBottom: spacing.md },
  rowContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { marginVertical: spacing.lg, minHeight: 24 },
});