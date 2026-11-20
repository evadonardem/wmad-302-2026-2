/**
 * Order History - Marketplace
 * Shows (1) orders placed in this app (saved on the device) and
 * (2) past orders from DummyJSON: GET /carts/user/{id}
 * Tap an order to see its details.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/services/productApi';
import { Order } from '@/types/product';
import { orderStorage } from '@/utils/storage';
import { apiCartToOrder, belongsToUser, formatOrderDate, getOrderNumber } from '@/utils/orders';
import { resolveOrderStatus } from '@/utils/tracking';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';

export default function OrdersScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setWarning(null);

      // Orders placed in the app: newest first, only this user's
      const saved = (await orderStorage.getOrders().catch(() => []))
        .filter((o) => belongsToUser(o, user))
        .map((o) => resolveOrderStatus(o)); // status moves forward as time passes

      // Past orders from the API (GET /carts/user/{id}). If it fails we still show the
      // saved ones. A newly registered account has no history, so we skip the call
      // (it would only return the test account's sample orders).
      let past: Order[] = [];
      if (!user.isSimulated) {
        try {
          const response = await productApi.getUserCarts(user.id);
          past = response.carts
            .map(apiCartToOrder)
            .sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
        } catch {
          setWarning("Couldn't load your past orders. Pull down to try again.");
        }
      }

      setOrders([...saved, ...past]);
      setLoading(false);
      setRefreshing(false);
    },
    [user]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/order/${item.id}`)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Order ${getOrderNumber(item)}, ${item.status}`}
    >
      <Card style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderNumber}>Order {getOrderNumber(item)}</Text>
            <View style={[styles.status, item.status === 'Delivered' ? styles.statusDone : styles.statusActive]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.muted}>{formatOrderDate(item.placedAt)}</Text>

          <View style={styles.thumbs}>
            {item.items.slice(0, 4).map((line) => (
              <Image key={line.productId} source={{ uri: line.thumbnail }} style={styles.thumb} resizeMode="contain" />
            ))}
            {item.items.length > 4 && <Text style={styles.muted}>+{item.items.length - 4} more</Text>}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.muted}>
              {item.totalQuantity} {item.totalQuantity === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.total}>${item.discountedTotal.toFixed(2)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Orders" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={refreshing}
          onRefresh={() => loadOrders(true)}
          ListHeaderComponent={warning ? <Text style={styles.warning}>{warning}</Text> : null}
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="package-variant" size={80} color={colors.iconMuted} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.muted}>When you place an order, it will show up here.</Text>
              <Button mode="contained" style={styles.shopButton} onPress={() => router.replace('/(app)/(tabs)/home')}>
                Start shopping
              </Button>
            </View>
          }
        />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  
  list: { 
    padding: 16, 
    width: '100%', 
    maxWidth: 720, 
    alignSelf: 'center', 
    paddingBottom: 32 
  },
  
  center: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 32, gap: 8, flexGrow: 1 
  },
  
    separator: { 
    height: 10 
  },
  
  card: { 
    backgroundColor: colors.surface, 
    borderRadius: 12 
  },
  
  cardContent: { 
    padding: 14 
  },
 
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  
  orderNumber: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colors.text 
  },

  status: { 
    borderRadius: 12, 
    paddingHorizontal: 10, 
    paddingVertical: 3 
  },

  statusActive: { 
    backgroundColor: colors.warningContainer 
  },

  statusDone: { 
    backgroundColor: colors.successContainer 
  },

  statusText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: colors.textBody 
  },

  muted: { 
    fontSize: 13, 
    color: colors.textMuted 
  },
  
  thumbs: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginVertical: 10 
  },

  thumb: { 
    width: 48, 
    height: 48, 
    borderRadius: 6, 
    backgroundColor: colors.surfaceMuted 
  },

  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },

  total: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colors.primaryText
  },

  warning: { 
    color: colors.warning, 
    backgroundColor: colors.warningContainer, 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10 
  },

  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: colors.text, 
    marginTop: 8 
  },

  shopButton: { 
    marginTop: 16 
  },
});