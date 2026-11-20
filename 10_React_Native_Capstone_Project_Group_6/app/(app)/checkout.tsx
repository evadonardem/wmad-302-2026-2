/**
 * Checkout Screen - Marketplace
 * 1. Shipping form with validation
 * 2. Payment method
 * 3. Place order -> POST /carts/add
 * 4. Confirmation screen (order number, "View order")
 *
 * DummyJSON only pretends to save the order, so we also save it on the device
 * (orderStorage) - that is what makes it show up in Order History.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Chip, HelperText, RadioButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { getDiscountedPrice, useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { Address } from '@/types/auth';
import { Order, PaymentMethod, ShippingInfo } from '@/types/product';
import { addressToShipping, getDefaultAddress } from '@/utils/profile';
import { addressStorage, orderStorage, settingsStorage } from '@/utils/storage';
import {
  PAYMENT_METHODS,
  ShippingErrors,
  buildOrder,
  getOrderNumber,
  validateShipping,
} from '@/utils/orders';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, discountedTotal, totalQuantity, clearCart } = useCart();

  const [form, setForm] = useState<ShippingInfo>({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone ?? '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  // Prefill from the person's saved default address and default payment method (Profile).
  // Only fills an EMPTY form, so it never overwrites what they have already typed.
  const username = user?.username;
  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    const loadSaved = async () => {
      const [addresses, settings] = await Promise.all([
        addressStorage.get(username),
        settingsStorage.get(username),
      ]);
      if (cancelled) return;
      setSavedAddresses(addresses);
      const defaultAddress = getDefaultAddress(addresses);
      if (defaultAddress) {
        setForm((prev) => (prev.address === '' ? addressToShipping(defaultAddress) : prev));
      }
      if (settings?.defaultPayment) setPaymentMethod(settings.defaultPayment);
    };

    loadSaved().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [username]);

  const applySavedAddress = (address: Address) => {
    setForm(addressToShipping(address));
    setErrors({});
  };

  const setField = (field: keyof ShippingInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Remove this field's error as soon as the person starts fixing it
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePlaceOrder = async () => {
    if (placing || !user) return; // ignore double taps

    const validationErrors = validateShipping(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError('Please fix the highlighted fields.');
      return;
    }

    setPlacing(true);
    setSubmitError(null);
    try {
      // 1. Send the order to DummyJSON. If this fails we stop and keep the cart.
      await productApi.addCart({
        userId: user.id,
        products: items.map((i) => ({ id: i.productId, quantity: i.quantity })),
      });

      // 2. Save it on the device so it appears in Order History
      const order = buildOrder({ userId: user.id, owner: user.username, items, shipping: form, paymentMethod });
      try {
        await orderStorage.addOrder(order);
      } catch (storageError) {
        console.error('Failed to save order:', storageError);
      }

      // 3. Empty the cart and show the confirmation
      clearCart();
      setPlacedOrder(order);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? `Could not place your order: ${err.message}` : 'Could not place your order.'
      );
    } finally {
      setPlacing(false);
    }
  };

  // ---------- Confirmation ----------
  if (placedOrder) {
    return (
      <View style={styles.screen}>
        <View style={styles.confirmation}>
          <MaterialCommunityIcons name="check-circle" size={96} color="#188038" />
          <Text style={styles.confirmTitle}>Order placed!</Text>
          <Text style={styles.confirmText}>
            Thank you, {placedOrder.shipping?.fullName}. Your order {getOrderNumber(placedOrder)} is being
            processed.
          </Text>
          <Text style={styles.confirmTotal}>Total: ${placedOrder.discountedTotal.toFixed(2)}</Text>
          <Text style={styles.confirmText}>
            Delivering to {placedOrder.shipping?.address}, {placedOrder.shipping?.city}
          </Text>
          <Button
            mode="contained"
            style={styles.confirmButton}
            onPress={() => router.replace(`/(app)/order/${placedOrder.id}`)}
          >
            View order
          </Button>
          <Button mode="outlined" style={styles.confirmButton} onPress={() => router.replace('/(app)/(tabs)/home')}>
            Continue shopping
          </Button>
        </View>
      </View>
    );
  }

  // ---------- Empty cart ----------
  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Checkout" />
        <View style={styles.confirmation}>
          <MaterialCommunityIcons name="cart-outline" size={80} color="#DADCE0" />
          <Text style={styles.confirmTitle}>Your cart is empty</Text>
          <Button mode="contained" style={styles.confirmButton} onPress={() => router.replace('/(app)/(tabs)/home')}>
            Continue shopping
          </Button>
        </View>
      </View>
    );
  }

  // ---------- Form ----------
  const renderField = (
    field: keyof ShippingInfo,
    label: string,
    options: { keyboardType?: 'default' | 'phone-pad' | 'number-pad'; autoComplete?: 'name' | 'tel' | 'postal-code' | 'street-address' } = {}
  ) => (
    <View style={styles.field}>
      <TextInput
        mode="outlined"
        label={label}
        value={form[field]}
        onChangeText={(text) => setField(field, text)}
        error={!!errors[field]}
        keyboardType={options.keyboardType}
        autoComplete={options.autoComplete}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors[field]}>
        {errors[field] ?? ''}
      </HelperText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Checkout" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Shipping */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping address</Text>
            {savedAddresses.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {savedAddresses.map((address) => (
                  <Chip
                    key={address.id}
                    icon="map-marker"
                    style={styles.chip}
                    onPress={() => applySavedAddress(address)}
                  >
                    {address.label}
                  </Chip>
                ))}
              </ScrollView>
            ) : null}
            {renderField('fullName', 'Full name', { autoComplete: 'name' })}
            {renderField('phone', 'Phone number', { keyboardType: 'phone-pad', autoComplete: 'tel' })}
            {renderField('address', 'Street address', { autoComplete: 'street-address' })}
            {renderField('city', 'City')}
            {renderField('postalCode', 'Postal code', { keyboardType: 'number-pad', autoComplete: 'postal-code' })}
          </View>

          {/* Payment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            <RadioButton.Group value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              {PAYMENT_METHODS.map((method) => (
                <RadioButton.Item
                  key={method.value}
                  value={method.value}
                  label={`${method.label} - ${method.description}`}
                  labelStyle={styles.radioLabel}
                />
              ))}
            </RadioButton.Group>
          </View>

          {/* Order summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order summary ({totalQuantity} items)</Text>
            {items.map((item) => (
              <View key={item.productId} style={styles.summaryItem}>
                <Image source={{ uri: item.thumbnail }} style={styles.summaryImage} resizeMode="contain" />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.muted}>
                    {item.quantity} x ${getDiscountedPrice(item).toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.summaryLine}>${(getDiscountedPrice(item) * item.quantity).toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.muted}>Subtotal</Text>
              <Text style={styles.muted}>${total.toFixed(2)}</Text>
            </View>
            {total !== discountedTotal && (
              <View style={styles.totalRow}>
                <Text style={styles.muted}>Discount</Text>
                <Text style={styles.discount}>-${(total - discountedTotal).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.muted}>Shipping</Text>
              <Text style={styles.muted}>Free</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotal}>Total</Text>
              <Text style={styles.grandTotal}>${discountedTotal.toFixed(2)}</Text>
            </View>
          </View>

          {submitError && <Text style={styles.submitError}>{submitError}</Text>}

          <Button
            mode="contained"
            onPress={handlePlaceOrder}
            loading={placing}
            disabled={placing}
            style={styles.placeButton}
            contentStyle={styles.placeButtonContent}
          >
            {placing ? 'Placing order...' : `Place order - $${discountedTotal.toFixed(2)}`}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  section: { backgroundColor: '#FFFFFF', marginTop: 10, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#202124', marginBottom: 8 },
  field: { marginBottom: 0 },
  input: { backgroundColor: '#FFFFFF' },
  radioLabel: { fontSize: 14 },
  chipRow: { marginBottom: 12 },
  chip: { marginRight: 8 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  summaryImage: { width: 48, height: 48, borderRadius: 6, backgroundColor: '#F1F3F4' },
  summaryInfo: { flex: 1 },
  summaryTitle: { fontSize: 14, fontWeight: '600', color: '#202124' },
  summaryLine: { fontSize: 14, fontWeight: '600', color: '#202124' },
  muted: { fontSize: 13, color: '#5F6368' },
  discount: { fontSize: 13, color: '#188038' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  grandTotalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E0E0E0', marginTop: 8, paddingTop: 10 },
  grandTotal: { fontSize: 18, fontWeight: '700', color: '#1A73E8' },
  submitError: { color: '#EA4335', textAlign: 'center', marginTop: 12, paddingHorizontal: 16 },
  placeButton: { margin: 16, borderRadius: 8 },
  placeButtonContent: { paddingVertical: 6 },
  confirmation: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  confirmTitle: { fontSize: 26, fontWeight: '700', color: '#202124', marginTop: 8 },
  confirmText: { fontSize: 15, color: '#5F6368', textAlign: 'center' },
  confirmTotal: { fontSize: 20, fontWeight: '700', color: '#1A73E8' },
  confirmButton: { alignSelf: 'stretch', maxWidth: 360, width: '100%', marginTop: 6 },
});