/**
 * Home Screen - Marketplace storefront
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Snackbar } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';
import { favoritesStorage } from '@/utils/storage';
import { Alert } from '@/utils/alert';
import { styles as baseStyles } from './homeStyles';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { getThemedStyles } from '@/utils/themeStyles';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CATEGORY_ICON_MAP: Record<string, IconName> = {
  beauty: 'lipstick',
  fragrances: 'spray',
  furniture: 'sofa',
  groceries: 'basket-outline',
  smartphones: 'cellphone',
  laptops: 'laptop',
  'home-decoration': 'lamp',
  'kitchen-accessories': 'silverware-fork-knife',
  'mens-shirts': 'tshirt-crew-outline',
  'mens-shoes': 'shoe-sneaker',
  'mens-watches': 'watch',
  'womens-dresses': 'tshirt-crew-outline',
  'womens-bags': 'bag-personal',
  'womens-jewellery': 'diamond-stone',
  'womens-shoes': 'shoe-heel',
  'womens-watches': 'watch',
  'sports-accessories': 'basketball',
  sunglasses: 'sunglasses',
  tablets: 'tablet',
  tops: 'hanger',
  'vehicle': 'car',
  'motorcycle': 'motorbike',
  'skin-care': 'face-woman',
  'mobile-accessories': 'headphones',
  'electronics-accessories': 'headphones',
};

const getCategoryIcon = (category: string): IconName => {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_ICON_MAP[normalized] ?? 'package-variant';
};

const PAGE_SIZE = 20;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, colorMode } = useAppPreferences();
  const styles = getThemedStyles(baseStyles, colorMode === 'dark');
  const { addToCart, isLoading: cartLoading, itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [dealCountdown, setDealCountdown] = useState('');
  const [dealsExpired, setDealsExpired] = useState(false);
  const [dealDeadline] = useState(() => {
    const endOfDay = new Date();
    endOfDay.setHours(24, 0, 0, 0);
    return endOfDay.getTime();
  });

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(0, dealDeadline - Date.now());
      setDealsExpired(remaining === 0);
      const hours = Math.floor(remaining / 3_600_000);
      const minutes = Math.floor((remaining % 3_600_000) / 60_000);
      const seconds = Math.floor((remaining % 60_000) / 1_000);
      setDealCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [dealDeadline]);

  const fetchData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [productResponse, categoryResponse, favorites] = await Promise.all([
        productApi.getProducts({ limit: PAGE_SIZE, skip: 0, sortBy: 'rating', order: 'desc' }),
        productApi.getCategories(),
        favoritesStorage.getIds(),
      ]);
      setProducts(productResponse.products);
      setTotal(productResponse.total);
      setCategories(categoryResponse);
      setFavoriteIds(favorites);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load the marketplace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const loadMore = async () => {
    if (loadingMore || loading || products.length >= total) return;
    setLoadingMore(true);
    try {
      const response = await productApi.getProducts({
        limit: PAGE_SIZE,
        skip: products.length,
        sortBy: 'rating',
        order: 'desc',
      });
      setProducts((current) => [...current, ...response.products]);
      setTotal(response.total);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load more products.');
    } finally {
      setLoadingMore(false);
    }
  };

  const flashDeals = useMemo(
    () => [...products].sort((a, b) => b.discountPercentage - a.discountPercentage)
      .filter((product) => product.discountPercentage > 0)
      .slice(0, 6),
    [products]
  );

  const toggleFavorite = async (product: Product) => {
    try {
      const isFavorite = await favoritesStorage.toggleId(product.id);
      setFavoriteIds((current) => isFavorite
        ? [...current, product.id]
        : current.filter((id) => id !== product.id));
    } catch (favoriteError: unknown) {
      console.error('Could not update wishlist:', favoriteError);
      Alert.alert('Wishlist update failed', 'Please try again.');
    }
  };

  const addProductToCart = (product: Product) => {
    if (cartLoading) {
      setCartFeedback(t('Cart is still loading. Please try again.'));
      return;
    }
    if (product.stock < 1) {
      setCartFeedback(t('Out of stock'));
      return;
    }
    if (!addToCart(product)) {
      setCartFeedback(t('Stock limit reached'));
      return;
    }
    setCartFeedback(`${product.title} ${t('Added to cart').toLowerCase()}`);
  };

  const openProduct = (product: Product) => router.push(`/(app)/product/${product.id}`);
  const discountedPrice = (product: Product) =>
    product.price * (1 - product.discountPercentage / 100);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productTile}>
      <View style={styles.gridImageWrap}>
        <TouchableOpacity onPress={() => openProduct(item)} activeOpacity={0.9}>
          <Image source={{ uri: item.thumbnail }} style={styles.gridImage} resizeMode="contain" />
        </TouchableOpacity>
        {item.discountPercentage > 0 && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>-{Math.round(item.discountPercentage)}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => void toggleFavorite(item)}
          accessibilityRole="button"
          accessibilityLabel={favoriteIds.includes(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <MaterialCommunityIcons
            name={favoriteIds.includes(item.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={favoriteIds.includes(item.id) ? '#EA4335' : '#5F6368'}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => openProduct(item)} activeOpacity={0.8}>
        <Text style={styles.gridProductName} numberOfLines={2}>{item.title}</Text>
        <View style={styles.gridPriceRow}>
          <Text style={styles.gridPrice}>${discountedPrice(item).toFixed(2)}</Text>
          {item.discountPercentage > 0 && (
            <Text style={styles.gridOldPrice}>${item.price.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.gridMetaRow}>
          <Text style={styles.gridRating}>★ {item.rating.toFixed(1)}</Text>
          <Text style={styles.gridSold}>Stock {item.stock}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickAddButton}
        onPress={() => addProductToCart(item)}
        disabled={cartLoading}
        accessibilityState={{ disabled: cartLoading }}
        accessibilityRole="button"
        accessibilityLabel={`Add ${item.title} to cart`}
      >
        <MaterialCommunityIcons name="cart-plus" size={18} color="#FFFFFF" />
        <Text style={styles.quickAddText}>{t('Add to cart')}</Text>
      </TouchableOpacity>
    </View>
  );

  const listHeader = (
    <View>
      <View style={styles.storeHeader}>
        <View>
          <Text style={styles.storeEyebrow}>MARKETPLACE</Text>
          <Text style={styles.storeGreeting}>
            {user ? `Hi, ${user.firstName}!` : t('Shop smarter today')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerCart}
          onPress={() => router.push('/(app)/(tabs)/cart')}
          accessibilityRole="button"
          accessibilityLabel="Open shopping cart"
        >
          <MaterialCommunityIcons name="cart-outline" size={24} color="#202124" />
          {itemCount > 0 && (
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{itemCount > 99 ? '99+' : itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/(app)/(tabs)/search')}
        accessibilityRole="button"
        accessibilityLabel="Search products"
      >
        <MaterialCommunityIcons name="magnify" size={22} color="#5F6368" />
        <Text style={styles.searchPlaceholder}>{t('Search products, brands and more')}</Text>
        <MaterialCommunityIcons name="tune-variant" size={20} color="#66BB6A" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.promoBanner}
        onPress={() => router.push('/(app)/(tabs)/search')}
        activeOpacity={0.9}
      >
        <View style={styles.promoCopy}>
          <Text style={styles.promoEyebrow}>{t("TODAY'S PICKS")}</Text>
          <Text style={styles.promoTitle}>{t('Deals worth discovering')}</Text>
          <Text style={styles.promoSubtitle}>{t('Great finds. Great prices.')}</Text>
          <View style={styles.promoCta}>
            <Text style={styles.promoCtaText}>{t('Shop now')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
          </View>
        </View>
        <MaterialCommunityIcons name="tag-heart" size={76} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('Shop by category')}</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/categories')}>
            <Text style={styles.seeAllText}>{t('See all')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.slice(0, 10).map((category) => {
            return (
              <TouchableOpacity
                key={category}
                style={styles.categoryItem}
                onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(category)}`)}
                accessibilityRole="button"
              >
                <View style={styles.categoryIcon}>
                  <MaterialCommunityIcons
                    name={getCategoryIcon(category)}
                    size={24}
                    color="#66BB6A"
                  />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.replace(/-/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('flashDeals')}</Text>
            <Text style={styles.sectionSubtitle}>{t('limitedTimePrices')}</Text>
          </View>
          <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F29900" />
        </View>
        <Text style={{ color: '#EA4335', fontWeight: '700', marginBottom: 8 }}>
          {dealsExpired ? t('Deals ended for today.') : `${t('Ends in')} ${dealCountdown}`}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealList}>
          {(dealsExpired ? [] : flashDeals).map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.dealCard}
              onPress={() => openProduct(product)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: product.thumbnail }} style={styles.dealImage} resizeMode="contain" />
              <Text style={styles.dealTitle} numberOfLines={1}>{product.title}</Text>
              <Text style={styles.dealPrice}>${discountedPrice(product).toFixed(2)}</Text>
              <Text style={styles.dealDiscount}>Save {Math.round(product.discountPercentage)}%</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.productSectionTitle}>
        <View>
          <Text style={styles.sectionTitle}>{t('Recommended for you')}</Text>
          <Text style={styles.sectionSubtitle}>{t('Popular finds across the marketplace')}</Text>
        </View>
        <MaterialCommunityIcons name="star-circle" size={24} color="#F29900" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66BB6A" />
        <Text style={styles.loadingText}>{t('Finding great deals...')}</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => void fetchData()} style={styles.retryButton}>{t('Try again')}</Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.storeContent}
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={listHeader}
        ListFooterComponent={loadingMore ? (
          <ActivityIndicator style={styles.listFooter} color="#66BB6A" />
        ) : error ? (
          <Button mode="text" onPress={() => void loadMore()}>{t('Could not load more. Tap to retry.')}</Button>
        ) : null}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void fetchData(true)} colors={['#66BB6A']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('No products available right now.')}</Text>
          </View>
        }
      />
      <Snackbar
        visible={cartFeedback !== null}
        onDismiss={() => setCartFeedback(null)}
        duration={3000}
        action={{
          label: t('View cart'),
          onPress: () => {
            setCartFeedback(null);
            router.push('/(app)/(tabs)/cart');
          },
        }}
      >
        {cartFeedback ?? ''}
      </Snackbar>
    </View>
  );
}
