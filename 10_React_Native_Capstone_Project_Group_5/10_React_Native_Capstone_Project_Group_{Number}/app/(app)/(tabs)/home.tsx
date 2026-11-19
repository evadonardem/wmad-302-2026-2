import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';
import { styles } from './homeStyles';

const orange = '#EE4D2D';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5 * 60);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [productsResponse, categoryNames] = await Promise.all([
        productApi.getProducts({ limit: 30 }),
        productApi.getCategories(),
      ]);
      setProducts(productsResponse.products);
      setCategories(categoryNames);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((seconds) => (seconds > 0 ? seconds - 1 : 5 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFavorite = async (product: Product) => {
    try {
      const added = await toggleFavorite(product.id);
      Alert.alert(added ? 'Saved to wishlist' : 'Removed from wishlist', product.title);
    } catch (favoriteError) {
      Alert.alert('Wishlist unavailable', favoriteError instanceof Error ? favoriteError.message : 'Please try again.');
    }
  };

  const renderProduct = (product: Product, compact = false) => {
    const salePrice = product.price * (1 - product.discountPercentage / 100);
    return (
      <View key={product.id} style={[styles.productCard, compact && styles.carouselCard]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/(app)/product/${product.id}`)}
        >
          <Card style={styles.card} mode="contained">
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.thumbnail }} style={styles.productImage} resizeMode="contain" />
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
        >
          <MaterialCommunityIcons
            name={isFavorite(product.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite(product.id) ? orange : '#555'}
          />
        </TouchableOpacity>
      </View>
    );
  };

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={orange} />
        <Text style={styles.loadingText}>Finding today&apos;s deals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" buttonColor={orange} onPress={() => void fetchData()}>Try again</Button>
      </View>
    );
  }

  const flashDeals = products.filter((product) => product.discountPercentage >= 15).slice(0, 10);
  const minutes = Math.floor(countdown / 60).toString().padStart(2, '0');
  const seconds = (countdown % 60).toString().padStart(2, '0');

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void fetchData(true);
          }}
          colors={[orange]}
        />
      }
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>marketplace</Text>
          <Text style={styles.greeting}>Hi{user?.firstName ? `, ${user.firstName}` : ''}! What are you shopping for?</Text>
        </View>
        <View style={styles.topActions}>
          <IconButton icon="heart-outline" iconColor={orange} onPress={() => router.push('/(app)/wishlist')} accessibilityLabel="Open wishlist" />
          <View>
            <IconButton icon="cart-outline" iconColor={orange} onPress={() => router.push('/(app)/(tabs)/cart')} accessibilityLabel="Open cart" />
            {totalQuantity > 0 && (
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalQuantity}</Text></View>
            )}
          </View>
          <Avatar.Image
            size={38}
            source={{ uri: user?.image || 'https://dummyjson.com/icon/emilys/128' }}
            style={styles.avatar}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/(app)/(tabs)/search')}
        accessibilityRole="button"
        accessibilityLabel="Search products, brands, and more"
      >
        <MaterialCommunityIcons name="magnify" size={23} color={orange} />
        <Text style={styles.searchPlaceholder}>Search products, brands, and more</Text>
        <MaterialCommunityIcons name="camera-outline" size={21} color={orange} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.promoBanner} onPress={() => router.push('/(app)/(tabs)/search')}>
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
            <MaterialCommunityIcons name={item.icon} size={22} color={orange} />
            <Text style={styles.quickLinkText}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        {renderSectionHeading('Shop by category', () => router.push('/(app)/(tabs)/categories'))}
        <FlatList
          data={categories.slice(0, 12)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => router.push(`/(app)/(tabs)/search?category=${encodeURIComponent(item)}`)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: categoryColors[index % categoryColors.length] }]}>
                <MaterialCommunityIcons name={categoryIcons[index % categoryIcons.length]} size={24} color={orange} />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>{item.replace(/-/g, ' ')}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.flashSection}>
        {renderSectionHeading('Flash sale', () => router.push('/(app)/(tabs)/search'), 'Shop more')}
        <View style={styles.flashTimer}>
          <Text style={styles.flashCaption}>Deals end in</Text>
          <Text style={styles.timerDigits}>{minutes}:{seconds}</Text>
        </View>
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
        {Array.from({ length: Math.ceil(products.length / 2) }, (_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.productGridRow}>
            {products.slice(rowIndex * 2, rowIndex * 2 + 2).map((product) => renderProduct(product))}
          </View>
        ))}
        {products.length === 0 && <Text style={styles.emptyText}>No products available right now.</Text>}
      </View>
    </ScrollView>
  );
}

const categoryIcons = [
  'cellphone', 'laptop', 'face-woman', 'spray', 'cart', 'home-outline',
  'sofa-outline', 'silverware-fork-knife', 'car', 'headphones', 'watch', 'diamond-stone',
] as const;
const categoryColors = ['#FFF0E8', '#FFF7E0', '#FDEAF0', '#EAF6FF', '#EAF8F0', '#F3ECFF'];
