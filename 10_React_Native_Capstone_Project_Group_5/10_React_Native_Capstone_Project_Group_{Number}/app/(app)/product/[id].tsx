import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

const orange = '#EE4D2D';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId < 1) {
      setError('This product could not be found.');
      setLoading(false);
      return;
    }

    productApi
      .getProductById(productId)
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error ? requestError.message : 'Unable to load this product.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const addToCart = async (goToCart: boolean) => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product, quantity);
      if (goToCart) {
        router.push('/(app)/(tabs)/cart');
      } else {
        Alert.alert('Added to cart', `${product.title} was added to your cart.`);
      }
    } catch (addError) {
      Alert.alert(
        'Could not add item',
        addError instanceof Error ? addError.message : 'Please try again.'
      );
    } finally {
      setAdding(false);
    }
  };

  const toggleProductFavorite = async () => {
    if (!product) return;
    try {
      const saved = await toggleFavorite(product.id);
      Alert.alert(saved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (favoriteError) {
      Alert.alert(
        'Wishlist unavailable',
        favoriteError instanceof Error ? favoriteError.message : 'Please try again.'
      );
    }
  };

  if (loading || error || !product) {
    return (
      <View style={styles.center}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color={orange} />
            <Text style={styles.muted}>Loading product...</Text>
          </>
        ) : (
          <>
            <Text style={styles.error}>{error ?? 'Product not found.'}</Text>
            <Button mode="contained" onPress={() => router.back()} buttonColor={orange}>
              Go back
            </Button>
          </>
        )}
      </View>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.thumbnail];
  const salePrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text style={styles.topTitle}>Product details</Text>
          <IconButton
            icon="cart-outline"
            onPress={() => router.push('/(app)/(tabs)/cart')}
            accessibilityLabel="Open cart"
          />
          <IconButton
            icon={isFavorite(product.id) ? 'heart' : 'heart-outline'}
            iconColor={orange}
            onPress={() => void toggleProductFavorite()}
            accessibilityLabel={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          />
        </View>

        <View style={styles.gallery}>
          <Image source={{ uri: images[imageIndex] }} style={styles.heroImage} resizeMode="contain" />
          {product.discountPercentage > 0 && (
            <View style={styles.discount}>
              <Text style={styles.discountText}>-{Math.round(product.discountPercentage)}%</Text>
            </View>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={`${image}-${index}`}
              onPress={() => setImageIndex(index)}
              style={[styles.thumbnailFrame, index === imageIndex && styles.thumbnailSelected]}
            >
              <Image source={{ uri: image }} style={styles.thumbnail} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Card style={styles.productCard} mode="contained">
          <Card.Content>
            <Text style={styles.category}>{product.category.split('-').join(' ')}</Text>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={18} color="#F6A700" />
              <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.muted}> · {product.reviews.length} reviews</Text>
              <Text style={styles.muted}> · {product.stock} in stock</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.salePrice}>${salePrice.toFixed(2)}</Text>
              {product.discountPercentage > 0 && (
                <Text style={styles.oldPrice}>${product.price.toFixed(2)}</Text>
              )}
            </View>
            <Text style={styles.description}>{product.description}</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="truck-fast-outline" size={20} color={orange} />
              <Text style={styles.infoText}>{product.shippingInformation}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={orange} />
              <Text style={styles.infoText}>{product.warrantyInformation}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.productCard} mode="contained">
          <Card.Content>
            <Text style={styles.sectionTitle}>Customer reviews</Text>
            {product.reviews.length === 0 ? (
              <Text style={styles.muted}>No reviews yet.</Text>
            ) : (
              product.reviews.slice(0, 3).map((review, index) => (
                <View key={`${review.reviewerName}-${index}`} style={styles.review}>
                  <View style={styles.ratingRow}>
                    <MaterialCommunityIcons name="star" size={16} color="#F6A700" />
                    <Text style={styles.rating}>{review.rating}</Text>
                    <Text style={styles.reviewName}> · {review.reviewerName}</Text>
                  </View>
                  <Text style={styles.description}>{review.comment}</Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.buyBar}>
        <View>
          <Text style={styles.muted}>Total</Text>
          <Text style={styles.barPrice}>${(salePrice * quantity).toFixed(2)}</Text>
        </View>
        <View style={styles.quantity}>
          <IconButton
            icon="minus"
            size={18}
            onPress={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            accessibilityLabel="Decrease quantity"
          />
          <Text style={styles.quantityText}>{quantity}</Text>
          <IconButton
            icon="plus"
            size={18}
            onPress={() => setQuantity((current) => Math.min(product.stock, current + 1))}
            disabled={quantity >= product.stock}
            accessibilityLabel="Increase quantity"
          />
        </View>
        <Button
          mode="contained"
          buttonColor={orange}
          onPress={() => void addToCart(false)}
          loading={adding}
          disabled={adding || product.stock < 1}
          compact
        >
          Add to cart
        </Button>
        <Button
          mode="contained"
          buttonColor="#C9361B"
          onPress={() => void addToCart(true)}
          loading={adding}
          disabled={adding || product.stock < 1}
          compact
        >
          Buy now
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  topBar: { height: 52, flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF' },
  topTitle: { fontSize: 17, fontWeight: '700' as const, color: '#222' },
  gallery: { height: 300, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%' as const, height: '100%' as const },
  discount: { position: 'absolute' as const, top: 16, left: 16, backgroundColor: orange, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  discountText: { color: '#FFF', fontWeight: '700' as const },
  thumbnails: { padding: 12, gap: 10, backgroundColor: '#FFF' },
  thumbnailFrame: { width: 58, height: 58, borderWidth: 1, borderColor: '#DDD', borderRadius: 6, padding: 3 },
  thumbnailSelected: { borderColor: orange, borderWidth: 2 },
  thumbnail: { width: '100%' as const, height: '100%' as const },
  productCard: { margin: 10, backgroundColor: '#FFF' },
  category: { color: '#888', fontSize: 13, textTransform: 'capitalize' as const },
  title: { color: '#222', fontSize: 20, fontWeight: '700' as const, marginTop: 6 },
  ratingRow: { flexDirection: 'row' as const, alignItems: 'center', marginTop: 8 },
  rating: { color: '#333', fontWeight: '600' as const, marginLeft: 3 },
  muted: { color: '#777', fontSize: 13 },
  priceRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginTop: 14 },
  salePrice: { color: orange, fontWeight: '800' as const, fontSize: 25 },
  oldPrice: { color: '#999', fontSize: 15, textDecorationLine: 'line-through' as const },
  description: { color: '#444', fontSize: 14, lineHeight: 21, marginTop: 12 },
  infoRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginTop: 12 },
  infoText: { color: '#444', flex: 1, fontSize: 13 },
  sectionTitle: { color: '#222', fontSize: 17, fontWeight: '700' as const },
  review: { paddingTop: 12, marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  reviewName: { color: '#777', fontSize: 13 },
  buyBar: { position: 'absolute' as const, bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', padding: 8, flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  barPrice: { color: orange, fontWeight: '800' as const, fontSize: 17 },
  quantity: { flexDirection: 'row' as const, alignItems: 'center', borderWidth: 1, borderColor: '#EEE', borderRadius: 6 },
  quantityText: { minWidth: 20, textAlign: 'center' as const, fontWeight: '700' as const },
  error: { color: '#B00020', textAlign: 'center' as const },
});
