import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

const orange = '#EE4D2D';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    isLoading,
    totalQuantity,
    subtotal,
    discountedTotal,
    updateQuantity,
    removeItem,
  } = useCart();

  const update = async (productId: number, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      Alert.alert('Quantity unavailable', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const confirmRemove = (productId: number) => {
    Alert.alert('Remove item', 'Remove this item from your cart?', [
      { text: 'Keep item', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeItem(productId).catch((error: unknown) => {
            Alert.alert('Could not remove item', error instanceof Error ? error.message : 'Try again.');
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading your cart...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="cart-outline" size={76} color="#CCC" />
        <Text style={styles.emptyTitle}>Your cart is waiting</Text>
        <Text style={styles.muted}>Find something you love and add it here.</Text>
        <Button mode="contained" buttonColor={orange} onPress={() => router.push('/(app)/(tabs)/home')}>
          Start shopping
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>My Cart ({totalQuantity})</Text>
        {items.map((item) => {
          const unitPrice = item.price * (1 - item.discountPercentage / 100);
          return (
            <Card key={item.productId} style={styles.card} mode="contained">
              <View style={styles.itemRow}>
                <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="contain" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.itemPrice}>${unitPrice.toFixed(2)}</Text>
                  {item.discountPercentage > 0 && (
                    <Text style={styles.oldPrice}>${item.price.toFixed(2)}</Text>
                  )}
                  <View style={styles.controls}>
                    <IconButton
                      icon="minus"
                      size={18}
                      onPress={() => void update(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      accessibilityLabel="Decrease quantity"
                    />
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      size={18}
                      onPress={() => void update(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      accessibilityLabel="Increase quantity"
                    />
                  </View>
                </View>
                <IconButton
                  icon="delete-outline"
                  iconColor={orange}
                  onPress={() => confirmRemove(item.productId)}
                  accessibilityLabel={`Remove ${item.title}`}
                />
              </View>
            </Card>
          );
        })}

        <Card style={styles.summary} mode="contained">
          <Text style={styles.summaryTitle}>Order summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {subtotal > discountedTotal && (
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>Product discounts</Text>
              <Text style={styles.savings}>-${(subtotal - discountedTotal).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Shipping</Text>
            <Text style={styles.savings}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>${discountedTotal.toFixed(2)}</Text>
          </View>
          <Button
            mode="contained"
            buttonColor={orange}
            style={styles.checkoutButton}
            onPress={() => router.push('/(app)/checkout')}
          >
            Proceed to checkout
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 14, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '800' as const, color: '#222', marginBottom: 12 },
  card: { backgroundColor: '#FFF', marginBottom: 10 },
  itemRow: { flexDirection: 'row' as const, alignItems: 'center', padding: 10 },
  image: { width: 82, height: 82, backgroundColor: '#FAFAFA', borderRadius: 6 },
  itemInfo: { flex: 1, paddingHorizontal: 10 },
  itemTitle: { color: '#222', fontWeight: '600' as const, fontSize: 14 },
  itemPrice: { color: orange, fontWeight: '700' as const, fontSize: 16, marginTop: 6 },
  oldPrice: { color: '#999', fontSize: 12, textDecorationLine: 'line-through' as const },
  controls: { flexDirection: 'row' as const, alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#EEE', borderRadius: 6, marginTop: 4 },
  quantity: { minWidth: 24, textAlign: 'center' as const, color: '#333', fontWeight: '600' as const },
  summary: { backgroundColor: '#FFF', padding: 16, marginTop: 4 },
  summaryTitle: { fontSize: 17, color: '#222', fontWeight: '700' as const, marginBottom: 10 },
  summaryRow: { flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  summaryValue: { color: '#333', fontSize: 13 },
  savings: { color: '#179B62', fontWeight: '600' as const },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 8 },
  totalLabel: { fontWeight: '700' as const, color: '#222', fontSize: 16 },
  total: { color: orange, fontSize: 20, fontWeight: '800' as const },
  checkoutButton: { marginTop: 14, borderRadius: 5 },
  empty: { flex: 1, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  emptyTitle: { color: '#222', fontSize: 20, fontWeight: '700' as const },
  muted: { color: '#777', fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
