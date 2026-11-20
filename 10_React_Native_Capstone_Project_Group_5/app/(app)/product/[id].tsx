import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { availableCoupons } from '@/utils/coupons';
import { marketplaceColors } from '@/constants/theme';
import { showAlert } from '@/utils/platformAlert';

const brandPurple = '#75648A';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(14)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastOpacity.stopAnimation();
    toastTranslateY.stopAnimation();
  }, [toastOpacity, toastTranslateY]);

  const showCartConfirmation = (productTitle: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastOpacity.stopAnimation();
    toastTranslateY.stopAnimation();
    setAddedToast(productTitle);
    toastOpacity.setValue(0);
    toastTranslateY.setValue(14);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.spring(toastTranslateY, { toValue: 0, speed: 20, bounciness: 5, useNativeDriver: false }),
    ]).start();

    toastTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
        Animated.timing(toastTranslateY, { toValue: 10, duration: 180, useNativeDriver: false }),
      ]).start(({ finished }) => {
        if (finished) setAddedToast(null);
      });
    }, 2200);
  };

  const addToCart = async (buyNow: boolean) => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product, quantity);
      if (buyNow) {
        const checkoutRoute = `/(app)/checkout?selectedItemIds=${product.id}`;
        if (user?.id) {
          router.push({
            pathname: '/(app)/checkout',
            params: { selectedItemIds: String(product.id) },
          });
        } else {
          router.replace({
            pathname: '/(auth)/login',
            params: { redirect: checkoutRoute },
          });
        }
      } else {
        showCartConfirmation(product.title);
      }
    } catch (addError) {
      showAlert(
        'Could not add item',
        addError instanceof Error ? addError.message : 'Please try again.'
      );
    } finally {
      setAdding(false);
    }
  };

  const openCart = (productId: number) => {
    router.push({
      pathname: '/(app)/(tabs)/cart',
      params: { sourceProductId: String(productId) },
    });
  };

  const toggleProductFavorite = async () => {
    if (!product) return;
    try {
      const saved = await toggleFavorite(product.id);
      showAlert(saved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (favoriteError) {
      showAlert(
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
            <ActivityIndicator size="large" color={brandPurple} />
            <Text style={styles.muted}>Loading product...</Text>
          </>
        ) : (
          <>
            <Text style={styles.error}>{error ?? 'Product not found.'}</Text>
            <Button mode="contained" onPress={() => router.back()} buttonColor={brandPurple}>
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
          <Text style={styles.topTitle} numberOfLines={1}>Product details</Text>
          <View style={styles.topActions}>
            <IconButton
              icon="cart-outline"
              onPress={() => openCart(product.id)}
              accessibilityLabel="Open cart"
            />
            <IconButton
              icon={isFavorite(product.id) ? 'heart' : 'heart-outline'}
              iconColor={brandPurple}
              onPress={() => void toggleProductFavorite()}
              accessibilityLabel={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            />
          </View>
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
              <MaterialCommunityIcons name="storefront-outline" size={20} color={brandPurple} />
              <Text style={styles.infoText}>Sold by Kartora Marketplace seller · Demo</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="tag-outline" size={20} color={brandPurple} />
              <Text style={styles.infoText}>Brand: {product.brand || 'Unbranded'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="truck-fast-outline" size={20} color={brandPurple} />
              <View style={styles.infoDetails}>
                <Text style={styles.infoText}>Kartora Standard Delivery · Demo</Text>
                <Text style={styles.infoSubtext}>{product.shippingInformation}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={20} color={brandPurple} />
              <View style={styles.infoDetails}>
                <Text style={styles.infoText}>Express delivery · Demo</Text>
                <Text style={styles.infoSubtext}>Courier service is not connected.</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={brandPurple} />
              <Text style={styles.infoText}>{product.warrantyInformation}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.productCard} mode="contained">
          <Card.Content>
            <View style={styles.couponHeading}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={22} color={brandPurple} />
              <Text style={styles.sectionTitle}>Available vouchers</Text>
            </View>
            {availableCoupons.map((coupon) => (
              <View key={coupon.code} style={styles.couponRow}>
                <View style={styles.couponCodeBox}>
                  <Text style={styles.couponCode}>{coupon.code}</Text>
                </View>
                <Text style={styles.couponOffer}>
                  {coupon.type === 'percent'
                    ? `${coupon.value}% off cart total`
                    : `$${coupon.value.toFixed(2)} off cart total`}
                </Text>
              </View>
            ))}
            <Text style={styles.infoSubtext}>
              Apply one code in your cart or at checkout. Coupons cannot be combined. Demo offers only.
            </Text>
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
        <View style={styles.buySummaryRow}>
          <View>
            <Text style={styles.muted}>Your total</Text>
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
        </View>
        <View style={styles.buyActions}>
          <Button
            mode="outlined"
            textColor={brandPurple}
            style={styles.buyActionButton}
            contentStyle={styles.buyActionContent}
            onPress={() => void addToCart(false)}
            loading={adding}
            disabled={adding || product.stock < 1}
          >
            Add to cart
          </Button>
          <Button
            mode="contained"
            buttonColor={brandPurple}
            style={styles.buyActionButton}
            contentStyle={styles.buyActionContent}
            onPress={() => void addToCart(true)}
            loading={adding}
            disabled={adding || product.stock < 1}
          >
            Buy now
          </Button>
        </View>
      </View>
      {addedToast && (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.cartToast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <View style={styles.toastCheck}>
            <MaterialCommunityIcons name="check-bold" size={16} color="#FFF" />
          </View>
          <View style={styles.toastCopy}>
            <Text style={styles.toastTitle}>Added to your cart</Text>
            <Text style={styles.toastProduct} numberOfLines={1}>{addedToast}</Text>
          </View>
          <MaterialCommunityIcons name="cart-check" size={23} color="#25845A" />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.background },
  content: { paddingBottom: 160 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  topBar: { height: 56, flexDirection: 'row' as const, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: marketplaceColors.border },
  topActions: { flexDirection: 'row' as const, alignItems: 'center' },
  topTitle: { flex: 1, textAlign: 'center' as const, fontSize: 17, fontWeight: '700' as const, color: '#222' },
  gallery: { height: 300, margin: 12, marginBottom: 0, backgroundColor: '#FFF', borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroImage: { width: '100%' as const, height: '100%' as const },
  discount: { position: 'absolute' as const, top: 16, left: 16, backgroundColor: brandPurple, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  discountText: { color: '#FFF', fontWeight: '700' as const },
  thumbnails: { padding: 12, gap: 10, marginHorizontal: 12, backgroundColor: '#FFF', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  thumbnailFrame: { width: 58, height: 58, borderWidth: 1, borderColor: marketplaceColors.border, borderRadius: 10, padding: 3 },
  thumbnailSelected: { borderColor: brandPurple, borderWidth: 2 },
  thumbnail: { width: '100%' as const, height: '100%' as const },
  productCard: { margin: 12, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: marketplaceColors.border },
  category: { color: '#888', fontSize: 13, textTransform: 'capitalize' as const },
  title: { color: '#222', fontSize: 20, fontWeight: '700' as const, marginTop: 6 },
  ratingRow: { flexDirection: 'row' as const, alignItems: 'center', marginTop: 8 },
  rating: { color: '#333', fontWeight: '600' as const, marginLeft: 3 },
  muted: { color: '#777', fontSize: 13 },
  priceRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginTop: 14 },
  salePrice: { color: brandPurple, fontWeight: '800' as const, fontSize: 25 },
  oldPrice: { color: '#999', fontSize: 15, textDecorationLine: 'line-through' as const },
  description: { color: '#444', fontSize: 14, lineHeight: 21, marginTop: 12 },
  infoRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginTop: 12 },
  infoText: { color: '#444', flex: 1, fontSize: 13 },
  infoDetails: { flex: 1 },
  infoSubtext: { color: '#777', flex: 1, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionTitle: { color: '#222', fontSize: 17, fontWeight: '700' as const },
  couponHeading: { flexDirection: 'row' as const, alignItems: 'center', gap: 8, marginBottom: 8 },
  couponRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginVertical: 6 },
  couponCodeBox: { borderWidth: 1, borderColor: '#DCD4E5', borderStyle: 'dashed' as const, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F2EEF5' },
  couponCode: { color: '#59486F', fontSize: 12, fontWeight: '800' as const, letterSpacing: 0.5 },
  couponOffer: { color: '#444', fontSize: 13, fontWeight: '600' as const },
  review: { paddingTop: 12, marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  reviewName: { color: '#777', fontSize: 13 },
  buyBar: { position: 'absolute' as const, bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: marketplaceColors.border, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, gap: 8, shadowColor: '#30283A', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 10 },
  buySummaryRow: { flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between' },
  barPrice: { color: brandPurple, fontWeight: '800' as const, fontSize: 19, marginTop: 1 },
  quantity: { flexDirection: 'row' as const, alignItems: 'center', borderWidth: 1, borderColor: marketplaceColors.border, borderRadius: 10 },
  quantityText: { minWidth: 20, textAlign: 'center' as const, fontWeight: '700' as const },
  buyActions: { flexDirection: 'row' as const, gap: 10 },
  buyActionButton: { flex: 1, borderRadius: 12 },
  buyActionContent: { minHeight: 44 },
  cartToast: { position: 'absolute' as const, left: 14, right: 14, bottom: 136, flexDirection: 'row' as const, alignItems: 'center', gap: 11, padding: 13, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#DCEDE3', shadowColor: '#30283A', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  toastCheck: { width: 30, height: 30, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: '#25845A' },
  toastCopy: { flex: 1 },
  toastTitle: { color: '#30283A', fontSize: 13, fontWeight: '800' as const },
  toastProduct: { color: '#746C7A', fontSize: 12, marginTop: 2 },
  error: { color: '#B00020', textAlign: 'center' as const },
});
