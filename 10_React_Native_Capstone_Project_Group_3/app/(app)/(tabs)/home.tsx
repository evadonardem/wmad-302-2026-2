/**
 * Home Screen - Marketplace Shop Tab
 * Product discovery with pagination, flash deals, categories, and pull-to-refresh
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Badge, Button, Card, Title } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';
import { styles } from './homeStyles';

const PAGE_SIZE = 20;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = products.length < totalProducts;

  const loadInitialData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        productApi.getProducts({ limit: PAGE_SIZE, skip: 0 }),
        productApi.getCategories(),
      ]);

      setProducts(productsData.products);
      setTotalProducts(productsData.total);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData(false);
  }, [loadInitialData]);

  const handleLoadMore = async () => {
    if (loading || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextData = await productApi.getProducts({
        limit: PAGE_SIZE,
        skip: products.length,
      });
      setTotalProducts(nextData.total);
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const uniqueNext = nextData.products.filter((p) => !seen.has(p.id));
        return [...prev, ...uniqueNext];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more products');
    } finally {
      setLoadingMore(false);
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.85}
      >
        <Card style={styles.card} elevation={2}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.productImage}
              resizeMode="contain"
            />
            {item.discountPercentage > 0 && (
              <Badge style={styles.discountBadge}>
                {`-${Math.round(item.discountPercentage)}%`}
              </Badge>
            )}
          </View>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Title style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Title>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>${discountedPrice.toFixed(2)}</Text>
              {item.discountPercentage > 0 && (
                <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
              )}
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>
                ⭐ {item.rating.toFixed(1)} · {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
            <Button
              mode="contained-tonal"
              compact
              disabled={item.stock <= 0}
              onPress={() => addToCart(item, 1)}
              style={{ marginTop: 10 }}
            >
              Add to Cart
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => loadInitialData(false)} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  const flashDeals = products.filter((p) => p.discountPercentage >= 15).slice(0, 5);

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadInitialData(true)}
          colors={['#1A73E8']}
        />
      }
      contentContainerStyle={styles.scrollContent}
    >
      {/* Welcome & Quick Search Header */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeGreeting}>
            {user ? `Welcome, ${user.firstName}!` : 'Welcome to Marketplace!'}
          </Text>
          <Text style={styles.welcomeSubtitle}>Discover amazing deals</Text>
          <Button
            mode="outlined"
            compact
            icon="magnify"
            onPress={() => router.push('/(app)/(tabs)/search')}
            style={{ marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#FFFFFF' }}
          >
            Search Products
          </Button>
        </View>
        <Avatar.Icon size={56} icon="storefront" style={styles.welcomeAvatar} />
      </View>

      {/* Categories Strip */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Categories</Title>
          <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/categories')}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>All Categories</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories.slice(0, 12)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryChip}
              onPress={() =>
                router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item)}`)
              }
            >
              <Text style={styles.categoryChipText}>
                {item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' ')}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>⚡ Flash Deals</Title>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)/search?sort=discount')}
              style={styles.seeAll}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={flashDeals}
            scrollEnabled={false}
            renderItem={renderProductCard}
            keyExtractor={(item) => `flash-${item.id}`}
            ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          />
        </View>
      )}

      {/* All Products with Pagination */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>
            Explore Products ({products.length}/{totalProducts})
          </Title>
          <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/search')}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>Filter</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={products}
          scrollEnabled={false}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />

        {hasMore && (
          <Button
            mode="contained"
            onPress={handleLoadMore}
            loading={loadingMore}
            disabled={loadingMore}
            style={{ marginTop: 16, borderRadius: 8 }}
          >
            {loadingMore ? 'Loading more...' : 'Load More Products'}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}