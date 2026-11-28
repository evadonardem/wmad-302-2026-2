/**
 * Order Detail - items, shipping, payment and totals for one order.
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button, IconButton, Snackbar, useTheme } from 'react-native-paper';
import { useOrders } from '@/hooks/useOrders';
import { useOrdersContext } from '@/context/OrdersContext';
import { ConfirmDialog, EmptyState, ErrorState, LoadingView } from '@/components/CommonComponents';
import { OrderStatusBadge, formatOrderDate, orderTitle } from '@/components/OrderComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { formatCurrency, getDiscountedPrice, roundMoney } from '@/utils/pricing';
import { canCancelOrder } from '@/utils/orders';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { orders, loading, error, retry } = useOrders();
  const { cancelOrder } = useOrdersContext();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Deep links open this screen without history
  const backFallback = router.canGoBack()
    ? undefined
    : () => <IconButton icon="home" onPress={() => router.replace('/(app)/(tabs)/home')} accessibilityLabel="Go to shop" />;

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <>
        <Stack.Screen options={{ title: 'Order Details', headerLeft: backFallback }} />
        {loading ? (
          <LoadingView message="Loading order..." />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : (
          <EmptyState
            icon="package-variant-closed"
            title="Order not found"
            message="We couldn't find that order."
            actionLabel="View all orders"
            onAction={() => router.replace('/(app)/orders')}
          />
        )}
      </>
    );
  }

  const savings = roundMoney(order.subtotal - order.discountedTotal);
  const cancellable = canCancelOrder(order);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: orderTitle(order), headerLeft: backFallback }} />
      <View style={styles.column}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.heading, { color: theme.colors.onSurface }]}>{orderTitle(order)}</Text>
            <OrderStatusBadge status={order.status} />
          </View>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{formatOrderDate(order)}</Text>
          {order.status === 'cancelled' && (
            <Text style={[styles.cancelledNote, { color: theme.colors.error }]}>
              This order was cancelled
              {order.cancelledAt ? ` on ${new Date(order.cancelledAt).toLocaleDateString()}` : ''}.
            </Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Items</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {order.items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <Image
                source={{ uri: item.thumbnail }}
                style={[styles.thumb, { backgroundColor: theme.colors.surfaceVariant }]}
                contentFit="contain"
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.quantity} × {formatCurrency(getDiscountedPrice(item.price, item.discountPercentage))}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: theme.colors.onSurface }]}>
                {formatCurrency(getDiscountedPrice(item.price, item.discountPercentage) * item.quantity)}
              </Text>
              <Button compact onPress={() => router.push(`/(app)/product/${item.productId}`)}>
                View
              </Button>
            </View>
          ))}
        </View>

        {order.shipping && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Shipping to</Text>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{order.shipping.fullName}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{order.shipping.line1}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {order.shipping.city} {order.shipping.postalCode}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{order.shipping.phone}</Text>
            </View>
          </>
        )}

        {order.paymentMethod && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Payment</Text>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ color: theme.colors.onSurface }}>
                {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card on delivery'}
              </Text>
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Summary</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal</Text>
            <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(order.subtotal)}</Text>
          </View>
          {savings > 0 && (
            <View style={styles.row}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Discount</Text>
              <Text style={{ color: theme.colors.tertiary }}>-{formatCurrency(savings)}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total</Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {formatCurrency(order.discountedTotal)}
            </Text>
          </View>
        </View>

        {cancellable && (
          <Button
            mode="outlined"
            icon="close-circle-outline"
            textColor={theme.colors.error}
            style={styles.cancelButton}
            onPress={() => setConfirmCancel(true)}
          >
            Cancel order
          </Button>
        )}
      </View>

      <ConfirmDialog
        visible={confirmCancel}
        title="Cancel order"
        message={`Are you sure you want to cancel ${orderTitle(order)}? This can't be undone.`}
        confirmLabel="Cancel order"
        destructive
        onDismiss={() => setConfirmCancel(false)}
        onConfirm={() => {
          cancelOrder(order.id);
          setConfirmCancel(false);
          setSnackbar('Order cancelled');
        }}
      />
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={2500}>
        {snackbar ?? ''}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  card: { borderRadius: 12, padding: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  heading: { fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  itemInfo: { flex: 1, marginHorizontal: spacing.md },
  itemTitle: { fontSize: 14, fontWeight: '600' },
  itemTotal: { fontSize: 14, fontWeight: '700' },
  cancelledNote: { marginTop: spacing.sm, fontWeight: '600' },
  cancelButton: { marginTop: spacing.xl, marginBottom: spacing.lg },
  totalLabel: { fontSize: 17, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '800' },
});