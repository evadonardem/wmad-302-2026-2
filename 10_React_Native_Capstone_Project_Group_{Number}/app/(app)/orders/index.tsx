import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { MarketplaceOrder, ordersStorage } from '@/utils/marketplaceStorage';
import ProductRecommendations from '@/components/ProductRecommendations';

const brandPurple = '#75648A';
const orderFilters: { status: MarketplaceOrder['status']; label: string }[] = [
  { status: 'Processing', label: 'In progress' },
  { status: 'Completed', label: 'Completed' },
  { status: 'Cancelled', label: 'Cancelled' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<MarketplaceOrder['status']>('Processing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filteredOrders = orders.filter((order) => order.status === statusFilter);
  const selectedFilterLabel = orderFilters.find((filter) => filter.status === statusFilter)?.label ?? 'Orders';

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
        <View>
          <Text style={styles.heading}>My Orders</Text>
          <Text style={styles.headerSubtitle}>Track and manage your purchases</Text>
        </View>
      </View>
      {loading ? <ActivityIndicator size="large" color={brandPurple} /> : error ? (
        <View style={styles.empty}>
          <Text style={styles.error}>{error}</Text>
          <Button mode="outlined" onPress={() => router.replace('/(app)/(tabs)/profile')}>Back to profile</Button>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.muted}>Your orders will appear here.</Text>
          <Button mode="contained" buttonColor={brandPurple} onPress={() => router.replace('/(app)/(tabs)/home')}>
            Start shopping
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.filterBar}>
            {orderFilters.map((filter) => {
              const isSelected = filter.status === statusFilter;
              const count = orders.filter((order) => order.status === filter.status).length;
              return (
                <TouchableOpacity
                  key={filter.status}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setStatusFilter(filter.status)}
                  style={[styles.filterButton, isSelected && styles.selectedFilterButton]}
                >
                  <Text style={[styles.filterLabel, isSelected && styles.selectedFilterText]}>
                    {filter.label}
                  </Text>
                  <Text style={[styles.filterCount, isSelected && styles.selectedFilterText]}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyFilter}>
              <Text style={styles.emptyTitle}>No {selectedFilterLabel.toLowerCase()} orders</Text>
              <Text style={styles.muted}>Orders with this status will appear here.</Text>
            </View>
          ) : filteredOrders.map((order) => (
            <Card key={order.id} style={styles.card} mode="contained">
              <Card.Content>
                <View style={styles.row}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <View style={[
                    styles.statusPill,
                    order.status === 'Completed' && styles.completedPill,
                    order.status === 'Cancelled' && styles.cancelledPill,
                  ]}>
                    <Text style={[
                      styles.status,
                      order.status === 'Completed' && styles.completedStatus,
                      order.status === 'Cancelled' && styles.cancelledStatus,
                    ]}>
                      {order.status === 'Processing' ? 'In progress' : order.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.muted}>{new Date(order.createdAt).toLocaleString()}</Text>
                <View style={styles.itemList}>
                  {order.items.map((item) => (
                    <View key={item.productId} style={styles.itemRow}>
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.itemImage}
                        resizeMode="contain"
                        accessibilityLabel={item.title}
                      />
                      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.body}>Delivering to {order.shippingAddress.city}</Text>
                <View style={styles.row}>
                  <Text style={styles.muted}>Total paid (demo)</Text>
                  <Text style={styles.total}>${order.total.toFixed(2)}</Text>
                </View>
                <Button
                  mode="text"
                  textColor={brandPurple}
                  onPress={() => router.push({ pathname: '/(app)/orders/[id]', params: { id: order.id } })}
                >
                  View order details
                </Button>
              </Card.Content>
            </Card>
          ))}
        </>
      )}
        {!loading && !error && (
          <ProductRecommendations
            title="Recommended for you"
            subtitle="Discover products you might like"
          />
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F4F9' },
  content: { padding: 16, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heading: { color: '#30283A', fontSize: 22, fontWeight: '800' },
  headerSubtitle: { color: '#81788A', fontSize: 12, marginTop: 2 },
  card: { backgroundColor: '#FFF', marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: '#EBE5EF' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { color: '#222', fontWeight: '700' },
  statusPill: { backgroundColor: '#F2EEF5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  completedPill: { backgroundColor: '#E8F5EE' },
  cancelledPill: { backgroundColor: '#FCECEF' },
  status: { color: brandPurple, fontSize: 11, fontWeight: '700' },
  completedStatus: { color: '#25845A' },
  cancelledStatus: { color: '#B4233C' },
  filterBar: { flexDirection: 'row', backgroundColor: '#EEE9F2', borderRadius: 14, padding: 4, marginBottom: 16 },
  filterButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 11 },
  selectedFilterButton: { backgroundColor: brandPurple },
  filterLabel: { color: '#555', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  filterCount: { color: '#777', fontSize: 12, marginTop: 2 },
  selectedFilterText: { color: '#FFF' },
  muted: { color: '#77717F', fontSize: 13 },
  itemList: { gap: 8, marginTop: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemImage: { width: 52, height: 52, borderRadius: 6, backgroundColor: '#FAF9FC' },
  itemTitle: { flex: 1, color: '#222', fontWeight: '600', fontSize: 14 },
  itemQuantity: { color: '#777', fontSize: 13, fontWeight: '600' },
  body: { color: '#444', marginTop: 8, marginBottom: 12 },
  total: { color: brandPurple, fontWeight: '800', fontSize: 17 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 80 },
  emptyFilter: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 50 },
  emptyTitle: { fontSize: 20, color: '#222', fontWeight: '700' },
  error: { color: '#B00020', textAlign: 'center' },
});
