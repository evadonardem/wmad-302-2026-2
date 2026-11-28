/**
 * Product Detail Screen
 * Image gallery, price + discount, rating, specs, reviews, share, add to cart.
 * Reachable by deep link: marketplace://product/{id}
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button, Divider, IconButton, Snackbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';
import { ErrorState, LoadingView, QuantityStepper } from '@/components/CommonComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { formatCategoryName, formatCurrency, getDiscountedPrice } from '@/utils/pricing';
import { getErrorMessage } from '@/utils/errors';

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <View style={styles.stars} accessibilityLabel={`Rated ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <MaterialCommunityIcons key={n} name={n <= rounded ? 'star' : 'star-outline'} size={16} color="#F9AB00" />
      ))}
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { addProduct, getQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const galleryWidth = Math.min(width, MAX_CONTENT_WIDTH);

  const load = useCallback(async () => {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProduct(await productApi.getProductById(productId));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load product'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Deep links open this screen without history, so offer a way back to the shop
  const backFallback = router.canGoBack()
    ? undefined
    : () => <IconButton icon="home" onPress={() => router.replace('/(app)/(tabs)/home')} accessibilityLabel="Go to shop" />;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setImageIndex(Math.round(event.nativeEvent.contentOffset.x / galleryWidth));
  };

  const handleShare = async () => {
    if (!product) return;
    const price = formatCurrency(getDiscountedPrice(product.price, product.discountPercentage));
    try {
      await Share.share({
        title: product.title,
        message: `Check out ${product.title} for ${price} on Marketplace! marketplace://product/${product.id}`,
      });
    } catch {
      setSnackbar('Could not open the share sheet');
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Product Details', headerLeft: backFallback }} />
        <LoadingView message="Loading product..." />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Product Details', headerLeft: backFallback }} />
        <ErrorState message={error ?? 'Product not found'} onRetry={load} />
      </>
    );
  }

  const discounted = getDiscountedPrice(product.price, product.discountPercentage);
  const inCart = getQuantity(product.id);
  const outOfStock = product.stock <= 0;
  const maxQuantity = Math.max(product.stock - inCart, 0);
  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  const handleAddToCart = () => {
    addProduct(product, quantity);
    setSnackbar(`${quantity} × ${product.title} added to cart`);
    setQuantity(1);
  };

  const specs: Array<[string, string]> = [
    ['Brand', product.brand ?? '—'],
    ['Category', formatCategoryName(product.category)],
    ['SKU', product.sku],
    ['Weight', `${product.weight} oz`],
    ['Dimensions', `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`],
    ['Warranty', product.warrantyInformation],
    ['Shipping', product.shippingInformation],
    ['Availability', product.availabilityStatus],
    ['Return policy', product.returnPolicy],
    ['Minimum order', String(product.minimumOrderQuantity)],
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Product Details',
          headerLeft: backFallback,
          headerRight: () => (
            <IconButton icon="share-variant" onPress={handleShare} accessibilityLabel="Share product" />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.column, { backgroundColor: theme.colors.surface }]}>
          {/* Image gallery */}
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width: galleryWidth, backgroundColor: theme.colors.surfaceVariant }]}>
                <Image source={{ uri: item }} style={styles.image} contentFit="contain" transition={200} />
              </View>
            )}
          />
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === imageIndex ? theme.colors.primary : theme.colors.outline },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Title + price */}
          <View style={styles.section}>
            <Text style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>
              {formatCategoryName(product.category)}
              {product.brand ? ` · ${product.brand}` : ''}
            </Text>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{product.title}</Text>
            <View style={styles.ratingRow}>
              <Stars rating={product.rating} />
              <Text style={[styles.ratingText, { color: theme.colors.onSurfaceVariant }]}>
                {product.rating.toFixed(1)} ({product.reviews.length} reviews)
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>{formatCurrency(discounted)}</Text>
              {product.discountPercentage > 0 && (
                <>
                  <Text style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}>
                    {formatCurrency(product.price)}
                  </Text>
                  <View style={[styles.discountTag, { backgroundColor: theme.colors.errorContainer }]}>
                    <Text style={[styles.discountText, { color: theme.colors.error }]}>
                      -{Math.round(product.discountPercentage)}%
                    </Text>
                  </View>
                </>
              )}
            </View>
            <Text style={{ color: outOfStock ? theme.colors.error : theme.colors.tertiary, fontWeight: '600' }}>
              {outOfStock ? 'Out of stock' : `In stock (${product.stock} available)`}
            </Text>
          </View>

          <Divider />

          <View style={styles.section}>
            <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Description</Text>
            <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>{product.description}</Text>
            {product.tags.length > 0 && (
              <View style={styles.tags}>
                {product.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Text style={[styles.tagText, { color: theme.colors.secondary }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Divider />

          <View style={styles.section}>
            <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Specifications</Text>
            {specs.map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <Text style={[styles.specLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
                <Text style={[styles.specValue, { color: theme.colors.onSurface }]}>{value}</Text>
              </View>
            ))}
          </View>

          <Divider />

          <View style={styles.section}>
            <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
              Reviews ({product.reviews.length})
            </Text>
            {product.reviews.length === 0 && (
              <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>No reviews yet.</Text>
            )}
            {product.reviews.map((review, index) => (
              <View key={`${review.reviewerEmail}-${index}`} style={[styles.review, { borderColor: theme.colors.outlineVariant }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewer, { color: theme.colors.onSurface }]}>{review.reviewerName}</Text>
                  <Stars rating={review.rating} />
                </View>
                <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>{review.comment}</Text>
                <Text style={[styles.reviewDate, { color: theme.colors.outline }]}>
                  {new Date(review.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky add-to-cart bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        {!outOfStock && maxQuantity > 0 && (
          <QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} />
        )}
        <Button
          mode="contained"
          icon="cart-plus"
          style={styles.addButton}
          disabled={outOfStock || maxQuantity <= 0}
          onPress={handleAddToCart}
        >
          {outOfStock ? 'Out of stock' : maxQuantity <= 0 ? 'Max quantity in cart' : 'Add to cart'}
        </Button>
      </View>

      <Snackbar
        visible={snackbar !== null}
        onDismiss={() => setSnackbar(null)}
        duration={2200}
        style={{ marginBottom: 80 }}
        action={{ label: 'View cart', onPress: () => router.push('/(app)/(tabs)/cart') }}
      >
        {snackbar ?? ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  slide: { height: 300, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.sm, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  section: { padding: spacing.lg },
  category: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '700', marginTop: spacing.xs },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  stars: { flexDirection: 'row' },
  ratingText: { marginLeft: spacing.sm, fontSize: 13 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md, flexWrap: 'wrap' },
  price: { fontSize: 28, fontWeight: '800' },
  originalPrice: { fontSize: 16, textDecorationLine: 'line-through', marginLeft: spacing.md },
  discountTag: { marginLeft: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  discountText: { fontSize: 13, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
  body: { fontSize: 14, lineHeight: 21 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, gap: spacing.sm },
  tag: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, fontWeight: '500' },
  specRow: { flexDirection: 'row', paddingVertical: spacing.sm },
  specLabel: { width: 120, fontSize: 14 },
  specValue: { flex: 1, fontSize: 14, fontWeight: '500' },
  review: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.md },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  reviewer: { fontSize: 14, fontWeight: '600' },
  reviewDate: { fontSize: 11, marginTop: spacing.xs },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addButton: { flex: 1 },
});
