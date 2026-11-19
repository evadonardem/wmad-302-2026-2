/**
 * Cart Screen - Marketplace
 * Reads the cart from CartContext (useReducer + AsyncStorage persistence).
 * Quantity buttons, remove with "Undo", order summary.
 * The Checkout button opens the checkout screen (app/(app)/checkout.tsx).
 */
import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, IconButton, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart, getDiscountedPrice } from '@/context/CartContext';
import { CartItem } from '@/types/product';
import { styles } from './cartStyles';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    isHydrated,
    total,
    discountedTotal,
    totalQuantity,
    updateQuantity,
    removeFromCart,
    restoreItem,
  } = useCart();

  // One snackbar for messages; `undoItem` is set when it was caused by a removal
  const [snack, setSnack] = useState<{ message: string; undoItem?: CartItem } | null>(null);

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.productId);
    setSnack({ message: `Removed "${item.title}"`, undoItem: item });
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/(app)/checkout'); // shipping form -> POST /carts/add -> confirmation
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = getDiscountedPrice(item);
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.thumbnail }} style={styles.itemImage} resizeMode="contain" />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.itemPriceRow}>
            <Text style={styles.itemCurrentPrice}>${discountedPrice.toFixed(2)}</Text>
            {item.discountPercentage > 0 && (
              <Text style={styles.itemOriginalPrice}>${item.price.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.quantityControls}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              accessibilityLabel="Decrease quantity"
            />
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              accessibilityLabel="Increase quantity"
            />
          </View>
          {item.quantity >= item.stock && (
            <Text style={styles.itemOriginalPrice}>Max stock reached ({item.stock})</Text>
          )}
        </View>
        <IconButton
          icon="delete-outline"
          size={24}
          iconColor="#EA4335"
          onPress={() => handleRemove(item)}
          accessibilityLabel="Remove item"
        />
      </View>
    );
  };

  // Wait until the saved cart has been read, otherwise the empty state flashes
  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cart-outline" size={80} color="#DADCE0" />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyText}>Add some products to get started</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/home')}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>Continue Shopping</Text>
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.productId.toString()}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              <View style={styles.header}>
                <Title style={styles.headerTitle}>Shopping Cart ({totalQuantity} items)</Title>
              </View>
            }
          />

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            {total !== discountedTotal && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.discountValue}>-${(total - discountedTotal).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRowDivider} />
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>${discountedTotal.toFixed(2)}</Text>
            </View>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.checkoutButton}
              contentStyle={styles.buttonContent}
            >
              <Text style={styles.buttonText}>Checkout</Text>
            </Button>
          </View>
        </>
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
                if (snack.undoItem) restoreItem(snack.undoItem);
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