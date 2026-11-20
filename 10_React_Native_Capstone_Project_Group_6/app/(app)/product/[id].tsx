/**
 * Product Detail Screen - Marketplace
 * Route: /(app)/product/{id}  (opened from Home and Search)
 * - Image gallery (swipe or tap a thumbnail)
 * - Price, discount, rating, stock, description, tags
 * - Specifications table
 * - Customer reviews
 * - Wishlist heart + Share
 * - Quantity picker + Add to cart
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, IconButton, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types/product';
import { formatCategory, getFinalPrice } from '@/utils/productFilters';

const MAX_CONTENT_WIDTH = 720; // keeps the page readable on a wide browser window

/** Five stars filled according to a rating like 4.3 */
function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const name = rating >= n ? 'star' : rating >= n - 0.5 ? 'star-half-full' : 'star-outline';
        return <MaterialCommunityIcons key={n} name={name} size={size} color="#F9AB00" />;
      })}
    </View>
  );
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { width } = useWindowDimensions();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const galleryRef = useRef<FlatList<string>>(null);

  const galleryWidth = Math.min(width, MAX_CONTENT_WIDTH);

  const loadProduct = useCallback(async () => {
    const productId = Number(id);
    if (!Number.isInteger(productId)) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProduct(await productApi.getProductById(productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // How many more of this product can still be added (stock minus what is in the cart)
  const inCart = items.find((i) => i.productId === product?.id)?.quantity ?? 0;
  const remaining = product ? Math.max(product.stock - inCart, 0) : 0;

  // Keep the quantity picker inside 1..remaining
  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(q, 1), Math.max(remaining, 1)));
  }, [remaining]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.title} for $${getFinalPrice(product).toFixed(2)} on Marketplace!`,
      });
    } catch {
      setToast('Sharing is not available here');
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const added = toggleWishlist(product);
    setToast(added ? 'Added to your wishlist' : 'Removed from your wishlist');
  };

  const handleAddToCart = () => {
    if (!product) return;
    const result = addToCart(product, quantity);
    if (result === 'added') {
      setToast(`Added ${quantity} x "${product.title}" to cart`);
      setQuantity(1);
    } else if (result === 'max_reached') {
      setToast(`Only ${product.stock} in stock - already in your cart`);
    } else {
      setToast('Sorry, this item is out of stock');
    }
  };

  const onGalleryScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveImage(Math.round(e.nativeEvent.contentOffset.x / galleryWidth));
  };

  const showImage = (index: number) => {
    setActiveImage(index);
    galleryRef.current?.scrollToIndex({ index, animated: true });
  };

  // Top bar is shown in every state so the person can always go back
  const topBar = (
    <View style={styles.topBar}>
      <IconButton icon="arrow-left" onPress={goBack} accessibilityLabel="Go back" />
      <Text style={styles.topBarTitle} numberOfLines={1}>
        {product?.title ?? 'Product'}
      </Text>
      <IconButton
        icon={product && isInWishlist(product.id) ? 'heart' : 'heart-outline'}
        iconColor={product && isInWishlist(product.id) ? '#EA4335' : undefined}
        onPress={handleToggleWishlist}
        disabled={!product}
        accessibilityLabel={product && isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
      />
      <IconButton
        icon="share-variant"
        onPress={handleShare}
        disabled={!product}
        accessibilityLabel="Share product"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        {topBar}
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1A73E8" />
          <Text style={styles.mutedText}>Loading product...</Text>
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.screen}>
        {topBar}
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#DADCE0" />
          <Text style={styles.errorText}>{error ?? 'Product not found'}</Text>
          <Button mode="contained" onPress={loadProduct}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.thumbnail];
  const finalPrice = getFinalPrice(product);
  const outOfStock = product.stock <= 0;

  const specs: [string, string][] = [
    ['Brand', product.brand ?? '-'],
    ['Category', formatCategory(product.category)],
    ['SKU', product.sku],
    ['Availability', product.availabilityStatus],
    ['Stock', `${product.stock} units`],
    ['Weight', `${product.weight}`],
    ['Dimensions', `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth}`],
    ['Warranty', product.warrantyInformation],
    ['Shipping', product.shippingInformation],
    ['Return policy', product.returnPolicy],
    ['Minimum order', `${product.minimumOrderQuantity}`],
  ];

  const addLabel = outOfStock ? 'Out of stock' : remaining <= 0 ? 'Max in cart' : 'Add to cart';

  return (
    <View style={styles.screen}>
      {topBar}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Image gallery */}
          <View style={[styles.gallery, { width: galleryWidth }]}>
            <FlatList
              ref={galleryRef}
              data={images}
              keyExtractor={(uri, index) => `${uri}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onGalleryScrollEnd}
              getItemLayout={(_, index) => ({ length: galleryWidth, offset: galleryWidth * index, index })}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: galleryWidth, height: galleryWidth * 0.85 }}
                  resizeMode="contain"
                />
              )}
            />
            {product.discountPercentage > 0 && (
              <View style={styles.discountTag}>
                <Text style={styles.discountTagText}>{`-${Math.round(product.discountPercentage)}%`}</Text>
              </View>
            )}
          </View>

          {images.length > 1 && (
            <>
              <View style={styles.dots}>
                {images.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={[styles.dot, index === activeImage && styles.dotActive]} />
                ))}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
                {images.map((uri, index) => (
                  <TouchableOpacity
                    key={`${uri}-${index}`}
                    onPress={() => showImage(index)}
                    style={[styles.thumb, index === activeImage && styles.thumbActive]}
                    accessibilityLabel={`Show image ${index + 1}`}
                  >
                    <Image source={{ uri }} style={styles.thumbImage} resizeMode="contain" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Main info */}
          <View style={styles.section}>
            <Text style={styles.category}>{formatCategory(product.category)}</Text>
            <Text style={styles.title}>{product.title}</Text>
            {product.brand ? <Text style={styles.mutedText}>by {product.brand}</Text> : null}

            <View style={styles.ratingRow}>
              <Stars rating={product.rating} />
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.reviews.length} reviews)
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>${finalPrice.toFixed(2)}</Text>
              {product.discountPercentage > 0 && (
                <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
              )}
            </View>

            <Text style={[styles.stock, outOfStock ? styles.stockOut : styles.stockIn]}>
              {outOfStock ? 'Out of stock' : `In stock - ${product.stock} available`}
            </Text>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            {product.tags.length > 0 && (
              <View style={styles.tagRow}>
                {product.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {specs.map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer reviews ({product.reviews.length})</Text>
            {product.reviews.length === 0 ? (
              <Text style={styles.mutedText}>No reviews yet.</Text>
            ) : (
              product.reviews.map((review, index) => (
                <View key={`${review.reviewerEmail}-${index}`} style={styles.review}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewer}>{review.reviewerName}</Text>
                    <Text style={styles.mutedText}>{new Date(review.date).toLocaleDateString()}</Text>
                  </View>
                  <Stars rating={review.rating} size={14} />
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar: quantity + add to cart */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInner}>
          <View style={styles.quantity}>
            <IconButton
              icon="minus"
              size={20}
              disabled={quantity <= 1 || remaining <= 0}
              onPress={() => setQuantity((q) => Math.max(q - 1, 1))}
              accessibilityLabel="Decrease quantity"
            />
            <Text style={styles.quantityText}>{quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              disabled={quantity >= remaining}
              onPress={() => setQuantity((q) => Math.min(q + 1, remaining))}
              accessibilityLabel="Increase quantity"
            />
          </View>
          <Button
            mode="contained"
            icon="cart-plus"
            style={styles.addButton}
            disabled={remaining <= 0}
            onPress={handleAddToCart}
          >
            {addLabel}
          </Button>
        </View>
      </View>

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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#202124' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  mutedText: { fontSize: 13, color: '#5F6368' },
  errorText: { fontSize: 16, color: '#EA4335', textAlign: 'center' },
  scrollContent: { paddingBottom: 24 },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  gallery: { backgroundColor: '#FFFFFF', alignSelf: 'center' },
  discountTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EA4335',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountTagText: { color: '#FFFFFF', fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8, backgroundColor: '#FFFFFF' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DADCE0' },
  dotActive: { backgroundColor: '#1A73E8' },
  thumbRow: { paddingHorizontal: 12, paddingBottom: 12, gap: 8, backgroundColor: '#FFFFFF' },
  thumb: { width: 64, height: 64, borderRadius: 8, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#F1F3F4' },
  thumbActive: { borderColor: '#1A73E8' },
  thumbImage: { width: '100%', height: '100%' },
  section: { backgroundColor: '#FFFFFF', marginTop: 10, padding: 16 },
  category: { fontSize: 12, color: '#1A73E8', fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '700', color: '#202124', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ratingText: { fontSize: 13, color: '#5F6368' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  price: { fontSize: 28, fontWeight: '700', color: '#1A73E8' },
  originalPrice: { fontSize: 16, color: '#9AA0A6', textDecorationLine: 'line-through' },
  stock: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  stockIn: { color: '#188038' },
  stockOut: { color: '#EA4335' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#202124', marginTop: 16, marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 21, color: '#3C4043' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { backgroundColor: '#E8F0FE', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: '#1A73E8' },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    gap: 16,
  },
  specLabel: { fontSize: 14, color: '#5F6368' },
  specValue: { fontSize: 14, color: '#202124', fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  review: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewer: { fontSize: 14, fontWeight: '600', color: '#202124' },
  reviewComment: { fontSize: 14, color: '#3C4043', marginTop: 4 },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  quantity: { flexDirection: 'row', alignItems: 'center' },
  quantityText: { minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  addButton: { flex: 1 },
});