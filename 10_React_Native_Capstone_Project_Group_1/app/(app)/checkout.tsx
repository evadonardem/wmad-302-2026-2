/**
 * Checkout Screen
 * Shipping details (saved address or new) + payment method + order summary.
 * Placing an order calls POST /carts/add, stores the order locally and shows a
 * confirmation state.
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, Checkbox, HelperText, RadioButton, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useOrdersContext } from '@/context/OrdersContext';
import { useAddresses } from '@/context/AddressContext';
import { productApi } from '@/services/productApi';
import { Order, PaymentMethod, ShippingInfo } from '@/types/order';
import { AddressInput } from '@/types/user';
import { EmptyState } from '@/components/CommonComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { FieldErrors, hasErrors, validateAddress } from '@/utils/validators';
import { createLocalOrder } from '@/utils/orders';
import { formatCurrency, getDiscountedPrice } from '@/utils/pricing';
import { getErrorMessage } from '@/utils/errors';

const NEW_ADDRESS = 'new';

export default function CheckoutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();
  const { addOrder } = useOrdersContext();
  const { addresses, defaultAddress, addAddress } = useAddresses();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>({
    label: 'Home',
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone ?? '',
    line1: '',
    city: '',
    postalCode: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState<FieldErrors<AddressInput>>({});
  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Saved address chosen by the user, else the default one, else the "new address" form
  const effectiveId = selectedId ?? defaultAddress?.id ?? NEW_ADDRESS;
  const selectedAddress = addresses.find((a) => a.id === effectiveId) ?? null;
  const usingNewAddress = effectiveId === NEW_ADDRESS || selectedAddress === null;

  const setField = (field: keyof AddressInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePlaceOrder = async () => {
    if (!user || placing) return;

    let shipping: ShippingInfo;
    if (usingNewAddress) {
      const validation = validateAddress(form);
      setErrors(validation);
      if (hasErrors(validation)) return;
      shipping = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
      };
    } else if (selectedAddress) {
      shipping = {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        line1: selectedAddress.line1,
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode,
      };
    } else {
      return;
    }

    setPlacing(true);
    setSubmitError(null);
    try {
      // POST /carts/add - DummyJSON simulates the order and returns a cart id
      const cart = await productApi.placeOrder(
        user.id,
        items.map((i) => ({ id: i.productId, quantity: i.quantity }))
      );

      const order = createLocalOrder({
        userId: user.id,
        cartId: cart.id,
        items,
        totals,
        shipping,
        paymentMethod,
      });
      addOrder(order);
      if (usingNewAddress && saveAddress) addAddress({ ...form, ...shipping });
      clearCart();
      setPlacedOrder(order);
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'We could not place your order. Please try again.'));
    } finally {
      setPlacing(false);
    }
  };

  // ---- Confirmation state
  if (placedOrder) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <View style={styles.confirmation}>
          <View style={[styles.checkCircle, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <MaterialCommunityIcons name="check-circle" size={72} color={theme.colors.tertiary} />
          </View>
          <Text style={[styles.confirmTitle, { color: theme.colors.onSurface }]}>Order placed! 🎁</Text>
          <Text style={[styles.confirmText, { color: theme.colors.onSurfaceVariant }]}>
            Thank you for your purchase. Your order {placedOrder.id} is being processed.
          </Text>
          <Text style={[styles.confirmTotal, { color: theme.colors.primary }]}>
            {formatCurrency(placedOrder.discountedTotal)}
          </Text>
          <Button
            mode="contained"
            style={styles.confirmButton}
            onPress={() => router.replace(`/(app)/orders/${placedOrder.id}`)}
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

  if (items.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="cart-outline"
          title="Nothing to check out"
          message="Your cart is empty."
          actionLabel="Browse products"
          onAction={() => router.replace('/(app)/(tabs)/home')}
        />
      </View>
    );
  }

  const field = (
    key: keyof AddressInput & ('fullName' | 'phone' | 'line1' | 'city' | 'postalCode'),
    label: string,
    extra?: { keyboardType?: 'phone-pad' | 'default'; autoComplete?: 'name' | 'tel' | 'street-address' | 'postal-code' }
  ) => (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={form[key]}
        onChangeText={(value) => setField(key, value)}
        error={!!errors[key]}
        keyboardType={extra?.keyboardType}
        autoComplete={extra?.autoComplete}
        disabled={placing}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors[key]}>
        {errors[key] ?? ''}
      </HelperText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <Banner visible={submitError !== null} icon="alert-circle-outline" style={styles.banner}>
            {submitError ?? ''}
          </Banner>

          {/* Shipping */}
          <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Shipping address</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {addresses.length > 0 && (
              <RadioButton.Group onValueChange={setSelectedId} value={effectiveId}>
                {addresses.map((a) => (
                  <RadioButton.Item
                    key={a.id}
                    value={a.id}
                    position="leading"
                    labelStyle={styles.radioLabel}
                    label={`${a.label}${a.isDefault ? ' (default)' : ''} - ${a.fullName}\n${a.line1}, ${a.city} ${a.postalCode}`}
                  />
                ))}
                <RadioButton.Item value={NEW_ADDRESS} position="leading" label="Use a new address" />
              </RadioButton.Group>
            )}

            {usingNewAddress && (
              <View style={addresses.length > 0 ? styles.newAddress : undefined}>
                {field('fullName', 'Full name', { autoComplete: 'name' })}
                {field('phone', 'Phone number', { keyboardType: 'phone-pad', autoComplete: 'tel' })}
                {field('line1', 'Street address', { autoComplete: 'street-address' })}
                {field('city', 'City')}
                {field('postalCode', 'Postal code', { autoComplete: 'postal-code' })}
                <Checkbox.Item
                  label="Save this address for next time"
                  status={saveAddress ? 'checked' : 'unchecked'}
                  onPress={() => setSaveAddress((v) => !v)}
                  position="leading"
                  labelStyle={styles.radioLabel}
                />
              </View>
            )}
          </View>

          {/* Payment */}
          <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Payment method</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <RadioButton.Group onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} value={paymentMethod}>
              <RadioButton.Item value="cod" position="leading" label="Cash on delivery" labelStyle={styles.radioLabel} />
              <RadioButton.Item
                value="card"
                position="leading"
                label="Card on delivery (demo - no card details needed)"
                labelStyle={styles.radioLabel}
              />
            </RadioButton.Group>
          </View>

          {/* Summary */}
          <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Order summary</Text>
          <View style={[styles.card, styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            {items.map((item) => (
              <View key={item.productId} style={styles.summaryRow}>
                <Text style={[styles.summaryItem, { color: theme.colors.onSurface }]} numberOfLines={1}>
                  {item.quantity} × {item.title}
                </Text>
                <Text style={{ color: theme.colors.onSurface }}>
                  {formatCurrency(getDiscountedPrice(item.price, item.discountPercentage) * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal</Text>
              <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(totals.subtotal)}</Text>
            </View>
            {totals.savings > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Discount</Text>
                <Text style={{ color: theme.colors.tertiary }}>-{formatCurrency(totals.savings)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total</Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                {formatCurrency(totals.discountedTotal)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        <Button
          mode="contained"
          icon="check"
          loading={placing}
          disabled={placing}
          onPress={handlePlaceOrder}
          style={styles.placeButton}
          contentStyle={styles.placeContent}
        >
          {placing ? 'Placing order...' : `Place order · ${formatCurrency(totals.discountedTotal)}`}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  banner: { marginBottom: spacing.md },
  heading: { fontSize: 17, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  card: { borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  newAddress: { marginTop: spacing.sm, paddingHorizontal: spacing.sm },
  input: { backgroundColor: 'transparent' },
  radioLabel: { textAlign: 'left', fontSize: 14 },
  summaryCard: { padding: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.md },
  summaryItem: { flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.sm },
  totalLabel: { fontSize: 17, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '800' },
  bottomBar: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.md, paddingHorizontal: spacing.lg },
  placeButton: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  placeContent: { paddingVertical: spacing.xs },
  confirmation: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  checkCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontSize: 26, fontWeight: '800', marginTop: spacing.lg },
  confirmText: { fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
  confirmTotal: { fontSize: 24, fontWeight: '800', marginVertical: spacing.lg },
  confirmButton: { width: '100%', maxWidth: 320, marginTop: spacing.sm },
});