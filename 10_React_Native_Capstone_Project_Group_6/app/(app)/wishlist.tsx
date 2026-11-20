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
      <Card style={styles.card} elevation={1}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push(`/(app)/product/${item.id}`)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title}`}
        >
          <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="contain" />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${finalPrice.toFixed(2)}</Text>
              {item.discountPercentage > 0 && <Text style={styles.oldPrice}>${item.price.toFixed(2)}</Text>}
            </View>
            <Text style={outOfStock ? styles.outOfStock : styles.muted}>
              {outOfStock ? 'Out of stock' : `${item.stock} in stock`}
            </Text>
          </View>
          <IconButton
            icon="heart"
            iconColor={colors.error}
            onPress={() => handleRemove(item)}
            accessibilityLabel="Remove from wishlist"
          />
        </TouchableOpacity>
        <Button
          mode="contained-tonal"
          icon="cart-plus"
          disabled={outOfStock}
          onPress={() => handleAddToCart(item)}
          style={styles.cartButton}
        >
          Add to cart
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
  card: { marginBottom: 12, borderRadius: 12, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: colors.surfaceMuted },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, fontWeight: '600', color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary },
  oldPrice: { fontSize: 12, color: colors.textMuted, textDecorationLine: 'line-through' },
  muted: { fontSize: 13, color: colors.textMuted },
  outOfStock: { fontSize: 13, color: colors.errorText },
  cartButton: { marginHorizontal: 12, marginBottom: 12, borderRadius: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 },
  browseButton: { marginTop: 16, borderRadius: 8 },
});
