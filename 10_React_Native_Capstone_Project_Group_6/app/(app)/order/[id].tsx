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

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Order details" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1A73E8" />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Order details" />
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#DADCE0" />
          <Text style={styles.error}>{error ?? 'Order not found'}</Text>
          <Button mode="contained" onPress={loadOrder}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  const paymentLabel = PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`Order ${getOrderNumber(order)}`} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Status */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={[styles.status, order.status === 'Delivered' ? styles.statusDone : styles.statusActive]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
            <Text style={styles.muted}>Placed: {formatOrderDate(order.placedAt)}</Text>
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
            {order.total !== order.discountedTotal && (
              <View style={styles.row}>
                <Text style={styles.muted}>Discount</Text>
                <Text style={styles.discount}>-${(order.total - order.discountedTotal).toFixed(2)}</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  error: { fontSize: 16, color: '#EA4335', textAlign: 'center' },
  scrollContent: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  section: { backgroundColor: '#FFFFFF', marginTop: 10, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#202124', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  muted: { fontSize: 13, color: '#5F6368' },
  bodyText: { fontSize: 14, color: '#202124', lineHeight: 20 },
  paymentLine: { marginTop: 6 },
  status: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  statusActive: { backgroundColor: '#FEF7E0' },
  statusDone: { backgroundColor: '#E6F4EA' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#3C4043' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  itemImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F1F3F4' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#202124' },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#202124' },
  discount: { fontSize: 13, color: '#188038' },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E0E0E0', marginTop: 8, paddingTop: 10 },
  grandTotal: { fontSize: 18, fontWeight: '700', color: '#1A73E8' },
  backButton: { margin: 16 },
});
