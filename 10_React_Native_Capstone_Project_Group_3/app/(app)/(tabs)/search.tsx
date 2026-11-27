/**
 * Search & Filter Screen - Marketplace
 * Query search, category filter, price range, sorting, and pagination
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, TextInput as PaperTextInput, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { Product, ProductSearchParams, ProductsResponse } from '@/types/product';
import { styles } from './searchStyles';

type SortOption = 'rating' | 'price-asc' | 'price-desc' | 'discount' | 'newest';

const PAGE_LIMIT = 20;

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; sort?: string; q?: string }>();

  const [query, setQuery] = useState(params.q ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(params.q ?? '');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category ?? null
  );
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(
    params.sort === 'discount' ? 'discount' : 'rating'
  );

  const [rawResults, setRawResults] = useState<Product[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.category !== undefined) {
      setSelectedCategory(params.category || null);
    }
    if (params.sort === 'discount') {
      setSortBy('discount');
    }
    if (params.q !== undefined) {
      setQuery(params.q);
      setDebouncedQuery(params.q);
    }
  }, [params.category, params.sort, params.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    productApi
      .getCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([
          'smartphones',
          'laptops',
          'fragrances',
          'skincare',
          'groceries',
          'home-decoration',
        ]);
      });
  }, []);

  const buildSearchParams = useCallback(
    (skip: number): ProductSearchParams => {
      const base: ProductSearchParams = { limit: PAGE_LIMIT, skip };
      if (sortBy === 'price-asc') {
        base.sortBy = 'price';
        base.order = 'asc';
      } else if (sortBy === 'price-desc') {
        base.sortBy = 'price';
        base.order = 'desc';
      } else if (sortBy === 'rating') {
        base.sortBy = 'rating';
        base.order = 'desc';
      } else if (sortBy === 'discount') {
        base.sortBy = 'discountPercentage';
        base.order = 'desc';
      }
      return base;
    },
    [sortBy]
  );

  const fetchResults = useCallback(
    async (skip = 0, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const searchParams = buildSearchParams(skip);
        let response: ProductsResponse;

        if (debouncedQuery) {
          response = await productApi.searchProducts(debouncedQuery, searchParams);
        } else if (selectedCategory) {
          response = await productApi.getProductsByCategory(
            selectedCategory,
            searchParams
          );
        } else {
          response = await productApi.getProducts(searchParams);
        }

        setTotalAvailable(response.total);
        if (append) {
          setRawResults((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            const nextUnique = response.products.filter((p) => !seen.has(p.id));
            return [...prev, ...nextUnique];
          });
        } else {
          setRawResults(response.products);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search products');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedQuery, selectedCategory, buildSearchParams]
  );

  useEffect(() => {
    void fetchResults(0, false);
  }, [fetchResults]);

  const filteredAndSortedResults = useMemo(() => {
    const parsedMin = minPrice.trim() ? Number(minPrice) : null;
    const parsedMax = maxPrice.trim() ? Number(maxPrice) : null;

    const list = rawResults.filter((item) => {
      if (
        debouncedQuery &&
        selectedCategory &&
        item.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
      const effectivePrice = item.price * (1 - item.discountPercentage / 100);
      if (parsedMin !== null && !Number.isNaN(parsedMin) && effectivePrice < parsedMin) {
        return false;
      }
      if (parsedMax !== null && !Number.isNaN(parsedMax) && effectivePrice > parsedMax) {
        return false;
      }
      return true;
    });

    if (sortBy === 'newest') {
      return [...list].sort((a, b) => b.id - a.id);
    }
    return list;
  }, [rawResults, debouncedQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  const handleClearFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('rating');
  };

  const renderResult = ({ item }: { item: Product }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <Card style={styles.card} elevation={1}>
          <View style={styles.resultContent}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.resultImage}
              resizeMode="contain"
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultCategory}>{item.category}</Text>
              <Title style={styles.resultTitle} numberOfLines={2}>
                {item.title}
              </Title>
              <View style={styles.resultPrice}>
                <Text style={styles.currentPrice}>${discountedPrice.toFixed(2)}</Text>
                {item.discountPercentage > 0 && (
                  <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                )}
              </View>
              <Text style={styles.resultDetails}>
                ⭐ {item.rating.toFixed(1)} ·{' '}
                {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const sortButtons: { key: SortOption; label: string }[] = [
    { key: 'rating', label: 'Top Rated' },
    { key: 'price-asc', label: 'Price: Low-High' },
    { key: 'price-desc', label: 'Price: High-Low' },
    { key: 'discount', label: 'Biggest Discount' },
    { key: 'newest', label: 'Newest' },
  ];

  const hasMore = rawResults.length < totalAvailable;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.searchBarContainer, { marginTop: 16 }]}>
        <PaperTextInput
          mode="outlined"
          placeholder="Search products (e.g., iphone, perfume)..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void fetchResults(0, false)}
          left={<PaperTextInput.Icon icon="magnify" />}
          right={
            query ? (
              <PaperTextInput.Icon icon="close" onPress={() => setQuery('')} />
            ) : null
          }
        />
      </View>

      <View style={styles.filterSection}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title style={styles.filterTitle}>Categories</Title>
          {(selectedCategory || minPrice || maxPrice || query) && (
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={{ color: '#1A73E8', fontWeight: '600' }}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item && styles.filterChipSelected,
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === item ? null : item)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item && styles.filterChipTextSelected,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' ')}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Price Range ($)</Title>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PaperTextInput
            mode="outlined"
            label="Min Price"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
            dense
          />
          <PaperTextInput
            mode="outlined"
            label="Max Price"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
            dense
          />
        </View>
      </View>

      <View style={styles.sortSection}>
        <Title style={styles.filterTitle}>Sort By</Title>
        <View style={styles.sortOptions}>
          {sortButtons.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortChip, sortBy === opt.key && styles.sortChipSelected]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === opt.key && styles.sortChipTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.resultsSection}>
        <Title style={styles.resultsTitle}>
          {`Results (${filteredAndSortedResults.length})`}
        </Title>

        {error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{error}</Text>
            <Button
              mode="contained"
              onPress={() => void fetchResults(0, false)}
              style={{ marginTop: 12 }}
            >
              Retry
            </Button>
          </View>
        ) : loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#1A73E8" />
          </View>
        ) : filteredAndSortedResults.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify-remove-outline" size={64} color="#DADCE0" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search query or price range
            </Text>
            <Button mode="outlined" onPress={handleClearFilters} style={{ marginTop: 14 }}>
              Clear Filters
            </Button>
          </View>
        ) : (
          <>
            <FlatList
              data={filteredAndSortedResults}
              scrollEnabled={false}
              renderItem={renderResult}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.resultsList}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {hasMore && (
              <Button
                mode="outlined"
                onPress={() => void fetchResults(rawResults.length, true)}
                loading={loadingMore}
                disabled={loadingMore}
                style={{ marginTop: 12 }}
              >
                {loadingMore ? 'Loading more...' : 'Load More Results'}
              </Button>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}