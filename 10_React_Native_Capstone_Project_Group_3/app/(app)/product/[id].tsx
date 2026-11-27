/**
 * Product Detail Screen - /product/[id]
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Snackbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, wishlistIds, toggleWishlist } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const numericId = Number(id);
  const isWishlisted = product ? wishlistIds.includes(product.id) : false;

  const loadProduct = useCallback(async () => {
    if (!numericId || Number.isNaN(numericId)) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getProductById(numericId);
      setProduct(data);
      setSelectedImageIndex(0);
      setQuantity(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        title: product.title,
        message: `Check out ${product.title} for $${product.price.toFixed(2)} on Marketplace!`,
      });
    } catch {
      // Ignore share cancellation
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    setSnackbarMessage(`Added ${quantity} × ${product.title} to cart`);
    setSnackbarVisible(true);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    const added = await toggleWishlist(product.id);
    setSnackbarMessage(added ? 'Saved to Wishlist' : 'Removed from Wishlist');
    setSnackbarVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.mutedText}>Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#EA4335" />
        <Text style={styles.errorText}>{error ?? 'Product not found'}</Text>
        <Button mode="contained" onPress={loadProduct} style={{ marginTop: 12 }}>
          Retry
        </Button>
      </View>
    );
  }

  const gallery = product.images.length > 0 ? product.images : [product.thumbnail];
  const discountedPrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <View style={styles.topBarActions}>
          <IconButton
            icon={isWishlisted ? 'heart' : 'heart-outline'}
            iconColor={isWishlisted ? '#EA4335' : '#5F6368'}
            onPress={handleToggleWishlist}
          />
          <IconButton icon="share-variant" onPress={handleShare} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: gallery[selectedImageIndex] }}
          style={styles.heroImage}
          resizeMode="contain"
        />

        {gallery.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
          >
            {gallery.map((imgUri, idx) => (
              <TouchableOpacity
                key={`${imgUri}-${idx}`}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbBox,
                  selectedImageIndex === idx && styles.thumbBoxActive,
                ]}
              >
                <Image source={{ uri: imgUri }} style={styles.thumbImage} resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.body}>
          <View style={styles.metaChips}>
            <Chip compact>{product.category}</Chip>
            {product.brand && <Chip compact>{product.brand}</Chip>}
            <Chip compact>⭐ {product.rating.toFixed(1)}</Chip>
          </View>

          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
            {product.discountPercentage > 0 && (
              <>
                <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                <Chip compact style={styles.discountChip}>
                  -{Math.round(product.discountPercentage)}%
                </Chip>
              </>
            )}
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <Card style={styles.specCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Specifications & Shipping</Text>
              <Text style={styles.specLine}>SKU: {product.sku}</Text>
              <Text style={styles.specLine}>Availability: {product.availabilityStatus} ({product.stock} left)</Text>
              <Text style={styles.specLine}>Warranty: {product.warrantyInformation}</Text>
              <Text style={styles.specLine}>Shipping: {product.shippingInformation}</Text>
              <Text style={styles.specLine}>Returns: {product.returnPolicy}</Text>
              <Text style={styles.specLine}>
                Dimensions: {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.qtyRow}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.qtyControls}>
              <IconButton
                icon="minus"
                disabled={quantity <= 1}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              />
              <Text style={styles.qtyText}>{quantity}</Text>
              <IconButton
                icon="plus"
                disabled={quantity >= product.stock}
                onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              />
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          <Text style={styles.sectionTitle}>Reviews ({product.reviews.length})</Text>
          {product.reviews.length === 0 ? (
            <Text style={styles.mutedText}>No reviews yet.</Text>
          ) : (
            product.reviews.map((rev, idx) => (
              <Card key={`${rev.reviewerEmail}-${idx}`} style={styles.reviewCard}>
                <Card.Content>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                    <Text style={styles.reviewRating}>⭐ {rev.rating}/5</Text>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          mode="contained"
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
          style={styles.addBtn}
          contentStyle={{ height: 48 }}
        >
          {product.stock > 0
            ? `Add to Cart · $${(discountedPrice * quantity).toFixed(2)}`
            : 'Out of Stock'}
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'View Cart',
          onPress: () => router.push('/(app)/(tabs)/cart'),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  mutedText: { color: '#5F6368', marginTop: 8 },
  errorText: { color: '#EA4335', fontSize: 16, textAlign: 'center', marginTop: 8 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  topBarTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#202124' },
  topBarActions: { flexDirection: 'row' },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 280, backgroundColor: '#FFFFFF' },
  thumbRow: { padding: 12, gap: 8, backgroundColor: '#FFFFFF' },
  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    padding: 4,
  },
  thumbBoxActive: { borderColor: '#1A73E8', borderWidth: 2 },
  thumbImage: { width: '100%', height: '100%' },
  body: { padding: 16 },
  metaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', color: '#202124', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  discountedPrice: { fontSize: 24, fontWeight: '700', color: '#1A73E8' },
  originalPrice: { fontSize: 16, color: '#9E9E9E', textDecorationLine: 'line-through' },
  discountChip: { backgroundColor: '#FCE8E6' },
  description: { fontSize: 15, color: '#3C4043', lineHeight: 22, marginBottom: 16 },
  specCard: { backgroundColor: '#FFFFFF', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#202124', marginBottom: 8 },
  specLine: { fontSize: 13, color: '#5F6368', marginBottom: 4 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyText: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  reviewCard: { backgroundColor: '#FFFFFF', marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewerName: { fontWeight: '600', color: '#202124' },
  reviewRating: { fontWeight: '600', color: '#1A73E8' },
  reviewComment: { color: '#3C4043', fontSize: 14 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  addBtn: { borderRadius: 8 },
});