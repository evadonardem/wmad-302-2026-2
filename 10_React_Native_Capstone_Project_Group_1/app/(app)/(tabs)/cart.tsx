/**
 * Cart Screen
 * Cart state lives in CartContext (useReducer) and is persisted to AsyncStorage.
 * Checkout happens on its own screen (/checkout).
 */
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button, IconButton, Snackbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types/product';
import { ConfirmDialog, EmptyState, LoadingView, QuantityStepper } from '@/components/CommonComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { formatCurrency, getDiscountedPrice } from '@/utils/pricing';

export default function CartScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { items, totals, isHydrated, updateQuantity, removeItem, clearCart } = useCart();

  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  if (!isHydrated) {
    return <LoadingView message="Loading cart..." />;
  }

  if (items.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Add some products to get started."
          actionLabel="Continue shopping"
          onAction={() => router.push('/(app)/(tabs)/home')}
        />
      </View>
    );
  }

  const handleQuantityChange = (item: CartItem, quantity: number) => {
    if (quantity > item.stock) {
      setSnackbar(`Only ${item.stock} available`);
      return;
    }
    updateQuantity(item.productId, quantity);
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const unitPrice = getDiscountedPrice(item.price, item.discountPercentage);
    return (
      <View style={[styles.item, { backgroundColor: theme.colors.surface }]}>
        <Image source={{ uri: item.thumbnail }} style={styles.itemImage} contentFit="contain" />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>{formatCurrency(unitPrice)}</Text>
            {item.discountPercentage > 0 && (
              <Text style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}>
                {formatCurrency(item.price)}
              </Text>
            )}
          </View>
          <View style={styles.itemFooter}>
            <QuantityStepper
              value={item.quantity}
              max={item.stock}
              onChange={(quantity) => handleQuantityChange(item, quantity)}
            />
            <Text style={[styles.lineTotal, { color: theme.colors.onSurface }]}>
              {formatCurrency(unitPrice * item.quantity)}
            </Text>
          </View>
        </View>
        <IconButton
          icon="delete-outline"
          iconColor={theme.colors.error}
          onPress={() => setItemToRemove(item)}
          accessibilityLabel={`Remove ${item.title}`}
        />
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.productId)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              Shopping Cart ({totals.totalQuantity} {totals.totalQuantity === 1 ? 'item' : 'items'})
            </Text>
            <Button compact textColor={theme.colors.error} onPress={() => setConfirmClear(true)}>
              Clear
            </Button>
          </View>
        }
      />

      <View
        style={[
          styles.summary,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        <View style={styles.summaryInner}>
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal</Text>
            <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(totals.subtotal)}</Text>
          </View>
          {totals.savings > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Discount</Text>
              <Text style={{ color: theme.colors.tertiary }}>-{formatCurrency(totals.savings)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total</Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {formatCurrency(totals.discountedTotal)}
            </Text>
          </View>
          <Button
            mode="contained"
            icon="credit-card-outline"
            style={styles.checkoutButton}
            contentStyle={styles.checkoutContent}
            onPress={() => router.push('/(app)/checkout')}
          >
            Checkout
          </Button>
        </View>
      </View>

      <ConfirmDialog
        visible={itemToRemove !== null}
        title="Remove item"
        message={`Remove "${itemToRemove?.title ?? ''}" from your cart?`}
        confirmLabel="Remove"
        destructive
        onDismiss={() => setItemToRemove(null)}
        onConfirm={() => {
          if (itemToRemove) removeItem(itemToRemove.productId);
          setItemToRemove(null);
        }}
      />
      <ConfirmDialog
        visible={confirmClear}
        title="Clear cart"
        message="Remove every item from your cart?"
        confirmLabel="Clear"
        destructive
        onDismiss={() => setConfirmClear(false)}
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
        }}
      />
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={2000}>
        {snackbar ?? ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { padding: spacing.md, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: spacing.md },
  itemImage: { width: 84, height: 84, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemTitle: { fontSize: 14, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700' },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through', marginLeft: spacing.sm },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  lineTotal: { fontSize: 15, fontWeight: '700' },
  summary: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.md, paddingHorizontal: spacing.lg },
  summaryInner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  totalLabel: { fontSize: 17, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '800' },
  checkoutButton: { marginTop: spacing.sm },
  checkoutContent: { paddingVertical: spacing.xs },
});
