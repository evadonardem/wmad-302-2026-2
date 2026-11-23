/**
 * Order Detail - items, totals, shipping and payment for one order.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { EmptyState } from '@/components/CommonComponents';
import { productApi } from '@/services/productApi';
import { ordersStorage } from '@/utils/storage';
import { cartToSummary, formatOrderDate, orderToSummary, SERVER_ID_PREFIX } from '@/utils/orders';
import { getDiscountedPrice } from '@/utils/cart';
import type { OrderSummary } from '@/types/order';
import { styles } from '../ordersStyles';

async function loadOrder(id: string): Promise<OrderSummary | null> {
  if (id.startsWith(SERVER_ID_PREFIX)) {
    const cartId = Number(id.slice(SERVER_ID_PREFIX.length));
    if (!Number.isFinite(cartId)) return null;
    return cartToSummary(await productApi.getCartById(cartId));
  }
  const all = await ordersStorage.getAll();
  const found = all.find((o) => o.id === id);
  return found ? orderToSummary(found) : null;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    loadOrder(decodeURIComponent(id))
      .then((result) => {
        if (!cancelled) setOrder(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title={failed ? 'Could not load order' : 'Order not found'}
          message={failed ? 'Check your connection and try again' : 'This order is no longer available'}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.list}>
      <Text style={styles.orderId}>{order.id}</Text>
      <Text style={styles.date}>{formatOrderDate(order.createdAt)}</Text>

      <Text style={styles.sectionTitle}>Items</Text>
      <View style={styles.box}>
        {order.lines.map((line) => (
          <View key={line.productId} style={styles.line}>
            <Image source={{ uri: line.thumbnail }} style={styles.lineImage} contentFit="contain" />
            <View style={styles.lineInfo}>
              <Text style={styles.lineTitle} numberOfLines={2}>
                {line.title}
              </Text>
              <Text style={styles.lineSub}>Qty {line.quantity}</Text>
            </View>
            <Text style={styles.linePrice}>
              ${(getDiscountedPrice(line.price, line.discountPercentage) * line.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.box}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Subtotal</Text>
          <Text style={styles.rowValue}>${order.subtotal.toFixed(2)}</Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Discount</Text>
            <Text style={styles.discount}>-${order.discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total</Text>
          <Text style={styles.strong}>${order.total.toFixed(2)}</Text>
        </View>
      </View>

      {order.shipping && (
        <>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.box}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{order.shipping.fullName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Phone</Text>
              <Text style={styles.rowValue}>{order.shipping.phone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Address</Text>
              <Text style={styles.rowValue}>
                {order.shipping.address}, {order.shipping.city} {order.shipping.postalCode}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Payment</Text>
              <Text style={styles.rowValue}>
                {order.paymentMethod === 'card' ? 'Card' : 'Cash on delivery'}
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}
