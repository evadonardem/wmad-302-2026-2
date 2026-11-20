import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, Menu, TextInput as PaperTextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Product } from '@/types/product';
import { recordSearch } from '@/utils/searchHistory';
import ProductTile from '@/components/ProductTile';
import { styles } from '@/styles/searchResultsStyles';

type SortOption = 'price' | 'rating' | 'discount' | 'newest' | 'name';
type SortOrder = 'asc' | 'desc';

const sortOptionLabels: Record<SortOption, string> = {
  price: 'Price',
  rating: 'Rating',
  discount: 'Discount',
  newest: 'Newest',
  name: 'Name',
};

function sortProducts(
  products: Product[],
  sortBy: SortOption,
  sortOrder: SortOrder
): Product[] {
  return [...products].sort((a, b) => {
    let comparison: number;
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'discount':
        comparison = a.discountPercentage - b.discountPercentage;
        break;
      case 'newest':
        comparison = a.id - b.id;
        break;
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'rating':
      default:
        comparison = a.rating - b.rating;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

export default function SearchResultsScreen() {
  const router = useRouter();
  const { totalQuantity } = useCart();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortMenuOption, setSortMenuOption] = useState<SortOption | null>(null);
  const [searchText, setSearchText] = useState(params.q?.trim() ?? '');
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const query = params.q?.trim() ?? '';
  const category = params.category?.trim() ?? '';

  useEffect(() => {
    let active = true;

    async function loadResults() {
      setLoading(true);
      setError(null);
      try {
        const response = category
          ? await productApi.getProductsByCategory(category, { limit: 100 })
          : await productApi.searchProducts(query, { limit: 100 });

        const searchTerm = query.toLowerCase();
        const matchingProducts = response.products.filter((product) =>
          !searchTerm ||
          [product.title, product.description, product.brand ?? '']
            .some((value) => value.toLowerCase().includes(searchTerm))
        );
        if (active) setProducts(matchingProducts);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load results');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (query || category) void loadResults();
    else {
      setProducts([]);
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [query, category]);

  useEffect(() => {
    setSearchText(query);
  }, [query]);

  const sortedProducts = useMemo(
    () => sortProducts(products, sortBy, sortOrder),
    [products, sortBy, sortOrder]
  );

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

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductTile
      product={item}
      isFavorite={isFavorite(item.id)}
      onPress={() => router.push(`/(app)/product/${item.id}`)}
      onToggleFavorite={() => void handleFavorite(item)}
    />
  );

  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
    : '';
  const heading = category
    ? `${categoryLabel}${query ? ` · "${query}"` : ''}`
    : `Results for "${query}"`;
  const submitSearch = () => {
    if (!searchText.trim()) return;
    void recordSearch(searchText.trim()).catch((error: unknown) => {
      Alert.alert(
        'Could not save search',
        error instanceof Error ? error.message : 'Please try again.'
      );
    });
    router.setParams({ q: searchText.trim(), category: category || undefined });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={submitSearch}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          right={
            <View style={styles.searchActions}>
              {searchText ? (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <MaterialCommunityIcons name="close" size={24} color="#5F6368" />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={submitSearch}
                disabled={loading}
                style={styles.searchButton}
                accessibilityRole="button"
                accessibilityLabel="Search"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialCommunityIcons name="magnify" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
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

      <View style={styles.sortRow}>
        <View style={styles.resultsHeading}>
          <Text style={styles.resultsTitle} numberOfLines={1}>{heading}</Text>
          {!loading && !error && (
            <Text style={styles.resultsCount}>{sortedProducts.length} products</Text>
          )}
        </View>
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                setSortMenuOption(null);
                setSortMenuVisible(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Sort by"
            >
              <Text style={styles.sortLabel}>Sort by</Text>
              <Text style={styles.sortValue}>
                {`${sortOptionLabels[sortBy]} · ${sortOrder === 'asc' ? '↑' : '↓'}`}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#75648A" />
            </TouchableOpacity>
          }
        >
          {sortMenuOption ? (
            <>
              <Menu.Item
                title={`Sort by ${sortOptionLabels[sortMenuOption]}`}
                leadingIcon="arrow-left"
                onPress={() => setSortMenuOption(null)}
              />
              <Divider />
              {(['asc', 'desc'] as const).map((order) => {
                const directionLabels = sortMenuOption === 'newest'
                  ? { asc: 'Oldest to Newest', desc: 'Newest to Oldest' }
                  : sortMenuOption === 'name'
                    ? { asc: 'A to Z', desc: 'Z to A' }
                    : { asc: 'Low to High', desc: 'High to Low' };
                return (
                  <Menu.Item
                    key={order}
                    title={directionLabels[order]}
                    leadingIcon={sortOrder === order ? 'check' : undefined}
                    onPress={() => {
                      setSortBy(sortMenuOption);
                      setSortOrder(order);
                      setSortMenuVisible(false);
                      setSortMenuOption(null);
                    }}
                  />
                );
              })}
            </>
          ) : (
            (Object.keys(sortOptionLabels) as SortOption[]).map((option) => (
              <Menu.Item
                key={option}
                title={sortOptionLabels[option]}
                leadingIcon={sortBy === option ? 'check' : undefined}
                trailingIcon="chevron-right"
                onPress={() => {
                  setSortBy(option);
                  setSortOrder(option === 'price' || option === 'name' ? 'asc' : 'desc');
                  setSortMenuOption(option);
                }}
              />
            ))
          )}
        </Menu>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#75648A" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#D93025" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : sortedProducts.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="magnify" size={64} color="#DADCE0" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <TouchableOpacity
            style={styles.backToSearchButton}
            onPress={() => router.push('/(app)/(tabs)/search')}
          >
            <Text style={styles.backToSearchText}>Change search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
}
