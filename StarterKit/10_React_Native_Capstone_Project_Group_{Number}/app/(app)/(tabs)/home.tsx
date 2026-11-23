
/**
 * Home Screen - product discovery
 * Lavender marketplace design
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { getDiscountedPrice } from '@/utils/cart';
import { Skeleton } from '@/components/CommonComponents';
import {
  Card,
  Title,
  Button,
  Avatar,
  Badge,
  IconButton,
  Snackbar,
} from 'react-native-paper';
import type { Product } from '@/types/product';
import { styles } from './homeStyles';

const PAGE_SIZE = 20;
const ACCENT_COLOR = '#8B5CF6';

const formatLabel = (slug: string) =>
  slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);

  const loadInitial = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const [page, deals, cats] = await Promise.all([
        productApi.getProducts({ limit: PAGE_SIZE, skip: 0 }),
        productApi.getProducts({
          limit: 6,
          sortBy: 'discountPercentage',
          order: 'desc',
        }),
        productApi.getCategories(),
      ]);

      setProducts(page.products);
      setTotal(page.total);
      setFlashDeals(deals.products);
      setCategories(cats);
    } catch {
      setError(
        'Could not load products. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (
      loadingMoreRef.current ||
      loading ||
      error ||
      products.length >= total
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const page = await productApi.getProducts({
        limit: PAGE_SIZE,
        skip: products.length,
      });

      setProducts((prev) => [...prev, ...page.products]);
    } catch {
      setMessage('Could not load more products');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleAdd = (product: Product) => {
    addToCart(product);
    setMessage(`Added ${product.title} to cart`);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const discounted = getDiscountedPrice(
      item.price,
      item.discountPercentage
    );

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/(app)/product/${item.id}`)}
        activeOpacity={0.92}
      >
        <Card style={styles.card} elevation={2}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.productImage}
              contentFit="contain"
              transition={250}
            />

            {item.discountPercentage > 0 && (
              <Badge style={styles.discountBadge}>
                {`-${Math.round(item.discountPercentage)}%`}
              </Badge>
            )}
          </View>

          <Card.Content style={styles.cardContent}>
            <Text style={styles.productCategory}>
              {formatLabel(item.category)}
            </Text>

            <Title style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Title>

            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>
                ${discounted.toFixed(2)}
              </Text>

              {item.discountPercentage > 0 && (
                <Text style={styles.originalPrice}>
                  ${item.price.toFixed(2)}
                </Text>
              )}
            </View>

            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>
                ⭐ {item.rating.toFixed(1)} ·{' '}
                {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Text>

              <IconButton
                icon="cart-plus"
                iconColor={ACCENT_COLOR}
                size={22}
                disabled={item.stock <= 0}
                onPress={() => handleAdd(item)}
                accessibilityLabel={`Add ${item.title} to cart`}
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.scrollContent}>
        <Skeleton height={100} borderRadius={20} />
        <View style={{ height: 20 }} />
        <Skeleton height={36} />
        <View style={{ height: 16 }} />
        <Skeleton height={220} borderRadius={20} />
        <View style={{ height: 16 }} />
        <Skeleton height={220} borderRadius={20} />
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => loadInitial()}
          style={styles.retryButton}
          buttonColor={ACCENT_COLOR}
        >
          Retry
        </Button>
      </View>
    );
  }

  const header = (
    <View>
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeGreeting}>
            {user ? `Welcome, ${user.firstName}!` : 'Welcome to Marketplace!'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Discover amazing deals
          </Text>
        </View>

        <Avatar.Icon
          size={56}
          icon="storefront"
          style={styles.welcomeAvatar}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Categories</Title>

          <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/categories')}
            style={styles.seeAll}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryChip}
              activeOpacity={0.75}
              onPress={() =>
                router.push(
                  `/(app)/(tabs)/search?category=${encodeURIComponent(item)}`
                )
              }
            >
              <Text style={styles.categoryChipText}>
                {formatLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {flashDeals.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>⚡ Flash Deals</Title>
          </View>

          <FlatList
            data={flashDeals}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ width: 220, marginRight: 12 }}>
                {renderProduct({ item })}
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Title style={styles.sectionTitle}>Recommended for You</Title>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FF' }}>
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => (
          <View style={styles.cardSeparator} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ padding: 16 }}
              color={ACCENT_COLOR}
            />
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadInitial(true);
            }}
            colors={[ACCENT_COLOR]}
            tintColor={ACCENT_COLOR}
          />
        }
      />

      <Snackbar
        visible={message !== null}
        onDismiss={() => setMessage(null)}
        duration={2500}
      >
        {message ?? ''}
      </Snackbar>
    </View>
  );
}

