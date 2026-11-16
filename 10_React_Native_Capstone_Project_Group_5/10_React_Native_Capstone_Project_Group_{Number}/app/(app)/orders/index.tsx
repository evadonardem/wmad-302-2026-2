import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { MarketplaceOrder, ordersStorage } from '@/utils/marketplaceStorage';

const orange = '#EE4D2D';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    ordersStorage.getAll()
      .then((savedOrders) => {
        if (active) {
          setOrders(savedOrders);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load orders.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text style={styles.heading}>My Orders</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color={orange} /> : error ? (
        <View style={styles.empty}>
          <Text style={styles.error}>{error}</Text>
          <Button mode="outlined" onPress={() => router.replace('/(app)/(tabs)/profile')}>Back to profile</Button>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.muted}>Your completed demo orders will appear here.</Text>
          <Button mode="contained" buttonColor={orange} onPress={() => router.replace('/(app)/(tabs)/home')}>
            Start shopping
          </Button>
        </View>
      ) : orders.map((order) => (
        <Card key={order.id} style={styles.card} mode="contained">
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <Text style={styles.status}>{order.status}</Text>
            </View>
            <Text style={styles.muted}>{new Date(order.createdAt).toLocaleString()}</Text>
            <Text style={styles.body}>
              {order.items.reduce((quantity, item) => quantity + item.quantity, 0)} item(s) ·{' '}
              {order.shippingAddress.city}
            </Text>
            <View style={styles.row}>
              <Text style={styles.muted}>Total paid (demo)</Text>
              <Text style={styles.total}>${order.total.toFixed(2)}</Text>
            </View>
            <Button
              mode="text"
              textColor={orange}
              onPress={() => router.push({ pathname: '/(app)/orders/[id]', params: { id: order.id } })}
            >
              View order details
            </Button>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 14, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  heading: { color: '#222', fontSize: 22, fontWeight: '800' },
  card: { backgroundColor: '#FFF', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { color: '#222', fontWeight: '700' },
  status: { color: '#179B62', fontWeight: '700' },
  muted: { color: '#777', fontSize: 13 },
  body: { color: '#444', marginVertical: 12 },
  total: { color: orange, fontWeight: '800', fontSize: 17 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 80 },
  emptyTitle: { fontSize: 20, color: '#222', fontWeight: '700' },
  error: { color: '#B00020', textAlign: 'center' },
});
