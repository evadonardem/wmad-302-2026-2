/**
 * Home Screen - Marketplace Shop Tab
 * Students implement: Product grid, categories, flash deals, recommendations
 * APIs: https://dummyjson.com/docs/products
 */
import React, { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Card, Title, Avatar, Button, Badge, Snackbar } from 'react-native-paper';
import { createStyles } from './homeStyles';
import { HOME_PAGE_SIZE, hasMore, isNearBottom, mergeById } from '@/utils/pagination';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';

// Types for DummyJSON Products API
interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: { rating: number; comment: string; date: string; reviewerName: string }[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  images: string[];
  thumbnail: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [toast, setToast] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Scroll on demand: the server's total, and the state of loading the next page
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const loadingMoreRef = useRef(false); // blocks a second request while one is running
  const generationRef = useRef(0); // bumped on every refresh, so a late page from before it is ignored

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      setLoadMoreFailed(false);
      generationRef.current += 1;

      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`https://dummyjson.com/products?limit=${HOME_PAGE_SIZE}&skip=0`),
        fetch('https://dummyjson.com/products/categories'),
      ]);

      if (!productsRes.ok || !categoriesRes.ok) throw new Error('Failed to fetch data');

      const productsData: ProductsResponse = await productsRes.json();
      // DummyJSON now returns category objects ({ slug, name, url }), older versions
      // returned plain strings. Accept both and keep only the slug string.
      const rawCategories: (string | { slug: string })[] = await categoriesRes.json();
      const categoriesData = rawCategories.map((c) => (typeof c === 'string' ? c : c.slug));

      setProducts(productsData.products);
      setTotal(productsData.total);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => fetchData(true);

  /** Loads the next page and adds it to the end of the list. */
  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMore(products.length, total)) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    const generation = generationRef.current;
    try {
      const res = await fetch(`https://dummyjson.com/products?limit=${HOME_PAGE_SIZE}&skip=${products.length}`);
      if (!res.ok) throw new Error('Failed to load more products');
      const data: ProductsResponse = await res.json();
      if (generation !== generationRef.current) return; // the list was refreshed meanwhile
      setProducts((prev) => mergeById(prev, data.products));
      setTotal(data.total);
    } catch {
      if (generation === generationRef.current) setLoadMoreFailed(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const result = addToCart(product);
    if (result === 'added') setToast(`Added "${product.title}" to cart`);
    else if (result === 'max_reached') setToast(`Only ${product.stock} in stock - already in your cart`);
    else setToast('Sorry, this item is out of stock');
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/(app)/product/${item.id}`)}
        activeOpacity={0.8}
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
              icon="cart-plus"
              compact
              disabled={item.stock <= 0}
              onPress={() => handleAddToCart(item)}
              style={{ marginTop: 8 }}
            >
              Add to cart
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => fetchData()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={200}
        onScroll={({ nativeEvent }) => {
          // After a failed load we wait for the person to tap "Try again" instead of retrying on every scroll
          if (loadMoreFailed) return;
          const { layoutMeasurement, contentSize, contentOffset } = nativeEvent;
          if (
            isNearBottom({
              layoutHeight: layoutMeasurement.height,
              contentHeight: contentSize.height,
              offsetY: contentOffset.y,
            })
          ) {
            loadMore();
          }
        }}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeGreeting}>
              {user ? `Welcome, ${user.firstName}!` : 'Welcome to Marketplace!'}
            </Text>
            <Text style={styles.welcomeSubtitle}>Discover amazing deals</Text>
          </View>
          <Avatar.Icon size={56} icon="storefront" style={styles.welcomeAvatar} />
        </View>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Categories</Title>
          </View>
          <FlatList
            data={categories.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryChip}
                onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item)}`)}
              >
                <Text style={styles.categoryChipText}>
                  {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
        </View>

        {/* Flash Deals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>⚡ Flash Deals</Title>
            <TouchableOpacity style={styles.seeAll}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {/* Plain .map() (not a FlatList): this page already scrolls, and the list is only 5 items */}
          {products
            .filter((p) => p.discountPercentage > 20)
            .slice(0, 5)
            .map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <View style={styles.cardSeparator} />}
                {renderProduct({ item })}
              </React.Fragment>
            ))}
        </View>

        {/* Recommended Products */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Recommended for You</Title>
            <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/search')} style={styles.seeAll}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          ) : (
            products.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <View style={styles.cardSeparator} />}
                {renderProduct({ item })}
              </React.Fragment>
            ))
          )}

          {/* Scroll on demand: what is shown under the last product */}
          {products.length > 0 && (
            <View style={styles.listFooter}>
              {loadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : loadMoreFailed ? (
                <>
                  <Text style={styles.emptyText}>Couldn't load more products</Text>
                  <Button mode="outlined" compact onPress={loadMore} style={styles.retryButton}>
                    Try again
                  </Button>
                </>
              ) : !hasMore(products.length, total) ? (
                <Text style={styles.emptyText}>You've seen all {total} products</Text>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

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