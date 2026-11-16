/** Product search, category filtering, and client-side sorting. */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Title, TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { styles } from './searchStyles';

interface Product {
  id: number;
  title: string;
  description: string;
  brand?: string;
  thumbnail: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
}

type SortOption = 'price' | 'rating' | 'discount' | 'newest';

function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'discount':
        return b.discountPercentage - a.discountPercentage;
      case 'newest':
        return b.id - a.id;
      case 'rating':
      default:
        return b.rating - a.rating;
    }
  });
}

export default function SearchScreen() {
  const router = useRouter();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam ?? null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  const categories = [
    'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration',
  ];

  const searchProducts = useCallback(async (searchQuery: string, category: string | null) => {
    if (!searchQuery.trim() && !category) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = category
        ? await productApi.getProductsByCategory(category, { limit: 100 })
        : await productApi.searchProducts(searchQuery.trim(), { limit: 100 });
      const searchTerm = searchQuery.trim().toLowerCase();
      const matchingProducts = response.products.filter((product) =>
        !searchTerm ||
        [product.title, product.description, product.brand ?? '']
          .some((value) => value.toLowerCase().includes(searchTerm))
      );
      setResults(sortProducts(matchingProducts, sortBy));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to search products';
      Alert.alert('Search failed', message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  const handleSearch = () => searchProducts(query, selectedCategory);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      void searchProducts('', categoryParam);
    }
  }, [categoryParam, searchProducts]);

  const renderResult = ({ item }: { item: Product }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => router.push(`/(app)/product/${item.id}`)}
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
              <Text style={styles.resultDetails}>
                ⭐ {item.rating} · {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <PaperTextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          left={<MaterialCommunityIcons name="magnify" size={24} color="#5F6368" style={{ marginLeft: 12 }} />}
          right={
            query ? (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                <MaterialCommunityIcons name="close" size={24} color="#5F6368" style={{ marginRight: 12 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSearch} disabled={loading} style={styles.searchButton}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialCommunityIcons name="magnify" size={24} color="white" />
                )}
              </TouchableOpacity>
            )
          }
        />
      </View>

      {/* Category Filters */}
      <View style={styles.filterSection}>
        <Title style={styles.filterTitle}>Categories</Title>
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
              onPress={() => {
                const nextCategory = selectedCategory === item ? null : item;
                setSelectedCategory(nextCategory);
                void searchProducts(query, nextCategory);
              }}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === item && styles.filterChipTextSelected,
              ]}>
                {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <Title style={styles.filterTitle}>Sort By</Title>
        <View style={styles.sortOptions}>
          {(['price', 'rating', 'discount', 'newest'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortChip,
                sortBy === option && styles.sortChipSelected,
              ]}
              onPress={() => {
                setSortBy(option);
                setResults((current) => sortProducts(current, option));
              }}
            >
              <Text style={[
                styles.sortChipText,
                sortBy === option && styles.sortChipTextSelected,
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsSection}>
        <Title style={styles.resultsTitle}>
          Results {query ? `for "${query}"` : ''} {results.length > 0 && `(${results.length})`}
        </Title>
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#1A73E8" />
          </View>
        ) : results.length === 0 && query ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={64} color="#DADCE0" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.resultsList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      <View style={styles.guideContainer}>
        <Text style={styles.guideTitle}>Browse products</Text>
        <Text style={styles.guideText}>
          Search by name or brand, choose a category, and sort products by price, rating, or discount.
        </Text>
      </View>
    </ScrollView>
  );
}
