import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';
import { usePagedProducts } from '@/hooks/usePagedProducts';
import { styles } from '@/styles/homeStyles';
import { showAlert } from '@/utils/platformAlert';

const brandPurple = '#75648A';

const DealCountdown = React.memo(function DealCountdown() {
  const [countdown, setCountdown] = useState(5 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((seconds) => (seconds > 0 ? seconds - 1 : 5 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60).toString().padStart(2, '0');
  const seconds = (countdown % 60).toString().padStart(2, '0');

  return (
    <View style={styles.flashTimer}>
      <Text style={styles.flashCaption}>Deals end in</Text>
      <Text style={styles.timerDigits}>{minutes}:{seconds}</Text>
    </View>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    products,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    loadMoreError,
    refresh,
    loadMore,
    retryLoadMore,
  } = usePagedProducts({ pageSize: 30 });
  const [categories, setCategories] = useState<string[]>([]);
  const categoryItems = useMemo(() => categories.slice(0, 12), [categories]);
  const flashDeals = useMemo(
    () => products.filter((product) => product.discountPercentage >= 15).slice(0, 10),
    [products]
  );

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await productApi.getCategories());
    } catch (requestError) {
      showAlert(
        'Could not load categories',
        requestError instanceof Error ? requestError.message : 'Please try again.'
      );
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleFavorite = useCallback(async (product: Product) => {
    try {
      const added = await toggleFavorite(product.id);
      showAlert(added ? 'Saved to wishlist' : 'Removed from wishlist', product.title);
    } catch (favoriteError) {
      showAlert('Wishlist unavailable', favoriteError instanceof Error ? favoriteError.message : 'Please try again.');
    }
  }, [toggleFavorite]);

  const renderProduct = useCallback((product: Product, compact = false) => {
    const salePrice = product.price * (1 - product.discountPercentage / 100);
    return (
      <View style={[styles.productCard, compact && styles.carouselCard]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/(app)/product/${product.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`View ${product.title}, ${salePrice.toFixed(2)} dollars, ${
            product.stock > 0 ? 'in stock' : 'sold out'
          }`}
        >
          <Card style={styles.card} mode="contained">
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: product.thumbnail }}
                style={styles.productImage}
                contentFit="contain"
                cachePolicy="memory-disk"
                recyclingKey={String(product.id)}
              />
              {product.discountPercentage > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{Math.round(product.discountPercentage)}%</Text>
                </View>
              )}
            </View>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.productCategory} numberOfLines={1}>{product.category.replace(/-/g, ' ')}</Text>
              <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>${salePrice.toFixed(2)}</Text>
                {product.discountPercentage > 0 && (
                  <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                )}
              </View>
              <Text style={styles.ratingText}>
                ★ {product.rating.toFixed(1)}  ·  {product.stock > 0 ? 'In stock' : 'Sold out'}
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => void handleFavorite(product)}
          accessibilityRole="button"
          accessibilityLabel={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          accessibilityState={{ selected: isFavorite(product.id) }}
        >
          <MaterialCommunityIcons
            name={isFavorite(product.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite(product.id) ? brandPurple : '#555'}
          />
        </TouchableOpacity>
      </View>
    );
  }, [handleFavorite, isFavorite, router]);

  const renderSectionHeading = (title: string, action?: () => void, actionLabel = 'See all') => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action}>
          <Text style={styles.seeAll}>{actionLabel} ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandPurple} />
          <Text style={styles.loadingText}>Finding today&apos;s deals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" buttonColor={brandPurple} onPress={() => void refresh()}>Try again</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => renderProduct(item)}
        columnWrapperStyle={styles.productGridRow}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refresh(true);
              void loadCategories();
            }}
            colors={[brandPurple]}
          />
        }
      ListHeaderComponent={
        <>
      <View style={styles.topBar}>
        <View style={styles.brandBlock}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/kartora-logo.png')}
              style={styles.brandLogo}
              contentFit="contain"
              cachePolicy="memory-disk"
              accessibilityLabel="Kartora logo"
            />
            <View>
              <Text style={styles.brand}>Kartora</Text>
              <Text style={styles.brandTagline}>You Shop. We Deliver.</Text>
            </View>
          </View>
          <Text style={styles.greeting}>Hi{user?.firstName ? `, ${user.firstName}` : ''}! What are you shopping for?</Text>
        </View>
        <View style={styles.topActions}>
          <IconButton icon="heart-outline" iconColor={brandPurple} size={21} style={styles.topActionButton} onPress={() => router.push('/(app)/wishlist')} accessibilityLabel="Open wishlist" />
          <View>
            <IconButton icon="cart-outline" iconColor={brandPurple} size={21} style={styles.topActionButton} onPress={() => router.push('/(app)/(tabs)/cart')} accessibilityLabel={`Open cart, ${totalQuantity} items`} />
            {totalQuantity > 0 && (
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalQuantity}</Text></View>
            )}
          </View>
          {user?.image ? (
            <Avatar.Image size={38} source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <Avatar.Text
              size={38}
              label={`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U'}
              style={styles.avatar}
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/(app)/(tabs)/search')}
        accessibilityRole="button"
        accessibilityLabel="Search products, brands, and more"
      >
        <MaterialCommunityIcons name="magnify" size={23} color={brandPurple} />
        <Text style={styles.searchPlaceholder}>Search products, brands, and more</Text>
        <MaterialCommunityIcons name="camera-outline" size={21} color={brandPurple} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.promoBanner}
        onPress={() => router.push('/(app)/(tabs)/search')}
        accessibilityRole="button"
        accessibilityLabel="Shop today's deals"
      >
        <View style={styles.promoText}>
          <Text style={styles.promoEyebrow}>MEGA SHOPPING DAYS</Text>
          <Text style={styles.promoTitle}>Big deals.{'\n'}Bigger smiles.</Text>
          <Text style={styles.promoSubtitle}>Discover something you love today</Text>
          <Text style={styles.promoCta}>Shop now  ›</Text>
        </View>
        <MaterialCommunityIcons name="shopping" size={76} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.quickLinks}>
        {[
          { icon: 'truck-fast-outline' as const, label: 'Free shipping' },
          { icon: 'ticket-percent-outline' as const, label: 'Daily vouchers' },
          { icon: 'shield-check-outline' as const, label: 'Shop with trust' },
        ].map((item) => (
          <View key={item.label} style={styles.quickLink}>
            <MaterialCommunityIcons name={item.icon} size={22} color={brandPurple} />
            <Text style={styles.quickLinkText}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        {renderSectionHeading('Shop by category', () => router.push('/(app)/(tabs)/categories'))}
        <FlatList
          data={categoryItems}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item)}`)}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${item.replace(/-/g, ' ')}`}
            >
              <View style={[styles.categoryIcon, { backgroundColor: categoryColors[index % categoryColors.length] }]}>
                <MaterialCommunityIcons name={categoryIcons[index % categoryIcons.length]} size={24} color={brandPurple} />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>{item.replace(/-/g, ' ')}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.flashSection}>
        {renderSectionHeading('Flash sale', () => router.push('/(app)/(tabs)/search'), 'Shop more')}
        <DealCountdown />
        {flashDeals.length === 0 ? (
          <Text style={styles.emptyText}>More deals are coming soon.</Text>
        ) : (
          <FlatList
            data={flashDeals}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.horizontalProducts}
            renderItem={({ item }) => renderProduct(item, true)}
          />
        )}
      </View>

      <View style={styles.sectionContainer}>
        {renderSectionHeading("Today's picks", () => router.push('/(app)/(tabs)/search'))}
      </View>
        </>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No products available right now.</Text>}
      onEndReached={() => void loadMore()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore || hasMore || loadMoreError || error ? (
          <View style={styles.loadMoreFooter}>
            {loadingMore ? (
              <ActivityIndicator color={brandPurple} accessibilityLabel="Loading more products" />
            ) : error ? (
              <>
                <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
                <Button mode="outlined" onPress={() => void refresh(true)}>Retry refresh</Button>
              </>
            ) : loadMoreError ? (
              <>
                <Text accessibilityRole="alert" style={styles.errorText}>{loadMoreError}</Text>
                <Button mode="outlined" onPress={() => void retryLoadMore()}>Retry loading products</Button>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => void loadMore()}
                accessibilityRole="button"
                accessibilityLabel="Load more products"
                style={styles.loadMoreButton}
              >
                <Text style={styles.loadMoreText}>Load more products</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
    </SafeAreaView>
  );
}

const categoryIcons = [
  'cellphone', 'laptop', 'face-woman', 'spray', 'cart', 'home-outline',
  'sofa-outline', 'silverware-fork-knife', 'car', 'headphones', 'watch', 'diamond-stone',
] as const;
const categoryColors = ['#F2EEF5', '#EBE7EF', '#F7F4F8', '#E6DEED', '#F3F0F6', '#DCD4E5'];
