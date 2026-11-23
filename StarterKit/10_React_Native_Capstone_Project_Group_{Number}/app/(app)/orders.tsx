/**
 * Order History
 * Shows orders placed on this device plus the user's carts from
 * GET /carts/user/{id}. A failing API call never hides the local orders.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/CommonComponents';
import { productApi } from '@/services/productApi';
import { ordersStorage } from '@/utils/storage';
import { cartToSummary, formatOrderDate, orderToSummary } from '@/utils/orders';
import type { OrderSummary } from '@/types/order';
import { styles } from './ordersStyles';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverFailed, setServerFailed] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [local, server] = await Promise.allSettled([
      ordersStorage.getForUser(user.id),
      productApi.getUserCarts(user.id),
    ]);

    const device = local.status === 'fulfilled' ? local.value.map(orderToSummary) : [];

    const remote = server.status === 'fulfilled' ? server.value.carts.map(cartToSummary) : [];

    setServerFailed(server.status === 'rejected');
    setOrders([...device, ...remote]);
  }, [user]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderOrder = ({ item }: { item: OrderSummary }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(app)/order/${encodeURIComponent(item.id)}`)}
    >
      <Card style={styles.card} elevation={1}>
        <Card.Content>
          <View style={styles.cardTop}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.orderId} numberOfLines={1}>
                {item.id}
              </Text>
              <Text style={styles.date}>{formatOrderDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.thumbRow}>
            {item.lines.slice(0, 5).map((line) => (
              <Image
                key={line.productId}
                source={{ uri: line.thumbnail }}
                style={styles.thumb}
                contentFit="contain"
              />
            ))}
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.meta}>{item.totalQuantity} items</Text>
            <Text style={styles.total}>${item.total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A73E8']} />}
        ListHeaderComponent={
          serverFailed ? (
            <Text style={styles.notice}>Could not load past orders from the server. Pull to retry.</Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            title="No orders yet"
            message="Orders you place will show up here"
            actionLabel="Start shopping"
            onAction={() => router.replace('/(app)/(tabs)/home')}
          />
        }
      />
    </View>
  );
}
