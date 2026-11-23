/**
 * Checkout Screen
 * Validates shipping details, places the order with POST /carts/add,
 * saves it locally for order history, clears the cart and shows a confirmation.
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, HelperText, RadioButton, Snackbar, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { EmptyState } from '@/components/CommonComponents';
import { productApi } from '@/services/productApi';
import { ordersStorage } from '@/utils/storage';
import { hasErrors, validateShipping, ShippingErrors } from '@/utils/validation';
import type { Order, PaymentMethod, ShippingDetails } from '@/types/order';
import { styles } from './checkoutStyles';

const EMPTY_FORM: ShippingDetails = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
};

interface FieldConfig {
  key: keyof ShippingDetails;
  label: string;
  keyboardType?: 'default' | 'phone-pad';
}

const FIELDS: FieldConfig[] = [
  { key: 'fullName', label: 'Full name' },
  { key: 'phone', label: 'Phone number', keyboardType: 'phone-pad' },
  { key: 'address', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'postalCode', label: 'Postal code' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();

  const [form, setForm] = useState<ShippingDetails>({
    ...EMPTY_FORM,
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
  });
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const handleChange = (key: keyof ShippingDetails, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handlePlaceOrder = async () => {
    const found = validateShipping(form);
    setErrors(found);
    if (hasErrors(found) || !user || items.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const cart = await productApi.addCart({
        userId: user.id,
        products: items.map((i) => ({ id: i.productId, quantity: i.quantity })),
      });

      const order: Order = {
        id: `ORD-${cart.id}-${Date.now().toString(36).toUpperCase()}`,
        cartId: cart.id,
        userId: user.id,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          thumbnail: i.thumbnail,
          price: i.price,
          discountPercentage: i.discountPercentage,
          quantity: i.quantity,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        totalQuantity: totals.totalQuantity,
        shipping: { ...form },
        paymentMethod: payment,
      };

      await ordersStorage.add(order);
      clearCart();
      setPlacedOrder(order);
    } catch {
      setSubmitError('We could not place your order. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation state
  if (placedOrder) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="check-circle" size={88} color="#34A853" />
        <Text style={styles.confirmTitle}>Order placed!</Text>
        <Text style={styles.confirmText}>
          Thank you, {placedOrder.shipping.fullName}. We will deliver to {placedOrder.shipping.city}.
        </Text>
        <Text style={styles.confirmId}>{placedOrder.id}</Text>
        <Text style={styles.confirmText}>Total paid: ${placedOrder.total.toFixed(2)}</Text>
        <Button
          mode="contained"
          style={styles.confirmButton}
          onPress={() => router.replace('/(app)/orders')}
        >
          View my orders
        </Button>
        <Button
          mode="outlined"
          style={styles.confirmButton}
          onPress={() => router.replace('/(app)/(tabs)/home')}
        >
          Continue shopping
        </Button>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.flex}>
        <EmptyState
          icon="cart-outline"
          title="Nothing to check out"
          message="Your cart is empty"
          actionLabel="Browse products"
          onAction={() => router.replace('/(app)/(tabs)/home')}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Shipping details</Text>
        {FIELDS.map(({ key, label, keyboardType }) => (
          <View key={key} style={styles.fieldGap}>
            <TextInput
              label={label}
              mode="outlined"
              value={form[key]}
              onChangeText={(value) => handleChange(key, value)}
              keyboardType={keyboardType ?? 'default'}
              error={Boolean(errors[key])}
              style={styles.input}
            />
            <HelperText type="error" visible={Boolean(errors[key])}>
              {errors[key] ?? ''}
            </HelperText>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Payment method</Text>
        <RadioButton.Group onValueChange={(v) => setPayment(v as PaymentMethod)} value={payment}>
          <View style={styles.paymentRow}>
            <RadioButton value="cod" />
            <Text style={styles.paymentLabel}>Cash on delivery</Text>
          </View>
          <View style={[styles.paymentRow, { marginTop: 8 }]}>
            <RadioButton value="card" />
            <Text style={styles.paymentLabel}>Credit / debit card (pay on delivery terminal)</Text>
          </View>
        </RadioButton.Group>

        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({totals.totalQuantity})</Text>
            <Text style={styles.summaryValue}>${totals.subtotal.toFixed(2)}</Text>
          </View>
          {totals.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.discountValue}>-${totals.discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totals.total.toFixed(2)}</Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
          contentStyle={styles.submitContent}
        >
          Place order
        </Button>
      </ScrollView>

      <Snackbar
        visible={submitError !== null}
        onDismiss={() => setSubmitError(null)}
        duration={5000}
        action={{ label: 'Retry', onPress: handlePlaceOrder }}
      >
        {submitError ?? ''}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}
