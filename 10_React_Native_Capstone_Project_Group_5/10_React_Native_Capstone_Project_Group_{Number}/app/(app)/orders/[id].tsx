import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { MarketplaceOrder, ordersStorage } from '@/utils/marketplaceStorage';

const orange = '#EE4D2D';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    ordersStorage.getAll()
      .then((savedOrders) => {
        if (active) setOrder(savedOrders.find((entry) => entry.id === id) ?? null);
      })
      .catch((error: unknown) => {
        console.error('Failed to load order details:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]));

  if (loading) return <View style={styles.center}><Text style={styles.muted}>Loading order...</Text></View>;
  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Order not found on this device.</Text>
        <Button onPress={() => router.replace('/(app)/orders')}>Back to orders</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text style={styles.heading}>Order details</Text>
      </View>
      <Card style={styles.card} mode="contained">
        <Card.Content>
          <Text style={styles.title}>Order #{order.id}</Text>
          <Text style={styles.muted}>{new Date(order.createdAt).toLocaleString()}</Text>
          <Text style={styles.status}>{order.status}</Text>
        </Card.Content>
      </Card>
      <Card style={styles.card} mode="contained">
        <Card.Content>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="contain" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.muted}>Qty {item.quantity}</Text>
              </View>
              <Text style={styles.price}>
                ${(item.price * (1 - item.discountPercentage / 100) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.sectionTitle}>Total</Text>
            <Text style={styles.price}>${order.total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
      <Card style={styles.card} mode="contained">
        <Card.Content>
          <Text style={styles.sectionTitle}>Deliver to</Text>
          <Text style={styles.itemTitle}>{order.shippingAddress.recipient}</Text>
          <Text style={styles.muted}>{order.shippingAddress.phone}</Text>
          <Text style={styles.muted}>
            {order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
          </Text>
          <Text style={styles.muted}>
            Payment: {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Demo card'}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 14, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  heading: { color: '#222', fontSize: 22, fontWeight: '800' },
  card: { backgroundColor: '#FFF', marginBottom: 12 },
  title: { color: '#222', fontSize: 18, fontWeight: '800', marginBottom: 5 },
  sectionTitle: { color: '#222', fontSize: 16, fontWeight: '700' },
  muted: { color: '#777', fontSize: 13, marginTop: 5 },
  status: { color: '#179B62', fontWeight: '700', marginTop: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  image: { width: 62, height: 62 },
  itemInfo: { flex: 1, paddingHorizontal: 10 },
  itemTitle: { color: '#333', fontWeight: '600' },
  price: { color: orange, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#EEE' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
