/**
 * Product Detail - image gallery, price, rating, specs, reviews,
 * share and add-to-cart.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Chip, IconButton, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { getDiscountedPrice } from '@/utils/cart';
import type { Product } from '@/types/product';
import { styles } from '../productStyles';

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <MaterialCommunityIcons
          key={n}
          name={rating >= n ? 'star' : rating >= n - 0.5 ? 'star-half-full' : 'star-outline'}
          size={16}
          color="#F9AB00"
        />
      ))}
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { addToCart, getQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProduct(await productApi.getProductById(productId));
    } catch {
      setError('Could not load this product. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onGalleryScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setImageIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `${product.title} - $${getDiscountedPrice(product.price, product.discountPercentage).toFixed(2)}`,
      });
    } catch {
      setMessage('Sharing is not available on this device');
    }
  };

  const handleAdd = () => {
    if (!product) return;
    const inCart = getQuantity(product.id);
    if (inCart + quantity > product.stock) {
      setMessage(`Only ${product.stock} in stock (${inCart} already in your cart)`);
    } else {
      setMessage(`Added ${quantity} to cart`);
    }
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Product not found'}</Text>
        <Button mode="contained" onPress={load}>
          Retry
        </Button>
      </View>
    );
  }

  const discounted = getDiscountedPrice(product.price, product.discountPercentage);
  const inStock = product.stock > 0;
  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  const specs: [string, string][] = [
    ['Brand', product.brand ?? 'Generic'],
    ['SKU', product.sku],
    ['Weight', `${product.weight} g`],
    [
      'Dimensions',
      `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm`,
    ],
    ['Warranty', product.warrantyInformation],
    ['Shipping', product.shippingInformation],
    ['Return policy', product.returnPolicy],
    ['Minimum order', String(product.minimumOrderQuantity)],
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: product.title,
          headerRight: () => <IconButton icon="share-variant" onPress={handleShare} accessibilityLabel="Share" />,
        }}
      />
      <ScrollView>
        <View style={styles.gallery}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            onMomentumScrollEnd={onGalleryScroll}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.galleryImage, { width }]} contentFit="contain" />
            )}
          />
        </View>
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((uri, index) => (
              <View key={`${uri}-${index}`} style={[styles.dot, index === imageIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.category}>{product.category.replace('-', ' ')}</Text>
          <Text style={[styles.title, { marginRight: 0 }]}>{product.title}</Text>

          <View style={styles.ratingRow}>
            <Stars rating={product.rating} />
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviews.length} reviews)
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${discounted.toFixed(2)}</Text>
            {product.discountPercentage > 0 && (
              <>
                <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                <Chip compact style={styles.discountChip} textStyle={{ color: '#EA4335' }}>
                  -{Math.round(product.discountPercentage)}%
                </Chip>
              </>
            )}
          </View>
          <Text style={[styles.stock, { color: inStock ? '#34A853' : '#EA4335' }]}>
            {inStock ? `${product.availabilityStatus} (${product.stock} left)` : 'Out of stock'}
          </Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specBox}>
            {specs.map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Reviews</Text>
          {product.reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet.</Text>
          ) : (
            product.reviews.map((review, index) => (
              <View key={`${review.reviewerEmail}-${index}`} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewer}>{review.reviewerName}</Text>
                  <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
                </View>
                <Stars rating={review.rating} />
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.qtyBox}>
          <IconButton
            icon="minus"
            size={18}
            disabled={quantity <= 1}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            accessibilityLabel="Decrease quantity"
          />
          <Text style={styles.qtyText}>{quantity}</Text>
          <IconButton
            icon="plus"
            size={18}
            disabled={quantity >= product.stock}
            onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            accessibilityLabel="Increase quantity"
          />
        </View>
        <Button
          mode="contained"
          icon="cart-plus"
          disabled={!inStock}
          onPress={handleAdd}
          style={styles.addButton}
          contentStyle={styles.addContent}
        >
          {inStock ? 'Add to cart' : 'Out of stock'}
        </Button>
      </View>

      <Snackbar
        visible={message !== null}
        onDismiss={() => setMessage(null)}
        duration={3000}
        action={{ label: 'View cart', onPress: () => router.push('/(app)/(tabs)/cart') }}
      >
        {message ?? ''}
      </Snackbar>
    </View>
  );
}
