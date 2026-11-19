/** Product search, category filtering, and client-side sorting. */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Title, TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Product } from '@/types/product';
import { recordSearch } from '@/utils/searchHistory';
import ProductTile from '@/components/ProductTile';
import { styles } from './searchStyles';

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
  const { totalQuantity } = useCart();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam ?? null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = [
    'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration',
  ];
  const searchSuggestions = ['phone', 'laptop', 'perfume', 'skincare'];

  useEffect(() => {
    if (categoryParam) return;

    let active = true;
    setFeaturedLoading(true);
    productApi.getProducts({ limit: 6 })
      .then((response) => {
        if (active) setFeaturedProducts(response.products);
      })
      .catch((error: unknown) => {
        if (active) {
          Alert.alert(
            'Could not load featured products',
            error instanceof Error ? error.message : 'Please try again.'
          );
        }
      })
      .finally(() => {
        if (active) setFeaturedLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categoryParam]);

  const searchProducts = useCallback(async (searchQuery: string, category: string | null) => {
    if (!searchQuery.trim() && !category) {
      setResults([]);
      return;
    }

    setHasSearched(true);
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

  const trackSearch = (term: string) => {
    void recordSearch(term).catch((error: unknown) => {
      Alert.alert(
        'Could not save search',
        error instanceof Error ? error.message : 'Please try again.'
      );
    });
  };

  const handleSearch = () => {
    if (!query.trim() && !selectedCategory) return;
    trackSearch(query.trim() || selectedCategory || '');
    router.push({
      pathname: '/(app)/search-results',
      params: {
        ...(query.trim() ? { q: query.trim() } : {}),
        ...(selectedCategory ? { category: selectedCategory } : {}),
      },
    });
  };

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      void searchProducts('', categoryParam);
    }
  }, [categoryParam, searchProducts]);

  const handleFavorite = async (product: Product) => {
    try {
      const added = await toggleFavorite(product.id);
      Alert.alert(added ? 'Saved to wishlist' : 'Removed from wishlist', product.title);
    } catch (favoriteError) {
      Alert.alert(
        'Wishlist unavailable',
        favoriteError instanceof Error ? favoriteError.message : 'Please try again.'
      );
    }
  };

  const renderResult = ({ item }: { item: Product }) => (
    <ProductTile
      product={item}
      isFavorite={isFavorite(item.id)}
      onPress={() => router.push(`/(app)/product/${item.id}`)}
      onToggleFavorite={() => void handleFavorite(item)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchField, styles.searchHeader]}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(app)/(tabs)/home')}
          accessibilityRole="button"
          accessibilityLabel="Go to home"
        >
          <MaterialCommunityIcons name="home-outline" size={23} color="#75648A" />
        </TouchableOpacity>
        <PaperTextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
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
        {actionsExpanded && (
          <>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => router.push('/(app)/wishlist')}
              accessibilityRole="button"
              accessibilityLabel="Open wishlist"
            >
              <MaterialCommunityIcons name="heart-outline" size={23} color="#75648A" />
              {favoriteIds.length > 0 && (
                <View style={styles.headerActionBadge}>
                  <Text style={styles.headerActionBadgeText}>{favoriteIds.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => router.push('/(app)/(tabs)/cart')}
              accessibilityRole="button"
              accessibilityLabel="Open cart"
            >
              <MaterialCommunityIcons name="cart-outline" size={23} color="#75648A" />
              {totalQuantity > 0 && (
                <View style={styles.headerActionBadge}>
                  <Text style={styles.headerActionBadgeText}>{totalQuantity}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => router.push('/(app)/(tabs)/profile')}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <MaterialCommunityIcons name="account-outline" size={23} color="#75648A" />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={styles.drawerToggle}
          onPress={() => setActionsExpanded((expanded) => !expanded)}
          accessibilityRole="button"
          accessibilityLabel={actionsExpanded ? 'Hide shortcuts' : 'Show shortcuts'}
          accessibilityState={{ expanded: actionsExpanded }}
        >
          <MaterialCommunityIcons
            name={actionsExpanded ? 'chevron-up' : 'dots-horizontal'}
            size={23}
            color="#75648A"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.searchContent}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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
                if (nextCategory) {
                  router.push({
                    pathname: '/(app)/search-results',
                    params: { category: nextCategory },
                  });
                }
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
            <ActivityIndicator size="large" color="#75648A" />
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
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.resultsList}
          />
        )}
      </View>

      {!hasSearched && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Popular searches</Text>
          <View style={styles.suggestionsList}>
            {searchSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => {
                  setQuery(suggestion);
                  trackSearch(suggestion);
                  router.push({
                    pathname: '/(app)/search-results',
                    params: { q: suggestion },
                  });
                }}
              >
                <MaterialCommunityIcons name="magnify" size={16} color="#75648A" />
                <Text style={styles.suggestionText}>
                  {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {!hasSearched && (
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Featured products</Text>
          {featuredLoading ? (
            <ActivityIndicator color="#75648A" style={styles.featuredLoading} />
          ) : (
            <FlatList
              data={featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.featuredList}
              renderItem={({ item }) => {
                const salePrice = item.price * (1 - item.discountPercentage / 100);
                return (
                  <TouchableOpacity
                    style={styles.featuredCard}
                    onPress={() => router.push(`/(app)/product/${item.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${item.title}`}
                  >
                    <View style={styles.featuredImageContainer}>
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.featuredImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.featuredBadge}>Featured</Text>
                    </View>
                    <Text style={styles.featuredProductTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.featuredPrice}>${salePrice.toFixed(2)}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      <View style={styles.guideContainer}>
        <Text style={styles.guideTitle}>Browse products</Text>
        <Text style={styles.guideText}>
          Search by name or brand, choose a category, and sort products by price, rating, or discount.
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}
