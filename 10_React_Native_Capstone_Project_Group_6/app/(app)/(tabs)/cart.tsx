/**
 * Cart Screen - Marketplace
 * Reads the cart from CartContext (useReducer + AsyncStorage persistence).
 * Quantity buttons, remove with "Undo", coupon code, order summary.
 * The Checkout button opens the checkout screen (app/(app)/checkout.tsx).
 */
import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, IconButton, Snackbar, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart, getDiscountedPrice } from '@/context/CartContext';
import { CartItem } from '@/types/product';
import { createStyles } from './cartStyles';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';

export default function CartScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
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
    coupon,
    couponDiscount,
    couponError,
    payableTotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<string | null>(null); // why a code was rejected

  // One snackbar for messages; `undoItem` is set when it was caused by a removal
  const [snack, setSnack] = useState<{ message: string; undoItem?: CartItem } | null>(null);

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.productId);
    setSnack({ message: `Removed "${item.title}"`, undoItem: item });
  };

  const handleApplyCoupon = () => {
    const error = applyCoupon(couponInput);
    setCouponMessage(error);
    if (!error) {
      setCouponInput('');
      setSnack({ message: 'Coupon applied' });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage(null);
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
          iconColor={colors.error}
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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cart-outline" size={80} color={colors.iconMuted} />
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
            {/* Coupon: an input before one is applied, a green tag after */}
            {coupon ? (
              <>
                <View style={styles.couponApplied}>
                  <MaterialCommunityIcons name="ticket-percent" size={18} color={colors.success} />
                  <Text style={styles.couponAppliedText} numberOfLines={1}>
                    {coupon.code} - {coupon.description}
                  </Text>
                  <IconButton icon="close" size={16} onPress={handleRemoveCoupon} accessibilityLabel="Remove coupon" />
                </View>
                {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}
              </>
            ) : (
              <>
                <View style={styles.couponRow}>
                  <TextInput
                    mode="outlined"
                    dense
                    label="Coupon code"
                    value={couponInput}
                    onChangeText={(text) => {
                      setCouponInput(text);
                      setCouponMessage(null);
                    }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    error={!!couponMessage}
                    onSubmitEditing={handleApplyCoupon}
                    style={styles.couponInput}
                  />
                  <Button textColor={colors.primaryText} mode="outlined" onPress={handleApplyCoupon} style={styles.couponButton}>
                    Apply
                  </Button>
                </View>
                {couponMessage ? (
                  <Text style={styles.couponError}>{couponMessage}</Text>
                ) : (
                  <Text style={styles.couponHint}>Try: WELCOME10, SAVE5 or BIGSPENDER</Text>
                )}
              </>
            )}

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
            {couponDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Coupon ({coupon?.code})</Text>
                <Text style={styles.discountValue}>-${couponDiscount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRowDivider} />
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>${payableTotal.toFixed(2)}</Text>
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