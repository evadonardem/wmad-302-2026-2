/**
 * Search Screen
 * - Debounced text search (GET /products/search?q=)
 * - Category filter (GET /products/category/{slug}), brand + price range filters
 * - Sort options (sent to the API) and infinite scroll with skip/limit
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, IconButton, TextInput as PaperTextInput, Title } from 'react-native-paper';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks';
import { getDiscountedPrice } from '@/utils/cart';
import { EmptyState } from '@/components/CommonComponents';
import type { Product, ProductSearchParams } from '@/types/product';
import { styles } from './searchStyles';

const PAGE_SIZE = 20;

interface SortOption {
  key: string;
  label: string;
  sortBy?: ProductSearchParams['sortBy'];
  order?: ProductSearchParams['order'];
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price-asc', label: 'Price: Low-High', sortBy: 'price', order: 'asc' },
  { key: 'price-desc', label: 'Price: High-Low', sortBy: 'price', order: 'desc' },
  { key: 'rating', label: 'Top rated', sortBy: 'rating', order: 'desc' },
  { key: 'discount', label: 'Best discount', sortBy: 'discountPercentage', order: 'desc' },
];

const formatLabel = (slug: string) => slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

export default function SearchScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const params = useLocalSearchParams<{ category?: string }>();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [category, setCategory] = useState<string | null>(params.category ?? null);
  const [brand, setBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);

  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Follow the category passed in from the Home / Categories screens
  useEffect(() => {
    if (params.category) setCategory(params.category);
  }, [params.category]);

  useEffect(() => {
    productApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const term = debouncedQuery.trim();

  const load = useCallback(
    async (skip: number, reset: boolean) => {
      const id = ++requestId.current;
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const queryParams: ProductSearchParams = {
          limit: PAGE_SIZE,
          skip,
          sortBy: sort.sortBy,
          order: sort.order,
        };
        // The API cannot combine search + category, so with a search term the
        // category is applied on the client (see `visible` below).
        const response = term
          ? await productApi.searchProducts(term, queryParams)
          : category
            ? await productApi.getProductsByCategory(category, queryParams)
            : await productApi.getProducts(queryParams);

        if (id !== requestId.current) return; // a newer request replaced this one
        setProducts((prev) => (reset ? response.products : [...prev, ...response.products]));
        setTotal(response.total);
      } catch {
        if (id === requestId.current) setError('Could not load products. Please try again.');
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [term, category, sort]
  );

  // Reload from the start whenever the search term, category or sort changes
  useEffect(() => {
    load(0, true);
  }, [load]);

  const handleEndReached = () => {
    if (loading || loadingMore || error || products.length >= total) return;
    load(products.length, false);
  };

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))).sort(),
    [products]
  );

  const visible = useMemo(() => {
    const min = minPrice.trim() === '' ? null : Number(minPrice);
    const max = maxPrice.trim() === '' ? null : Number(maxPrice);
    return products.filter((p) => {
      if (term && category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      const price = getDiscountedPrice(p.price, p.discountPercentage);
      if (min !== null && Number.isFinite(min) && price < min) return false;
      if (max !== null && Number.isFinite(max) && price > max) return false;
      return true;
    });
  }, [products, term, category, brand, minPrice, maxPrice]);

  const clearFilters = () => {
    setCategory(null);
    setBrand(null);
    setMinPrice('');
    setMaxPrice('');
    setSort(SORT_OPTIONS[0]);
    setQuery('');
  };

  const hasFilters = Boolean(category || brand || minPrice || maxPrice || query);

  const renderChip = (label: string, selected: boolean, onPress: () => void, key: string) => (
    <TouchableOpacity
      key={key}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  const header = (
    <View>
      <View style={styles.searchBarContainer}>
        <PaperTextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          left={<PaperTextInput.Icon icon="magnify" />}
          right={query ? <PaperTextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
        />
      </View>

      {categories.length > 0 && (
        <View style={styles.filterSection}>
          <Title style={styles.filterTitle}>Category</Title>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            keyExtractor={(item) => item}
            renderItem={({ item }) =>
              renderChip(formatLabel(item), category === item, () => setCategory(category === item ? null : item), item)
            }
          />
        </View>
      )}

      {brands.length > 0 && (
        <View style={styles.filterSection}>
          <Title style={styles.filterTitle}>Brand</Title>
          <FlatList
            data={brands}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => renderChip(item, brand === item, () => setBrand(brand === item ? null : item), item)}
          />
        </View>
      )}

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Price range ($)</Title>
        <View style={styles.priceRow}>
          <PaperTextInput
            mode="outlined"
            dense
            placeholder="Min"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
            style={styles.priceInput}
          />
          <Text style={styles.priceDash}>to</Text>
          <PaperTextInput
            mode="outlined"
            dense
            placeholder="Max"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
            style={styles.priceInput}
          />
        </View>
      </View>

      <View style={styles.sortSection}>
        <Title style={styles.filterTitle}>Sort by</Title>
        <FlatList
          data={SORT_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => renderChip(item.label, sort.key === item.key, () => setSort(item), item.key)}
        />
      </View>

      <Title style={styles.resultsTitle}>
        {loading ? 'Searching...' : `${visible.length} result${visible.length === 1 ? '' : 's'}`}
        {term ? ` for "${term}"` : ''}
      </Title>
    </View>
  );

  const renderResult = ({ item }: { item: Product }) => {
    const discounted = getDiscountedPrice(item.price, item.discountPercentage);
    return (
      <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/(app)/product/${item.id}`)}>
        <Card style={styles.card} elevation={1}>
          <View style={styles.resultContent}>
            <Image source={{ uri: item.thumbnail }} style={styles.resultImage} contentFit="contain" />
            <View style={styles.resultInfo}>
              <Text style={styles.resultCategory}>{item.category}</Text>
              <Title style={styles.resultTitle} numberOfLines={2}>
                {item.title}
              </Title>
              <View style={styles.resultPrice}>
                <Text style={styles.currentPrice}>${discounted.toFixed(2)}</Text>
                {item.discountPercentage > 0 && <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>}
              </View>
              <Text style={styles.resultDetails}>
                ⭐ {item.rating.toFixed(1)} · {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Text>
              <IconButton
                icon="cart-plus"
                size={22}
                disabled={item.stock <= 0}
                onPress={() => addToCart(item)}
                style={styles.addButton}
                accessibilityLabel={`Add ${item.title} to cart`}
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  let empty: React.ReactElement | null = null;
  if (loading) {
    empty = (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  } else if (error) {
    empty = (
      <View style={styles.emptyState}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => load(0, true)}>
          Retry
        </Button>
      </View>
    );
  } else {
    empty = (
      <EmptyState
        icon="magnify"
        title="No products found"
        message="Try a different search term or clear your filters"
        actionLabel={hasFilters ? 'Clear filters' : undefined}
        onAction={hasFilters ? clearFilters : undefined}
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.resultsList}
      data={loading ? [] : visible}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderResult}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyboardShouldPersistTaps="handled"
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} color="#1A73E8" /> : null}
    />
  );
}
