/**
 * Search Screen - Marketplace
 * Implementation completed
 * - Search products by query (GET /products/search?q=)
 * - Filter by category, brand, price range
 * - Sort by price, rating, discount, newest
 * - Infinite scroll pagination
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Title, TextInput as PaperTextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import type { Product } from '@/types/product';
import { styles } from './searchStyles';

export default function SearchScreen() {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(routeParams.category || null);
  const [brandFilter, setBrandFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'discount' | 'newest'>('rating');
  const [categories, setCategories] = useState<string[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const limit = 20;

  useEffect(() => {
    productApi.getCategories().then(setCategories).catch(() => setCategories([
      'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration',
    ]));
  }, []);

  const handleSearch = useCallback(async (reset = true) => {
    if (reset) { setLoading(true); setSkip(0); }
    else setLoadingMore(true);
    try {
      const offset = reset ? 0 : skip;
      const response = query.trim()
        ? await productApi.searchProducts(query.trim(), { limit, skip: offset })
        : selectedCategory
          ? await productApi.getProductsByCategory(selectedCategory, { limit, skip: offset })
          : await productApi.getProducts({ limit, skip: offset });
      setResults((previous) => reset ? response.products : [...previous, ...response.products]);
      setSkip(offset + response.products.length);
      setHasMore(offset + response.products.length < response.total);
      setSearched(true);
    } catch (error) {
      Alert.alert('Search failed', error instanceof Error ? error.message : 'Please check your connection.');
    } finally { setLoading(false); setLoadingMore(false); }
  }, [query, selectedCategory, skip]);

  useEffect(() => {
    if (routeParams.category) setSelectedCategory(routeParams.category);
  }, [routeParams.category]);

  useEffect(() => { handleSearch(true); }, [selectedCategory]);

  const filteredResults = results.filter((item) =>
    (!selectedCategory || item.category === selectedCategory) &&
    (!brandFilter.trim() || (item.brand || '').toLowerCase().includes(brandFilter.trim().toLowerCase())) &&
    (!maxPrice.trim() || (Number.isFinite(Number(maxPrice)) && item.price <= Number(maxPrice)))
  );
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
    return new Date(b.meta?.createdAt || 0).getTime() - new Date(a.meta?.createdAt || 0).getTime();
  });

  const renderResult = ({ item }: { item: Product }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return (
     <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/(app)/product/${item.id}`)}>
        <Card style={styles.card} elevation={1}>
          <View style={styles.resultContent}>
            <Image source={{ uri: item.thumbnail }} style={styles.resultImage} resizeMode="contain" />
            <View style={styles.resultInfo}>
              <Text style={styles.resultCategory}>{item.category}</Text>
              <Title style={styles.resultTitle} numberOfLines={2}>{item.title}</Title>
              <View style={styles.resultPrice}>
                <Text style={styles.currentPrice}>${discountedPrice.toFixed(2)}</Text>
                {item.discountPercentage > 0 && <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>}
              </View>
              <Text style={styles.resultDetails}>★ {item.rating.toFixed(1)} · {item.stock > 0 ? 'In Stock' : 'Out of Stock'}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <PaperTextInput
          style={styles.searchInput} placeholder="Search products..." value={query}
          onChangeText={setQuery} onSubmitEditing={() => handleSearch(true)} returnKeyType="search"
          left={<PaperTextInput.Icon icon="magnify" />}
          right={query ? <PaperTextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
        />
        <Button mode="contained" onPress={() => handleSearch(true)} loading={loading} disabled={loading}>Search</Button>
      </View>

      {/* Category Filters */}
      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Categories</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          <TouchableOpacity style={[styles.filterChip, !selectedCategory && styles.filterChipSelected]} onPress={() => setSelectedCategory(null)}>
            <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextSelected]}>All</Text>
          </TouchableOpacity>
          {categories.map((item) => (
            <TouchableOpacity key={item} style={[styles.filterChip, selectedCategory === item && styles.filterChipSelected]} onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}>
              <Text style={[styles.filterChipText, selectedCategory === item && styles.filterChipTextSelected]}>{item.replace(/-/g, ' ')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Additional Filters */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <View style={{ flex: 1 }}><PaperTextInput mode="outlined" label="Brand" value={brandFilter} onChangeText={setBrandFilter} /></View>
        <View style={{ flex: 1 }}><PaperTextInput mode="outlined" label="Max price ($)" value={maxPrice} onChangeText={setMaxPrice} keyboardType="decimal-pad" /></View>
      </View>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <Title style={styles.filterTitle}>Sort By</Title>
        <View style={styles.sortOptions}>
          {(['price', 'rating', 'discount', 'newest'] as const).map((option) => (
            <TouchableOpacity key={option} style={[styles.sortChip, sortBy === option && styles.sortChipSelected]} onPress={() => setSortBy(option)}>
              <Text style={[styles.sortChipText, sortBy === option && styles.sortChipTextSelected]}>{option[0].toUpperCase() + option.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsSection}>
        <Title style={styles.resultsTitle}>Results {query ? `for "${query}"` : ''} {filteredResults.length > 0 && `(${filteredResults.length})`}</Title>
        {loading ? <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#38BDF8" /></View> :
          searched && sortedResults.length === 0 ? (
            <View style={styles.emptyState}><MaterialCommunityIcons name="magnify" size={64} color="#7DD3FC" /><Text style={styles.emptyText}>No products found</Text><Text style={styles.emptySubtext}>Try another search or category</Text></View>
          ) : (
            <FlatList data={sortedResults} renderItem={renderResult} keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.resultsList} ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false} />
          )}
        {hasMore && <Button mode="outlined" loading={loadingMore} disabled={loadingMore} onPress={() => handleSearch(false)}>Load More</Button>}
      </View>
    </ScrollView>
  );
}
