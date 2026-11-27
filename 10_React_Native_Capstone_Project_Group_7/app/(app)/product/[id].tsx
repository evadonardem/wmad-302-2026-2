import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Dialog, IconButton, Portal, TextInput, useTheme } from 'react-native-paper';
import { Product } from '@/types/product';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { favoritesStorage, LocalProductReview, reviewsStorage } from '@/utils/storage';
import { useAuth } from '@/context/AuthContext';
import { useAppPreferences } from '@/context/AppPreferencesContext';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const { language, t } = useAppPreferences();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [localReviews, setLocalReviews] = useState<LocalProductReview[]>([]);
  const [reviewDialogVisible, setReviewDialogVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    let active = true;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setError('Invalid product.');
      setLoading(false);
      return;
    }

    productApi.getProductById(productId)
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load this product.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) return;
    favoritesStorage.getIds()
      .then((ids) => setIsFavorite(ids.includes(productId)))
      .catch((favoriteError: unknown) => console.error('Could not load wishlist state:', favoriteError));
  }, [id]);

  useEffect(() => {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) return;
    let active = true;
    reviewsStorage.getForProduct(productId)
      .then((reviews) => {
        if (active) setLocalReviews(reviews);
      })
      .catch((reviewError: unknown) => {
        if (active) {
          console.error('Could not load local product reviews:', reviewError);
          Alert.alert('Could not load reviews', 'Reviews saved on this device could not be loaded.');
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#66BB6A" />;
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.background }}>
        <Text style={{ color: '#EA4335', marginBottom: 16 }}>{error ?? 'Product not found.'}</Text>
        <Button onPress={() => router.back()}>Go back</Button>
      </View>
    );
  }

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const handleAddToCart = () => {
    if (product.stock < 1) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }
    if (cartLoading) return;
    if (addToCart(product)) {
      Alert.alert('Added to cart', `${product.title} was added to your cart.`);
    } else {
      Alert.alert('Stock limit reached', 'Your cart already contains the maximum available quantity.');
    }
  };
  const handleToggleFavorite = async () => {
    try {
      const favorite = await favoritesStorage.toggleId(product.id);
      setIsFavorite(favorite);
    } catch (favoriteError) {
      console.error('Could not update wishlist:', favoriteError);
      Alert.alert('Wishlist update failed', 'Please try again.');
    }
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${product.title} - $${discountedPrice.toFixed(2)}\n${product.description}`,
      });
    } catch (shareError) {
      console.error('Could not share product:', shareError);
      Alert.alert('Share failed', 'This product could not be shared right now.');
    }
  };
  const handleSubmitReview = async () => {
    const comment = reviewComment.trim();
    if (!comment) {
      Alert.alert(t('reviewTitle'), t('reviewRequired'));
      return;
    }
    const review: LocalProductReview = {
      rating: reviewRating,
      comment,
      date: new Date().toISOString(),
      reviewerName: user?.firstName ?? 'Guest',
      reviewerEmail: user?.email ?? '',
    };
    try {
      await reviewsStorage.addForProduct(product.id, review);
      setLocalReviews((current) => [review, ...current]);
      setReviewComment('');
      setReviewRating(5);
      setReviewDialogVisible(false);
      Alert.alert(t('reviewTitle'), t('reviewSaved'));
    } catch (reviewError) {
      console.error('Could not save product review:', reviewError);
      Alert.alert('Could not save review', 'Please try again.');
    }
  };
  const reviews = [...localReviews, ...product.reviews];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.onSurface }}>{t('Product details')}</Text>
        <View style={{ flex: 1 }} />
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          iconColor={isFavorite ? '#EA4335' : undefined}
          onPress={handleToggleFavorite}
          accessibilityLabel={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        />
        <IconButton icon="share-variant" onPress={handleShare} accessibilityLabel="Share product" />
      </View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {(product.images.length ? product.images : [product.thumbnail]).map((image, index) => (
          <Image
            key={`${image}-${index}`}
            source={{ uri: image }}
            resizeMode="contain"
            style={{ width: 360, height: 300, backgroundColor: colors.surface }}
          />
        ))}
      </ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ color: '#66BB6A', textTransform: 'capitalize', marginBottom: 6 }}>
          {product.category}{product.brand ? ` · ${product.brand}` : ''}
        </Text>
        <Text style={{ color: colors.onSurface, fontSize: 24, fontWeight: '700' }}>{product.title}</Text>
        <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>⭐ {product.rating.toFixed(1)} · {product.availabilityStatus}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 }}>
          <Text style={{ color: '#66BB6A', fontWeight: '700', fontSize: 24 }}>${discountedPrice.toFixed(2)}</Text>
          {product.discountPercentage > 0 && (
            <Text style={{ color: '#9E9E9E', textDecorationLine: 'line-through' }}>${product.price.toFixed(2)}</Text>
          )}
        </View>
        <Text style={{ color: colors.onSurface, lineHeight: 22, marginTop: 16 }}>{product.description}</Text>
        <Button
          mode="contained"
          onPress={handleAddToCart}
          disabled={cartLoading || product.stock < 1}
          style={{ marginTop: 20 }}
          icon="cart-plus"
        >
          {product.stock > 0 ? t('Add to cart') : t('Out of stock')}
        </Button>

        <Card style={{ marginTop: 20 }}>
          <Card.Title title="Product information" />
          <Card.Content>
            <Text style={{ color: colors.onSurface }}>SKU: {product.sku}</Text>
            <Text style={{ marginTop: 6, color: colors.onSurface }}>Stock: {product.stock}</Text>
            <Text style={{ marginTop: 6, color: colors.onSurface }}>Shipping: {product.shippingInformation}</Text>
            <Text style={{ marginTop: 6, color: colors.onSurface }}>Warranty: {product.warrantyInformation}</Text>
            <Text style={{ marginTop: 6, color: colors.onSurface }}>Return policy: {product.returnPolicy}</Text>
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.onSurface }}>{t('Customer reviews')}</Text>
          <Button mode="outlined" compact onPress={() => setReviewDialogVisible(true)}>{t('reviewTitle')}</Button>
        </View>
        <Text style={{ color: colors.onSurfaceVariant, marginBottom: 10 }}>{t('localReviews')}</Text>
        {reviews.length ? reviews.map((review, index) => (
          <Card key={`${review.reviewerEmail}-${index}`} style={{ marginBottom: 10 }}>
            <Card.Content>
              <Text style={{ fontWeight: '700', color: colors.onSurface }}>{review.reviewerName} · ⭐ {review.rating}</Text>
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 6 }}>{review.comment}</Text>
              <Text style={{ color: '#9E9E9E', marginTop: 4 }}>{new Date(review.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</Text>
            </Card.Content>
          </Card>
        )) : <Text style={{ color: colors.onSurfaceVariant }}>{t('No reviews yet.')}</Text>}
      </View>
      <Portal>
        <Dialog visible={reviewDialogVisible} onDismiss={() => setReviewDialogVisible(false)}>
          <Dialog.Title>{t('reviewTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 8, color: colors.onSurface }}>{t('reviewRating')}: {reviewRating}/5</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <IconButton
                  key={rating}
                  icon={rating <= reviewRating ? 'star' : 'star-outline'}
                  iconColor="#F29900"
                  onPress={() => setReviewRating(rating)}
                  accessibilityLabel={`${rating} stars`}
                />
              ))}
            </View>
            <TextInput
              label={t('reviewComment')}
              value={reviewComment}
              onChangeText={setReviewComment}
              mode="outlined"
              multiline
              maxLength={500}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReviewDialogVisible(false)}>{t('Cancel')}</Button>
            <Button onPress={handleSubmitReview}>{t('submitReview')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
