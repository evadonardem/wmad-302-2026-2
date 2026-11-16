import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { addressesStorage, DeliveryAddress, ordersStorage } from '@/utils/marketplaceStorage';

const orange = '#EE4D2D';
type PaymentMethod = 'cash' | 'demo-card';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalQuantity, subtotal, discountedTotal, clearCart } = useCart();
  const [recipient, setRecipient] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    addressesStorage.getAll()
      .then((saved) => {
        setSavedAddresses(saved);
        const defaultAddress = saved.find((entry) => entry.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setRecipient(defaultAddress.recipient);
          setPhone(defaultAddress.phone);
          setAddress(defaultAddress.street);
          setCity(defaultAddress.city);
          setPostalCode(defaultAddress.postalCode);
        }
      })
      .catch((error: unknown) => {
        Alert.alert('Could not load saved addresses', error instanceof Error ? error.message : 'Please try again.');
      });
  }, []);

  const placeOrder = async () => {
    if (!recipient.trim() || !phone.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      Alert.alert('Shipping details required', 'Please fill in all delivery details before placing your order.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Your cart is empty', 'Add a product before checking out.');
      router.replace('/(app)/(tabs)/home');
      return;
    }
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in again before placing your order.');
      return;
    }

    setPlacingOrder(true);
    try {
      const order = await productApi.addCart({
        userId: user.id,
        products: items.map((item) => ({ id: item.productId, quantity: item.quantity })),
      });
      const deliveryAddress: DeliveryAddress = {
        id: selectedAddressId ?? `address-${Date.now()}`,
        recipient: recipient.trim(),
        phone: phone.trim(),
        street: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        isDefault:
          savedAddresses.length === 0 ||
          savedAddresses.find((saved) => saved.id === selectedAddressId)?.isDefault === true,
      };
      await addressesStorage.save(deliveryAddress);
      await ordersStorage.add({
        id: `${order.id}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'Processing',
        items: [...items],
        subtotal,
        total: discountedTotal,
        shippingAddress: deliveryAddress,
        paymentMethod,
      });
      await clearCart();
      router.replace({
        pathname: '/(app)/order-confirmation',
        params: {
          orderId: String(order.id),
          total: discountedTotal.toFixed(2),
          itemCount: String(items.reduce((count, item) => count + item.quantity, 0)),
          recipient: recipient.trim(),
          payment: paymentMethod,
        },
      });
    } catch (error) {
      Alert.alert(
        'Could not place order',
        error instanceof Error ? error.message : 'Please check your connection and try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Nothing to check out yet</Text>
        <Button mode="contained" buttonColor={orange} onPress={() => router.replace('/(app)/(tabs)/home')}>
          Browse products
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => router.back()} textColor="#444">
          Back to cart
        </Button>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <Card style={styles.card} mode="contained">
        <Card.Content>
          <View style={styles.sectionHeading}>
            <MaterialCommunityIcons name="map-marker" size={22} color={orange} />
            <Text style={styles.sectionTitle}>Delivery address</Text>
          </View>
          {savedAddresses.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedAddresses}>
              {savedAddresses.map((saved) => (
                <Button
                  key={saved.id}
                  mode="outlined"
                  compact
                  textColor={orange}
                  style={styles.savedAddress}
                  onPress={() => {
                    setSelectedAddressId(saved.id);
                    setRecipient(saved.recipient);
                    setPhone(saved.phone);
                    setAddress(saved.street);
                    setCity(saved.city);
                    setPostalCode(saved.postalCode);
                  }}
                >
                  {saved.recipient}{saved.isDefault ? ' · Default' : ''}
                </Button>
              ))}
            </ScrollView>
          )}
          <TextInput label="Recipient name" mode="outlined" value={recipient} onChangeText={setRecipient} style={styles.input} />
          <TextInput label="Phone number" mode="outlined" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
          <TextInput label="Street address" mode="outlined" value={address} onChangeText={setAddress} style={styles.input} />
          <View style={styles.cityRow}>
            <TextInput label="City" mode="outlined" value={city} onChangeText={setCity} style={[styles.input, styles.cityInput]} />
            <TextInput label="Postal code" mode="outlined" value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" style={[styles.input, styles.cityInput]} />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="contained">
        <Card.Content>
          <View style={styles.sectionHeading}>
            <MaterialCommunityIcons name="credit-card-outline" size={22} color={orange} />
            <Text style={styles.sectionTitle}>Payment method</Text>
          </View>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('cash')}
          >
            <MaterialCommunityIcons name="cash" size={22} color={orange} />
            <View style={styles.paymentText}>
              <Text style={styles.paymentTitle}>Cash on delivery</Text>
              <Text style={styles.hint}>Pay when your order arrives</Text>
            </View>
            <MaterialCommunityIcons
              name={paymentMethod === 'cash' ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={orange}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'demo-card' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('demo-card')}
          >
            <MaterialCommunityIcons name="credit-card" size={22} color={orange} />
            <View style={styles.paymentText}>
              <Text style={styles.paymentTitle}>Demo card</Text>
              <Text style={styles.hint}>Simulation only; no payment is charged</Text>
            </View>
            <MaterialCommunityIcons
              name={paymentMethod === 'demo-card' ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={orange}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="contained">
        <Card.Content>
          <Text style={styles.sectionTitle}>Order summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.hint}>Items ({totalQuantity})</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {subtotal > discountedTotal && (
            <View style={styles.summaryRow}>
              <Text style={styles.hint}>Discount</Text>
              <Text style={styles.savings}>-${(subtotal - discountedTotal).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.hint}>Shipping</Text>
            <Text style={styles.savings}>FREE</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>${discountedTotal.toFixed(2)}</Text>
          </View>
          <Button
            mode="contained"
            buttonColor={orange}
            onPress={() => void placeOrder()}
            loading={placingOrder}
            disabled={placingOrder}
            style={styles.placeOrder}
          >
            Place order
          </Button>
          <Text style={styles.disclaimer}>
            This demo records an order using DummyJSON. It does not collect card details or process real payments.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 14, paddingBottom: 28 },
  header: { marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800' as const, color: '#222', marginHorizontal: 10, marginBottom: 8 },
  card: { backgroundColor: '#FFF', marginBottom: 12 },
  sectionHeading: { flexDirection: 'row' as const, alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#222', fontSize: 17, fontWeight: '700' as const },
  input: { marginBottom: 10, backgroundColor: '#FFF' },
  savedAddresses: { marginBottom: 10 },
  savedAddress: { marginRight: 8 },
  cityRow: { flexDirection: 'row' as const, gap: 8 },
  cityInput: { flex: 1 },
  paymentOption: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginTop: 8 },
  paymentSelected: { borderColor: orange, backgroundColor: '#FFF8F6' },
  paymentText: { flex: 1 },
  paymentTitle: { color: '#333', fontWeight: '600' as const },
  hint: { color: '#777', fontSize: 13 },
  summaryRow: { flexDirection: 'row' as const, justifyContent: 'space-between', paddingVertical: 8 },
  summaryValue: { color: '#333' },
  savings: { color: '#179B62', fontWeight: '600' as const },
  totalLabel: { color: '#222', fontWeight: '700' as const, fontSize: 16 },
  total: { color: orange, fontWeight: '800' as const, fontSize: 20 },
  placeOrder: { marginTop: 12 },
  disclaimer: { color: '#888', fontSize: 11, lineHeight: 16, marginTop: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#FFF' },
  emptyTitle: { color: '#222', fontSize: 19, fontWeight: '700' as const },
});
