/**
 * Wishlist - Marketplace
 * Products the person saved with the heart on the product page (one list per account).
 * Tap a product to open it, "Add to cart" to buy it, the heart to remove it (with Undo).
 */
import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, IconButton, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { WishlistItem } from '@/types/product';
import { getFinalPrice } from '@/utils/productFilters';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';

export default function WishlistScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { items, isHydrated, removeFromWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // One snackbar; `undoItem` is set when it was caused by removing a product
  const [snack, setSnack] = useState<{ message: string; undoItem?: WishlistItem } | null>(null);

  const handleRemove = (item: WishlistItem) => {
    removeFromWishlist(item.id);
    setSnack({ message: `Removed "${item.title}"`, undoItem: item });
  };

  const handleAddToCart = (item: WishlistItem) => {
    const result = addToCart(item, 1);
    if (result === 'added') setSnack({ message: `Added "${item.title}" to cart` });
    else if (result === 'max_reached') setSnack({ message: `Only ${item.stock} in stock - already in your cart` });
    else setSnack({ message: 'Sorry, this item is out of stock' });
  };

  const renderItem = ({ item }: { item: WishlistItem }) => {
    const finalPrice = getFinalPrice(item);
    const outOfStock = item.stock <= 0;
    return (
      <Card style={styles.card} elevation={0}>
        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push(`/(app)/product/${item.id}`)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title}`}
        >
          <View style={styles.imageWrap}>
            <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="contain" />
            <IconButton
              icon="heart"
              size={20}
              iconColor={colors.error}
              onPress={() => handleRemove(item)}
              accessibilityLabel="Remove from wishlist"
              style={styles.heart}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price} numberOfLines={1}>${finalPrice.toFixed(2)}</Text>
              {item.discountPercentage > 0 && <Text style={styles.oldPrice} numberOfLines={1}>${item.price.toFixed(2)}</Text>}
            </View>
            <Text style={outOfStock ? styles.outOfStock : styles.muted}>
              {outOfStock ? 'Out of stock' : `${item.stock} in stock`}
            </Text>
          </View>
        </TouchableOpacity>
        <Button
          mode="contained"
          icon="cart-plus"
          compact
          disabled={outOfStock}
          onPress={() => handleAddToCart(item)}
          style={styles.cartButton}
        >
          Add
        </Button>
      </Card>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Wishlist" />

      {!isHydrated ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="heart-outline" size={80} color={colors.iconMuted} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.muted}>Tap the heart on a product to save it here.</Text>
          <Button mode="contained" style={styles.browseButton} onPress={() => router.replace('/(app)/(tabs)/home')}>
            Browse products
          </Button>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.list}
        />
      )}

      <Snackbar
        visible={snack !== null}
        onDismiss={() => setSnack(null)}
        duration={4000}
        action={
          snack?.undoItem
            ? {
                label: 'Undo',
                onPress: () => {
                  if (snack.undoItem) toggleWishlist(snack.undoItem); // not saved any more -> adds it back
                },
              }
            : undefined
        }
      >
        {snack?.message ?? ''}
      </Snackbar>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  list: { padding: 16, paddingBottom: 48, width: '100%', maxWidth: 720, alignSelf: 'center' },
  gridRow: { justifyContent: 'space-between' },
  card: { width: '48.5%', marginBottom: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tile: { flex: 1, padding: 8 },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 130, borderRadius: 14, backgroundColor: colors.surfaceMuted },
  heart: { position: 'absolute', top: 0, right: 0, margin: 2, backgroundColor: colors.surface },
  info: { flex: 1, marginTop: 8, paddingHorizontal: 2 },
  title: { fontSize: 14, lineHeight: 18, minHeight: 36, fontWeight: '600', color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'center', columnGap: 6, marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: colors.primaryText },
  oldPrice: { flexShrink: 1, fontSize: 12, color: colors.textMuted, textDecorationLine: 'line-through' },
  muted: { fontSize: 13, color: colors.textMuted },
  outOfStock: { fontSize: 13, color: colors.errorText },
  cartButton: { marginHorizontal: 8, marginBottom: 8, borderRadius: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 },
  browseButton: { marginTop: 16, borderRadius: 8 },
});
