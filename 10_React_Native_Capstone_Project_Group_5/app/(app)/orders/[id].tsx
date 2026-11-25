import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Dialog, IconButton, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDeliveryAddress, MarketplaceOrder, ordersStorage } from '@/utils/marketplaceStorage';

const brandPurple = '#75648A';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<'Cancelled' | 'Completed' | null>(null);
  const [pendingStatus, setPendingStatus] = useState<'Cancelled' | 'Completed' | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

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

  const updateOrderStatus = async (status: 'Cancelled' | 'Completed') => {
    if (!order || order.status !== 'Processing') return;

    setUpdatingStatus(status);
    setStatusError(null);
    try {
      const updatedOrder = status === 'Cancelled'
        ? await ordersStorage.cancel(order.id)
        : await ordersStorage.complete(order.id);
      setOrder(updatedOrder);
      setPendingStatus(null);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const confirmPendingStatus = () => {
    if (pendingStatus) void updateOrderStatus(pendingStatus);
  };

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
          <View style={styles.orderHeroTop}>
            <View style={styles.orderIdentifier}>
              <Text style={styles.eyebrow}>ORDER NUMBER</Text>
              <Text style={styles.title} numberOfLines={1}>#{order.id}</Text>
            </View>
            <View style={[
              styles.statusPill,
              order.status === 'Completed' && styles.completedPill,
              order.status === 'Cancelled' && styles.cancelledPill,
            ]}>
              <View style={[
                styles.statusDot,
                order.status === 'Completed' && styles.completedDot,
                order.status === 'Cancelled' && styles.cancelledDot,
              ]} />
              <Text style={[
                styles.status,
                order.status === 'Completed' && styles.completedStatus,
                order.status === 'Cancelled' && styles.cancelledStatus,
              ]}>
                {order.status === 'Processing' ? 'In progress' : order.status}
              </Text>
            </View>
          </View>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#81788A" />
            <Text style={styles.muted}>Placed {new Date(order.createdAt).toLocaleString()}</Text>
          </View>
        </Card.Content>
      </Card>
      <Card style={styles.card} mode="contained">
        <Card.Content>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons name="shopping-outline" size={19} color={brandPurple} />
            </View>
            <Text style={styles.sectionTitle}>Order items</Text>
            <Text style={styles.itemCount}>
              {order.items.reduce((quantity, item) => quantity + item.quantity, 0)} items
            </Text>
          </View>
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
          {order.couponCode && (order.couponDiscount ?? 0) > 0 && (
            <View style={styles.itemRow}>
              <Text style={styles.muted}>Coupon ({order.couponCode})</Text>
              <Text style={styles.savings}>-${order.couponDiscount?.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order total</Text>
            <Text style={styles.totalPrice}>${order.total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
      <Card style={styles.card} mode="contained">
        <Card.Content>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons name="map-marker-outline" size={19} color={brandPurple} />
            </View>
            <Text style={styles.sectionTitle}>Delivery details</Text>
          </View>
          <Text style={styles.recipient}>{order.shippingAddress.recipient}</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone-outline" size={17} color="#81788A" />
            <Text style={styles.detailText}>{order.shippingAddress.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={17} color="#81788A" />
            <Text style={styles.detailText}>
              {formatDeliveryAddress(order.shippingAddress)}
            </Text>
          </View>
          <View style={styles.paymentMethod}>
            <MaterialCommunityIcons
              name={order.paymentMethod === 'cash' ? 'cash' : 'credit-card-outline'}
              size={17}
              color="#81788A"
            />
            <Text style={styles.detailText}>
              {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Demo card'}
            </Text>
          </View>
        </Card.Content>
      </Card>
      {order.status === 'Processing' && (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="close-circle-outline"
            textColor="#B00020"
            onPress={() => {
              setStatusError(null);
              setPendingStatus('Cancelled');
            }}
            loading={updatingStatus === 'Cancelled'}
            disabled={updatingStatus !== null}
            style={styles.cancelButton}
          >
            Cancel order
          </Button>
          <Button
            mode="outlined"
            icon="check-circle-outline"
            textColor="#179B62"
            onPress={() => {
              setStatusError(null);
              setPendingStatus('Completed');
            }}
            loading={updatingStatus === 'Completed'}
            disabled={updatingStatus !== null}
            style={styles.completeButton}
          >
            Mark completed
          </Button>
        </View>
      )}
      <Portal>
        <Dialog
          visible={pendingStatus !== null}
          style={styles.confirmationDialog}
          onDismiss={() => {
            if (updatingStatus === null) setPendingStatus(null);
          }}
        >
          <Dialog.Content>
            <View style={styles.dialogHeader}>
              <View style={[
                styles.dialogIcon,
                pendingStatus === 'Cancelled' ? styles.cancelDialogIcon : styles.completeDialogIcon,
              ]}>
                <MaterialCommunityIcons
                  name={pendingStatus === 'Cancelled' ? 'cart-remove' : 'check-circle-outline'}
                  size={25}
                  color={pendingStatus === 'Cancelled' ? '#B4233C' : '#25845A'}
                />
              </View>
              <View style={styles.dialogHeading}>
                <Text style={styles.dialogEyebrow}>ORDER UPDATE</Text>
                <Text style={styles.dialogTitle}>
                  {pendingStatus === 'Cancelled' ? 'Cancel order?' : 'Mark as completed?'}
                </Text>
              </View>
            </View>
            <View style={styles.orderSummary}>
              <View style={styles.orderNumber}>
                <MaterialCommunityIcons name="cart-outline" size={17} color={brandPurple} />
                <Text style={styles.orderNumberText} numberOfLines={1}>Order #{order.id}</Text>
              </View>
              <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
            </View>
            <Text style={styles.dialogMessage}>
              {pendingStatus === 'Cancelled'
                ? 'This order will move to your Cancelled orders. You can still view its details.'
                : 'This demo action will move the order to your Completed orders.'}
            </Text>
            <View style={styles.dialogNote}>
              <MaterialCommunityIcons name="information-outline" size={17} color={brandPurple} />
              <Text style={styles.dialogNoteText}>This is a demo order. No real payment is processed.</Text>
            </View>
            {statusError && <Text style={styles.error}>{statusError}</Text>}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="outlined"
              textColor={brandPurple}
              style={styles.keepButton}
              onPress={() => setPendingStatus(null)}
              disabled={updatingStatus !== null}
            >
              Keep it
            </Button>
            <Button
              mode="contained"
              buttonColor={pendingStatus === 'Cancelled' ? '#B4233C' : '#25845A'}
              onPress={confirmPendingStatus}
              loading={updatingStatus !== null}
              disabled={updatingStatus !== null}
              style={styles.confirmButton}
            >
              {pendingStatus === 'Cancelled' ? 'Cancel order' : 'Mark completed'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F4F9' },
  content: { padding: 16, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heading: { color: '#30283A', fontSize: 23, fontWeight: '800' },
  card: { backgroundColor: '#FFF', marginBottom: 14, borderRadius: 18, borderWidth: 1, borderColor: '#EBE5EF' },
  orderHeroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  orderIdentifier: { flex: 1 },
  eyebrow: { color: '#81788A', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#30283A', fontSize: 18, fontWeight: '800', marginTop: 4 },
  sectionTitle: { color: '#222', fontSize: 16, fontWeight: '700' },
  muted: { color: '#77717F', fontSize: 13 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F2EEF5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  completedPill: { backgroundColor: '#E8F5EE' },
  cancelledPill: { backgroundColor: '#FCECEF' },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: brandPurple },
  completedDot: { backgroundColor: '#25845A' },
  cancelledDot: { backgroundColor: '#B4233C' },
  status: { color: brandPurple, fontSize: 12, fontWeight: '700' },
  completedStatus: { color: '#25845A' },
  cancelledStatus: { color: '#B4233C' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 7 },
  sectionIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#F2EEF5', alignItems: 'center', justifyContent: 'center' },
  itemCount: { color: '#81788A', fontSize: 12, marginLeft: 'auto' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11 },
  image: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F8F6FA' },
  itemInfo: { flex: 1, paddingHorizontal: 10 },
  itemTitle: { color: '#30283A', fontWeight: '600' },
  price: { color: brandPurple, fontWeight: '700' },
  savings: { color: '#25845A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EAE5EE', marginTop: 3 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15 },
  totalLabel: { color: '#30283A', fontSize: 15, fontWeight: '700' },
  totalPrice: { color: brandPurple, fontSize: 20, fontWeight: '800' },
  recipient: { color: '#30283A', fontSize: 16, fontWeight: '700', marginTop: 5, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 8 },
  detailText: { flex: 1, color: '#6E6675', fontSize: 13, lineHeight: 19 },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEE8F1' },
  cancelButton: { borderColor: '#B4233C', marginTop: 4, borderRadius: 12 },
  completeButton: { borderColor: '#25845A', marginTop: 4, borderRadius: 12 },
  actions: { gap: 8 },
  confirmationDialog: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 430,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFF',
  },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  dialogIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cancelDialogIcon: { backgroundColor: '#FCECEF' },
  completeDialogIcon: { backgroundColor: '#E8F5EE' },
  dialogHeading: { flex: 1, marginLeft: 13 },
  dialogEyebrow: { color: '#887998', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  dialogTitle: { color: '#24202A', fontSize: 21, fontWeight: '800', marginTop: 3 },
  orderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F6FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 14,
  },
  orderNumber: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  orderNumberText: { color: '#55505E', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  orderTotal: { color: brandPurple, fontSize: 16, fontWeight: '800', marginLeft: 8 },
  dialogMessage: { color: '#605B66', fontSize: 14, lineHeight: 20 },
  dialogNote: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  dialogNoteText: { color: '#817B87', flex: 1, fontSize: 12, lineHeight: 17 },
  dialogActions: { paddingHorizontal: 20, paddingBottom: 18, gap: 8 },
  keepButton: { borderColor: '#DED7E5', borderRadius: 10 },
  confirmButton: { borderRadius: 10 },
  error: { color: '#B00020', marginTop: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
