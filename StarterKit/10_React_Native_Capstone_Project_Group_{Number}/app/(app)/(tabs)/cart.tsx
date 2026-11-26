/**
 * Cart Screen - items from CartContext (persisted to AsyncStorage).
 * Checkout happens on the separate /checkout screen.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Button, IconButton, Snackbar, Title } from 'react-native-paper';
import { useCart } from '@/context/CartContext';
import { EmptyState } from '@/components/CommonComponents';
import { getDiscountedPrice } from '@/utils/cart';
import type { CartItem } from '@/types/product';
import { styles } from './cartStyles';

interface Notice {
  message: string;
  undoItem?: CartItem;
}

export default function CartScreen() {
  const router = useRouter();
  const { items, totals, hydrated, setQuantity, removeFromCart, addItem } = useCart();
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleIncrease = useCallback(
    (item: CartItem) => {
      if (item.quantity >= item.stock) {
        setNotice({ message: `Only ${item.stock} in stock` });
        return;
      }
      setQuantity(item.productId, item.quantity + 1);
    },
    [setQuantity]
  );

  const handleRemove = useCallback(
    (item: CartItem) => {
      removeFromCart(item.productId);
      setNotice({ message: `Removed ${item.title}`, undoItem: item });
    },
    [removeFromCart]
  );

  const handleUndo = () => {
    if (notice?.undoItem) addItem(notice.undoItem);
    setNotice(null);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.thumbnail }} style={styles.itemImage} contentFit="contain" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemCurrentPrice}>
            ${getDiscountedPrice(item.price, item.discountPercentage).toFixed(2)}
          </Text>
          {item.discountPercentage > 0 && (
            <Text style={styles.itemOriginalPrice}>${item.price.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.quantityControls}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => setQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            accessibilityLabel="Decrease quantity"
          />
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleIncrease(item)}
            accessibilityLabel="Increase quantity"
          />
        </View>
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

  if (!hydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          message="Add some products to get started"
          actionLabel="Continue Shopping"
          onAction={() => router.push('/(app)/(tabs)/home')}
        />
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
                <Title style={styles.headerTitle}>Shopping Cart ({totals.totalQuantity} items)</Title>
              </View>
            }
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${totals.subtotal.toFixed(2)}</Text>
            </View>
            {totals.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.discountValue}>-${totals.discount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRowDivider} />
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>${totals.total.toFixed(2)}</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => router.push('/(app)/checkout')}
              style={styles.checkoutButton}
              contentStyle={styles.buttonContent}
            >
              <Text style={styles.buttonText}>Checkout</Text>
            </Button>
          </View>
        </>
      )}

      <Snackbar
        visible={notice !== null}
        onDismiss={() => setNotice(null)}
        duration={4000}
        action={notice?.undoItem ? { label: 'Undo', onPress: handleUndo } : undefined}
      >
        {notice?.message ?? ''}
      </Snackbar>
    </View>
  );
}
