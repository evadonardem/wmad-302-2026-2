/**
 * Search Screen - Marketplace
 * - Debounced search (GET /products/search?q=) - waits until you stop typing
 * - Filters: category, brand, price range
 * - Sort: relevance, price, rating, discount, newest
 * - Loads results 20 at a time as you scroll
 * - Opened from Home/Categories with ?category=slug to pre-select a category
 *
 * How it works: DummyJSON can search and filter by category, but not by brand or
 * price. So we download all products matching the search/category once, then
 * filter and sort them on the device (see utils/productFilters.ts).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Title, Button, Snackbar, TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks';
import { Product } from '@/types/product';
import {
  SORT_OPTIONS,
  SortOption,
  filterAndSort,
  formatCategory,
  getBrands,
  getFinalPrice,
  parsePrice,
} from '@/utils/productFilters';
import { styles } from './searchStyles';

const PAGE_SIZE = 20;

export default function SearchScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const params = useLocalSearchParams<{ category?: string }>();

  // What the person typed / picked
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category ?? null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortOption>('relevance');

  // Data
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [toast, setToast] = useState<string | null>(null);

  // Debounce: only search 400ms after the last keystroke (saves API calls)
  const debouncedQuery = useDebounce(query, 400);

  // A category passed in the link (e.g. from the Categories tab) selects that chip
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
      setSelectedBrand(null);
    }
  }, [params.category]);

  // Category chips: load once
  useEffect(() => {
    productApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([])); // chips are optional, search still works
  }, []);

  // Download products whenever the search text or category changes.
  // `requestId` makes sure a slow, older response can't overwrite a newer one.
  // A category chip only needs its own download when there is no search text
  // (with search text we already have the products and just filter them).
  const hasText = debouncedQuery.trim() !== '';
  const fetchCategory = hasText ? null : selectedCategory;

  const requestId = useRef(0);
  const loadProducts = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      // limit: 0 means "all matching products" in DummyJSON (max ~200)
      const response = hasText
        ? await productApi.searchProducts(debouncedQuery.trim(), { limit: 0 })
        : fetchCategory
          ? await productApi.getProductsByCategory(fetchCategory, { limit: 0 })
          : await productApi.getProducts({ limit: 0 });
      if (id !== requestId.current) return; // a newer request already started
      setProducts(response.products);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [debouncedQuery, hasText, fetchCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Brands that exist in the current results (the brand chips)
  const brands = useMemo(() => getBrands(products), [products]);

  // If the chosen brand isn't in the new results, drop it
  useEffect(() => {
    if (selectedBrand && !brands.includes(selectedBrand)) setSelectedBrand(null);
  }, [brands, selectedBrand]);

  // Apply category/brand/price filters + sort
  const results = useMemo(
    () =>
      filterAndSort(products, {
        category: selectedCategory,
        brand: selectedBrand,
        minPrice: parsePrice(minPrice),
        maxPrice: parsePrice(maxPrice),
        sort,
      }),
    [products, selectedCategory, selectedBrand, minPrice, maxPrice, sort]
  );

  // Start again at the first 20 whenever the list changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [results]);

  const visibleResults = useMemo(() => results.slice(0, visibleCount), [results, visibleCount]);

  const hasFilters =
    selectedCategory !== null || selectedBrand !== null || minPrice !== '' || maxPrice !== '' || query !== '';

  const clearAll = () => {
    setQuery('');
    setSelectedCategory(null);
    setSelectedBrand(null);
    setMinPrice('');
    setMaxPrice('');
    setSort('relevance');
  };

  const handleAddToCart = (product: Product) => {
    const result = addToCart(product);
    if (result === 'added') setToast(`Added "${product.title}" to cart`);
    else if (result === 'max_reached') setToast(`Only ${product.stock} in stock - already in your cart`);
    else setToast('Sorry, this item is out of stock');
  };

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderResult = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/(app)/(tabs)/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.resultContent}>
          <Image source={{ uri: item.thumbnail }} style={styles.resultImage} resizeMode="contain" />
          <View style={styles.resultInfo}>
            <Text style={styles.resultCategory}>{formatCategory(item.category)}</Text>
            <Title style={styles.resultTitle} numberOfLines={2}>
              {item.title}
            </Title>
            <View style={styles.resultPrice}>
              <Text style={styles.currentPrice}>${getFinalPrice(item).toFixed(2)}</Text>
              {item.discountPercentage > 0 && (
                <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
              )}
            </View>
            <Text style={styles.resultDetails}>
              ⭐ {item.rating.toFixed(1)} · {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
            <Button
              mode="contained-tonal"
              icon="cart-plus"
              compact
              disabled={item.stock <= 0}
              onPress={() => handleAddToCart(item)}
              style={styles.addButton}
            >
              Add to cart
            </Button>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  // Everything above the results list (search bar + filters). It is part of the
  // FlatList so the whole screen scrolls as one list.
  const header = (
    <View style={{ paddingTop: 16 }}>
      <View style={styles.searchBarContainer}>
        <PaperTextInput
          mode="outlined"
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          outlineStyle={styles.searchOutline}
          returnKeyType="search"
          autoCorrect={false}
          left={<PaperTextInput.Icon icon="magnify" />}
          right={query ? <PaperTextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {renderChip('All', selectedCategory === null, () => setSelectedCategory(null))}
          {categories.map((c) =>
            renderChip(formatCategory(c), selectedCategory === c, () =>
              setSelectedCategory(selectedCategory === c ? null : c)
            )
          )}
        </ScrollView>
      </View>

      {brands.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Brand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {renderChip('Any brand', selectedBrand === null, () => setSelectedBrand(null))}
            {brands.map((b) =>
              renderChip(b, selectedBrand === b, () => setSelectedBrand(selectedBrand === b ? null : b))
            )}
          </ScrollView>
        </View>
      )}

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Price range ($)</Text>
        <View style={styles.priceRow}>
          <PaperTextInput
            mode="outlined"
            dense
            label="Min"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
            style={styles.priceInput}
          />
          <Text style={styles.priceDash}>-</Text>
          <PaperTextInput
            mode="outlined"
            dense
            label="Max"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
            style={styles.priceInput}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Sort by</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SORT_OPTIONS.map((o) => renderChip(o.label, sort === o.value, () => setSort(o.value)))}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle} numberOfLines={1}>
          {loading ? 'Searching...' : `${results.length} result${results.length === 1 ? '' : 's'}`}
          {debouncedQuery.trim() ? ` for "${debouncedQuery.trim()}"` : ''}
        </Text>
        {hasFilters && (
          <Button compact onPress={clearAll}>
            Clear all
          </Button>
        )}
      </View>
    </View>
  );

  // Shown under the header when there is nothing to list
  let emptyContent: React.ReactElement | null = null;
  if (loading) {
    emptyContent = (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  } else if (error) {
    emptyContent = (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="wifi-off" size={64} color="#DADCE0" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadProducts}>
          Retry
        </Button>
      </View>
    );
  } else if (results.length === 0) {
    emptyContent = (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="magnify" size={64} color="#DADCE0" />
        <Text style={styles.emptyText}>No products found</Text>
        <Text style={styles.emptySubtext}>Try a different search or remove some filters</Text>
        {hasFilters && (
          <Button mode="outlined" onPress={clearAll}>
            Clear filters
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={loading || error ? [] : visibleResults}
        renderItem={renderResult}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyContent}
        ListFooterComponent={<View style={styles.footerSpace} />}
        onEndReached={() => {
          if (visibleCount < results.length) setVisibleCount((count) => count + PAGE_SIZE);
        }}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
      />

      <Snackbar
        visible={toast !== null}
        onDismiss={() => setToast(null)}
        duration={2500}
        action={{ label: 'View cart', onPress: () => router.push('/(app)/(tabs)/cart') }}
      >
        {toast ?? ''}
      </Snackbar>
    </View>
  );
}