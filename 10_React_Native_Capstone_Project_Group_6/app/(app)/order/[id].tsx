/**
 * Order Detail - Marketplace
 * Route: /(app)/order/{id}
 *  - "ORD-..." orders are read from the device (placed in this app)
 *  - "CART-12" orders are loaded from DummyJSON: GET /carts/12
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { productApi } from '@/services/productApi';
import { Order } from '@/types/product';
import { orderStorage } from '@/utils/storage';
import { PAYMENT_METHODS, apiCartToOrder, formatOrderDate, getOrderNumber } from '@/utils/orders';
import { formatTrackingTime, getTracking } from '@/utils/tracking';
import { OrderTimeline } from '@/components/OrderTimeline';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';

export default function OrderDetailScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date()); // ticks so tracking moves forward while the screen is open

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (id?.startsWith('CART-')) {
        const cartId = Number(id.replace('CART-', ''));
        setOrder(apiCartToOrder(await productApi.getCartById(cartId)));
      } else {
        const found = (await orderStorage.getOrders()).find((o) => o.id === id);
        if (!found) throw new Error('Order not found');
        setOrder(found);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Order details" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Order details" />
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.iconMuted} />
          <Text style={styles.error}>{error ?? 'Order not found'}</Text>
          <Button mode="contained" onPress={loadOrder}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  const tracking = getTracking(order, now);
  const paymentLabel = PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label;
  // order.discountedTotal is what was paid, so it already has the coupon taken off
  const couponDiscount = order.couponDiscount ?? 0;
  const productDiscount = order.total - order.discountedTotal - couponDiscount;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`Order ${getOrderNumber(order)}`} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Status + tracking */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={[styles.status, tracking.isDelivered ? styles.statusDone : styles.statusActive]}>
                <Text style={styles.statusText}>{tracking.status}</Text>
              </View>
            </View>
            <Text style={styles.muted}>Placed: {formatOrderDate(order.placedAt)}</Text>
            {tracking.estimatedDelivery && (
              <Text style={styles.muted}>Estimated delivery: {formatTrackingTime(tracking.estimatedDelivery)}</Text>
            )}
            <View style={styles.timeline}>
              <OrderTimeline steps={tracking.steps} />
            </View>
          </View>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.totalQuantity})</Text>
            {order.items.map((line) => {
              const unit = line.price * (1 - line.discountPercentage / 100);
              return (
                <View key={line.productId} style={styles.item}>
                  <Image source={{ uri: line.thumbnail }} style={styles.itemImage} resizeMode="contain" />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {line.title}
                    </Text>
                    <Text style={styles.muted}>
                      {line.quantity} x ${unit.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>${(unit * line.quantity).toFixed(2)}</Text>
                </View>
              );
            })}
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.row}>
              <Text style={styles.muted}>Subtotal</Text>
              <Text style={styles.muted}>${order.total.toFixed(2)}</Text>
            </View>
            {productDiscount > 0.005 && (
              <View style={styles.row}>
                <Text style={styles.muted}>Discount</Text>
                <Text style={styles.discount}>-${productDiscount.toFixed(2)}</Text>
              </View>
            )}
            {couponDiscount > 0 && (
              <View style={styles.row}>
                <Text style={styles.muted}>Coupon ({order.couponCode})</Text>
                <Text style={styles.discount}>-${couponDiscount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.grandTotal}>Total</Text>
              <Text style={styles.grandTotal}>${order.discountedTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Delivery + payment (only orders placed in the app have these) */}
          {order.shipping && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery</Text>
              <Text style={styles.bodyText}>{order.shipping.fullName}</Text>
              <Text style={styles.bodyText}>{order.shipping.phone}</Text>
              <Text style={styles.bodyText}>
                {order.shipping.address}, {order.shipping.city} {order.shipping.postalCode}
              </Text>
              {paymentLabel && <Text style={[styles.muted, styles.paymentLine]}>Payment: {paymentLabel}</Text>}
            </View>
          )}

          <Button mode="outlined" style={styles.backButton} onPress={() => router.replace('/(app)/orders')}>
            All orders
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  error: { fontSize: 16, color: colors.error, textAlign: 'center' },
  scrollContent: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  section: { backgroundColor: colors.surface, marginTop: 10, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  muted: { fontSize: 13, color: colors.textMuted },
  bodyText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  paymentLine: { marginTop: 6 },
  timeline: { marginTop: 14 },
  status: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  statusActive: { backgroundColor: colors.warningContainer },
  statusDone: { backgroundColor: colors.successContainer },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.textBody },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  itemImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.surfaceMuted },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemTotal: { fontSize: 14, fontWeight: '600', color: colors.text },
  discount: { fontSize: 13, color: colors.success },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, marginTop: 8, paddingTop: 10 },
  grandTotal: { fontSize: 18, fontWeight: '700', color: colors.primaryText },
  backButton: { margin: 16 },
});