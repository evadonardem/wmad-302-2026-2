import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Title, TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { Product, ProductsResponse } from '@/types/product';
import { styles as baseStyles } from './searchStyles';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { getThemedStyles } from '@/utils/themeStyles';

type SortOption = 'price' | 'rating' | 'discount' | 'newest';
const PAGE_SIZE = 20;

export default function SearchScreen() {
  const router = useRouter();
  const { colorMode, t } = useAppPreferences();
  const styles = getThemedStyles(baseStyles, colorMode === 'dark');
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const routeCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const requestId = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(routeCategory ?? null);
  const [brand, setBrand] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSelectedCategory(routeCategory ?? null);
  }, [routeCategory]);

  useEffect(() => {
    productApi.getCategories()
      .then(setCategories)
      .catch((categoryError: unknown) => {
        console.error('Failed to load search categories:', categoryError);
      });
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const requestParams = { limit: PAGE_SIZE, skip: 0 };
        let response: ProductsResponse;
        if (query.trim()) {
          response = await productApi.searchProducts(query.trim(), requestParams);
        } else if (selectedCategory) {
          response = await productApi.getProductsByCategory(selectedCategory, requestParams);
        } else {
          response = await productApi.getProducts(requestParams);
        }
        if (currentRequestId !== requestId.current) return;
        setResults(response.products);
        setTotal(response.total);
        setSkip(response.skip + response.products.length);
      } catch (requestError: unknown) {
        if (currentRequestId !== requestId.current) return;
        setError(requestError instanceof Error ? requestError.message : 'Failed to search products.');
        setResults([]);
        setTotal(0);
        setSkip(0);
      } finally {
        if (currentRequestId === requestId.current) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, reloadKey]);

  const filteredResults = useMemo(() => {
    const min = minimumPrice.trim() ? Number(minimumPrice) : null;
    const max = maximumPrice.trim() ? Number(maximumPrice) : null;
    return results
      .filter((product) => !selectedCategory || product.category === selectedCategory)
      .filter((product) => !brand.trim() || product.brand?.toLowerCase().includes(brand.trim().toLowerCase()))
      .filter((product) => min === null || (Number.isFinite(min) && product.price >= min))
      .filter((product) => max === null || (Number.isFinite(max) && product.price <= max))
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
        return new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime();
      });
  }, [results, selectedCategory, brand, minimumPrice, maximumPrice, sortBy]);

  const loadMore = async () => {
    if (loadingMore || loading || skip >= total) return;
    setLoadingMore(true);
    const currentRequestId = requestId.current;
    try {
      const requestParams = { limit: PAGE_SIZE, skip };
      let response: ProductsResponse;
      if (query.trim()) {
        response = await productApi.searchProducts(query.trim(), requestParams);
      } else if (selectedCategory) {
        response = await productApi.getProductsByCategory(selectedCategory, requestParams);
      } else {
        response = await productApi.getProducts(requestParams);
      }
      if (currentRequestId === requestId.current) {
        setResults((current) => [...current, ...response.products]);
        setSkip(response.skip + response.products.length);
      }
    } catch (requestError: unknown) {
      console.error('Failed to load more products:', requestError);
      setError(requestError instanceof Error ? requestError.message : 'Failed to load more products.');
    } finally {
      setLoadingMore(false);
    }
  };

  const renderResult = ({ item }: { item: Product }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => router.push(`/(app)/product/${item.id}`)}
        activeOpacity={0.85}
      >
        <Card style={styles.card} elevation={1}>
          <View style={styles.resultContent}>
            <Image source={{ uri: item.thumbnail }} style={styles.resultImage} resizeMode="contain" />
            <View style={styles.resultInfo}>
              <Text style={styles.resultCategory}>{item.category}</Text>
              <Title style={styles.resultTitle} numberOfLines={2}>{item.title}</Title>
              <View style={styles.resultPrice}>
                <Text style={styles.currentPrice}>${discountedPrice.toFixed(2)}</Text>
                {item.discountPercentage > 0 && (
                  <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                )}
              </View>
              <Text style={styles.resultDetails}>⭐ {item.rating} · {item.stock > 0 ? t('In Stock') : t('Out of Stock')}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.searchBarContainer}>
        <PaperTextInput
          style={styles.searchInput}
          placeholder={t('Search products...')}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          left={<PaperTextInput.Icon icon="magnify" />}
          right={query ? <PaperTextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
        />
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>{t('Categories')}</Title>
        <FlatList
          data={['all', ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const category = item === 'all' ? null : item;
            const selected = category === selectedCategory;
            return (
              <TouchableOpacity
                style={[styles.filterChip, selected && styles.filterChipSelected]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                  {item === 'all' ? t('All') : item.replace(/-/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>{t('Brand and price')}</Title>
        <PaperTextInput
          label={t('Brand')}
          value={brand}
          onChangeText={setBrand}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PaperTextInput
            label={t('Min price')}
            value={minimumPrice}
            onChangeText={setMinimumPrice}
            keyboardType="decimal-pad"
            mode="outlined"
            style={{ flex: 1 }}
          />
          <PaperTextInput
            label={t('Max price')}
            value={maximumPrice}
            onChangeText={setMaximumPrice}
            keyboardType="decimal-pad"
            mode="outlined"
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <View style={styles.sortSection}>
        <Title style={styles.filterTitle}>{t('Sort By')}</Title>
        <View style={styles.sortOptions}>
          {(['price', 'rating', 'discount', 'newest'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortChip, sortBy === option && styles.sortChipSelected]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.sortChipText, sortBy === option && styles.sortChipTextSelected]}>
                {t(option.charAt(0).toUpperCase() + option.slice(1))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Title style={styles.resultsTitle}>
        {query ? `${t('Results for')} "${query}"` : t('Products')} ({filteredResults.length}{skip < total ? '+' : ''})
      </Title>
    </View>
  );

  const listFooter = skip < total ? (
    <Button mode="outlined" onPress={loadMore} loading={loadingMore} disabled={loadingMore || loading}>
      {t('Load more')}
    </Button>
  ) : null;

  if (loading && results.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#66BB6A" />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filteredResults}
      renderItem={renderResult}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={listHeader}
      ListFooterComponent={listFooter}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          {error ? (
            <>
              <Text style={styles.emptyText}>{t('Could not load products')}</Text>
              <Text style={styles.emptySubtext}>{error}</Text>
              <Button onPress={() => setReloadKey((key) => key + 1)}>{t('Retry')}</Button>
            </>
          ) : loading ? (
            <ActivityIndicator size="large" color="#66BB6A" />
          ) : (
            <>
              <MaterialCommunityIcons name="magnify" size={64} color="#DADCE0" />
              <Text style={styles.emptyText}>{t('No products found')}</Text>
              <Text style={styles.emptySubtext}>{t('Try different filters or search terms.')}</Text>
            </>
          )}
        </View>
      }
    />
  );
}
