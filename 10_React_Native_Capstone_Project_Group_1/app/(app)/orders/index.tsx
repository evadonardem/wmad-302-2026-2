/**
 * Order History - GET /carts/user/{id} merged with orders placed on this device
 */
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Card, useTheme } from 'react-native-paper';
import { useOrders } from '@/hooks/useOrders';
import { EmptyState, ErrorState, LoadingView } from '@/components/CommonComponents';
import { OrderStatusBadge, formatOrderDate, orderTitle } from '@/components/OrderComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { formatCurrency } from '@/utils/pricing';

export default function OrdersScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { orders, loading, refreshing, error, refresh, retry } = useOrders();

  if (loading && orders.length === 0) return <LoadingView message="Loading orders..." />;
  // Local orders are still shown if the network call fails; only a fully empty list shows the error
  if (error && orders.length === 0) return <ErrorState message={error} onRetry={retry} />;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={orders}
        keyExtractor={(order) => order.id}
        contentContainerStyle={orders.length === 0 ? styles.emptyContent : styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            title="No orders yet"
            message="When you place an order it will show up here."
            actionLabel="Start shopping"
            onAction={() => router.replace('/(app)/(tabs)/home')}
          />
        }
        renderItem={({ item: order }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/(app)/orders/${order.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${orderTitle(order)}, ${formatCurrency(order.discountedTotal)}`}
          >
            <Card style={styles.card} elevation={1}>
              <Card.Content>
                <View style={styles.row}>
                  <Text style={[styles.title, { color: theme.colors.onSurface }]}>{orderTitle(order)}</Text>
                  <OrderStatusBadge status={order.status} />
                </View>
                <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                  {formatOrderDate(order)} · {order.totalQuantity} {order.totalQuantity === 1 ? 'item' : 'items'}
                </Text>
                <View style={styles.thumbs}>
                  {order.items.slice(0, 4).map((item) => (
                    <Image
                      key={item.productId}
                      source={{ uri: item.thumbnail }}
                      style={[styles.thumb, { backgroundColor: theme.colors.surfaceVariant }]}
                      contentFit="contain"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <Text style={[styles.more, { color: theme.colors.onSurfaceVariant }]}>
                      +{order.items.length - 4}
                    </Text>
                  )}
                </View>
                <View style={styles.row}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>Total</Text>
                  <Text style={[styles.total, { color: theme.colors.primary }]}>
                    {formatCurrency(order.discountedTotal)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { padding: spacing.md, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' },
  emptyContent: { flexGrow: 1 },
  card: { borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 2 },
  thumbs: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  more: { fontSize: 13, fontWeight: '600' },
  total: { fontSize: 18, fontWeight: '800' },
});
