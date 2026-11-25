import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import PhilippineAddressFields, { PhilippineAddressValue } from '@/components/PhilippineAddressFields';
import { addressesStorage, DeliveryAddress, formatDeliveryAddress, ordersStorage } from '@/utils/marketplaceStorage';
import CouponEntry from '@/components/CouponEntry';
import { marketplaceColors } from '@/constants/theme';
import { calculateCouponDiscount } from '@/utils/coupons';
import { validateDeliveryDetails } from '@/utils/checkoutValidation';
import { showAlert } from '@/utils/platformAlert';

const brandPurple = '#75648A';
type PaymentMethod = 'cash' | 'demo-card';

export default function CheckoutScreen() {
  const router = useRouter();
  const { selectedItemIds: selectedItemIdsParam } = useLocalSearchParams<{ selectedItemIds?: string }>();
  const { user } = useAuth();
  const checkoutRoute = selectedItemIdsParam
    ? `/(app)/checkout?selectedItemIds=${encodeURIComponent(selectedItemIdsParam)}`
    : '/(app)/checkout';
  const {
    items,
    appliedCoupon,
    removeItems,
  } = useCart();
  const selectedProductIds = selectedItemIdsParam === undefined
    ? null
    : new Set(
        selectedItemIdsParam
          .split(',')
          .map(Number)
          .filter((productId) => Number.isInteger(productId) && productId > 0)
      );
  const orderItems = selectedProductIds
    ? items.filter((item) => selectedProductIds.has(item.productId))
    : items;
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedTotal = orderItems.reduce(
    (sum, item) => sum + item.price * (1 - item.discountPercentage / 100) * item.quantity,
    0
  );
  const couponDiscount = calculateCouponDiscount(appliedCoupon, discountedTotal);
  const totalAfterCoupon = Number((discountedTotal - couponDiscount).toFixed(2));
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const [recipient, setRecipient] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState<PhilippineAddressValue>({
    regionCode: '',
    region: '',
    provinceCode: '',
    province: '',
    cityCode: '',
    city: '',
    barangayCode: '',
    barangay: '',
  });
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showDeliveryErrors, setShowDeliveryErrors] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const deliveryFieldErrors = validateDeliveryDetails({
    recipient,
    phone,
    address,
    region: locality.region,
    barangay: locality.barangay,
    city: locality.city,
    postalCode,
  });

  useEffect(() => {
    if (!user?.id) {
      router.replace({
        pathname: '/(auth)/login',
        params: { redirect: checkoutRoute },
      });
    }
  }, [checkoutRoute, router, user?.id]);

  useEffect(() => {
    addressesStorage.getAll()
      .then((saved) => {
        setSavedAddresses(saved);
        const savedAddress = saved[0];
        if (savedAddress) {
          setRecipient(savedAddress.recipient);
          setPhone(savedAddress.phone);
          setAddress(savedAddress.street);
          setLocality({
            regionCode: savedAddress.regionCode ?? '',
            region: savedAddress.region ?? '',
            provinceCode: savedAddress.provinceCode ?? '',
            province: savedAddress.province ?? '',
            cityCode: savedAddress.cityCode ?? '',
            city: savedAddress.city,
            barangayCode: savedAddress.barangayCode ?? '',
            barangay: savedAddress.barangay ?? '',
          });
          setPostalCode(savedAddress.postalCode);
        }
      })
      .catch((error: unknown) => {
        showAlert('Could not load saved addresses', error instanceof Error ? error.message : 'Please try again.');
      });
  }, []);

  const submitOrder = async () => {
    if (placingOrder) return;
    if (items.length === 0) {
      showAlert('Your cart is empty', 'Add a product before checking out.');
      router.replace('/(app)/(tabs)/home');
      return;
    }
    if (orderItems.length === 0) {
      showAlert('No products selected', 'Choose at least one product from your cart to continue.');
      router.replace('/(app)/(tabs)/cart');
      return;
    }
    const deliveryErrors = validateDeliveryDetails({
      recipient,
      phone,
      address,
      region: locality.region,
      barangay: locality.barangay,
      city: locality.city,
      postalCode,
    });
    if (Object.keys(deliveryErrors).length > 0) {
      setShowDeliveryErrors(true);
      showAlert('Shipping details required', Object.values(deliveryErrors).join('\n'));
      return;
    }
    if (!user?.id) {
      router.replace({
        pathname: '/(auth)/login',
        params: { redirect: checkoutRoute },
      });
      return;
    }

    setPlacingOrder(true);
    try {
      const orderId = `KT-${Date.now()}`;
      const deliveryAddress: DeliveryAddress = {
        id: savedAddresses[0]?.id ?? `address-${Date.now()}`,
        recipient: recipient.trim(),
        phone: phone.trim(),
        street: address.trim(),
        ...locality,
        city: locality.city.trim(),
        postalCode: postalCode.trim(),
        isDefault: true,
      };
      await addressesStorage.save(deliveryAddress);
      await ordersStorage.add({
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'Processing',
        items: [...orderItems],
        subtotal,
        total: totalAfterCoupon,
        shippingAddress: deliveryAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        couponDiscount,
      });
      await removeItems(orderItems.map((item) => item.productId));
      router.replace({
        pathname: '/(app)/order-confirmation',
        params: {
          orderId,
          total: totalAfterCoupon.toFixed(2),
          itemCount: String(totalQuantity),
          recipient: recipient.trim(),
          payment: paymentMethod,
          couponCode: appliedCoupon?.code,
          couponDiscount: couponDiscount.toFixed(2),
        },
      });
    } catch (error) {
      showAlert(
        'Could not place order',
        error instanceof Error ? error.message : 'We could not place your order. Please try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const placeOrder = () => {
    if (placingOrder) return;
    const deliveryErrors = validateDeliveryDetails({
      recipient,
      phone,
      address,
      region: locality.region,
      barangay: locality.barangay,
      city: locality.city,
      postalCode,
    });
    if (Object.keys(deliveryErrors).length > 0) {
      setShowDeliveryErrors(true);
      showAlert('Shipping details required', Object.values(deliveryErrors).join('\n'));
      return;
    }

    const deliveryAddress: DeliveryAddress = {
      id: savedAddresses[0]?.id ?? 'delivery-address',
      recipient: recipient.trim(),
      phone: phone.trim(),
      street: address.trim(),
      ...locality,
      city: locality.city.trim(),
      postalCode: postalCode.trim(),
      isDefault: true,
    };
    showAlert(
      'Confirm delivery address',
      `${deliveryAddress.recipient}\n${deliveryAddress.phone}\n${formatDeliveryAddress(deliveryAddress)}\n\nConfirm this address to place your order. Delivery details can't be edited after placing.\n\nYou have 12 hours from placing this order to cancel it before delivery.`,
      [
        { text: 'Edit address', style: 'cancel' },
        { text: 'Confirm and place order', onPress: () => void submitOrder() },
      ]
    );
  };

  if (orderItems.length === 0) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>
          {items.length === 0 ? 'Nothing to check out yet' : 'No products selected'}
        </Text>
        <Button
          mode="contained"
          buttonColor={brandPurple}
          onPress={() => router.replace(items.length === 0 ? '/(app)/(tabs)/home' : '/(app)/(tabs)/cart')}
        >
          {items.length === 0 ? 'Browse products' : 'Return to cart'}
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          accessibilityLabel="Back to cart"
          style={styles.backButton}
          iconColor={brandPurple}
        />
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">Checkout</Text>
          <Text style={styles.headerSubtitle}>Review your order and delivery details</Text>
        </View>
      </View>

      <Card style={styles.card} mode="contained">
        <Card.Content>
          <View style={styles.sectionHeading}>
            <MaterialCommunityIcons name="map-marker" size={22} color={brandPurple} />
            <Text style={styles.sectionTitle}>Delivery address</Text>
          </View>
          <Text style={styles.hint}>
            {savedAddresses.length > 0
              ? 'Your one saved delivery address is prefilled. Review or update it before placing the order.'
              : 'You can save one delivery address for future orders.'}
          </Text>
          <TextInput
            label="Recipient name"
            mode="outlined"
            value={recipient}
            onChangeText={setRecipient}
            style={styles.input}
            accessibilityLabel="Recipient name"
            accessibilityHint="Required"
            error={showDeliveryErrors && Boolean(deliveryFieldErrors.recipient)}
            returnKeyType="next"
          />
          {showDeliveryErrors && deliveryFieldErrors.recipient && (
            <Text style={styles.fieldError} accessibilityRole="alert">
              {deliveryFieldErrors.recipient}
            </Text>
          )}
          <TextInput
            label="Phone number"
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            accessibilityLabel="Phone number"
            accessibilityHint="Required"
            error={showDeliveryErrors && Boolean(deliveryFieldErrors.phone)}
            returnKeyType="next"
          />
          {showDeliveryErrors && deliveryFieldErrors.phone && (
            <Text style={styles.fieldError} accessibilityRole="alert">
              {deliveryFieldErrors.phone}
            </Text>
          )}
          <TextInput
            label="Street address"
            mode="outlined"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            accessibilityLabel="Street address"
            accessibilityHint="Required"
            error={showDeliveryErrors && Boolean(deliveryFieldErrors.address)}
            returnKeyType="next"
          />
          {showDeliveryErrors && deliveryFieldErrors.address && (
            <Text style={styles.fieldError} accessibilityRole="alert">
              {deliveryFieldErrors.address}
            </Text>
          )}
          <PhilippineAddressFields
            value={locality}
            onChange={setLocality}
            error={showDeliveryErrors}
          />
          {showDeliveryErrors && deliveryFieldErrors.city && (
            <Text style={styles.fieldError} accessibilityRole="alert">
              {deliveryFieldErrors.city}
            </Text>
          )}
          <TextInput
            label="Postal code"
            mode="outlined"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
            style={styles.input}
            accessibilityLabel="Postal code"
            accessibilityHint="Required"
            error={showDeliveryErrors && Boolean(deliveryFieldErrors.postalCode)}
            returnKeyType="done"
          />
          {showDeliveryErrors && deliveryFieldErrors.postalCode && (
            <Text style={styles.fieldError} accessibilityRole="alert">
              {deliveryFieldErrors.postalCode}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="contained">
        <Card.Content>
          <View style={styles.sectionHeading}>
            <MaterialCommunityIcons name="credit-card-outline" size={22} color={brandPurple} />
            <Text style={styles.sectionTitle}>Payment method</Text>
          </View>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('cash')}
            accessibilityRole="radio"
            accessibilityLabel="Cash on delivery"
            accessibilityHint="Pay when your order arrives"
            accessibilityState={{ checked: paymentMethod === 'cash' }}
          >
            <MaterialCommunityIcons name="cash" size={22} color={brandPurple} />
            <View style={styles.paymentText}>
              <Text style={styles.paymentTitle}>Cash on delivery</Text>
              <Text style={styles.hint}>Pay when your order arrives</Text>
            </View>
            <MaterialCommunityIcons
              name={paymentMethod === 'cash' ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={brandPurple}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'demo-card' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('demo-card')}
            accessibilityRole="radio"
            accessibilityLabel="Demo card"
            accessibilityHint="Simulation only; no payment is charged"
            accessibilityState={{ checked: paymentMethod === 'demo-card' }}
          >
            <MaterialCommunityIcons name="credit-card" size={22} color={brandPurple} />
            <View style={styles.paymentText}>
              <Text style={styles.paymentTitle}>Demo card</Text>
              <Text style={styles.hint}>Simulation only; no payment is charged</Text>
            </View>
            <MaterialCommunityIcons
              name={paymentMethod === 'demo-card' ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={brandPurple}
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
          {appliedCoupon && couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.hint}>Coupon ({appliedCoupon.code})</Text>
              <Text style={styles.savings}>-${couponDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.hint}>Shipping</Text>
            <Text style={styles.savings}>FREE</Text>
          </View>
          <CouponEntry discountAmount={couponDiscount} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>${totalAfterCoupon.toFixed(2)}</Text>
          </View>
          <Button
            mode="contained"
            buttonColor={brandPurple}
            onPress={placeOrder}
            loading={placingOrder}
            disabled={placingOrder}
            accessibilityLabel={placingOrder ? 'Placing order' : 'Place order'}
            accessibilityState={{ disabled: placingOrder, busy: placingOrder }}
            style={styles.placeOrder}
          >
            Place order
          </Button>
          <Button
            mode="outlined"
            textColor="#75648A"
            onPress={() => showAlert(
              'Cancel checkout?',
              'Your items will stay in your cart. You can come back any time.',
              [
                { text: 'Keep checking out', style: 'cancel' },
                { text: 'Return to cart', onPress: () => router.replace('/(app)/(tabs)/cart') },
              ]
            )}
            disabled={placingOrder}
            style={styles.cancelCheckout}
          >
            Cancel checkout
          </Button>
          <Text style={styles.disclaimer}>
            Demo orders and delivery details are stored on this device. No real payment or delivery is processed.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.background },
  keyboardAvoiding: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 14, paddingBottom: 28 },
  header: { flexDirection: 'row' as const, alignItems: 'center', marginBottom: 14 },
  backButton: { margin: 0, marginRight: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: marketplaceColors.border, borderRadius: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 23, fontWeight: '800' as const, color: '#30283A' },
  headerSubtitle: { color: '#746C7A', fontSize: 12, marginTop: 2 },
  card: { backgroundColor: '#FFF', marginBottom: 14, borderRadius: 16, borderWidth: 1, borderColor: marketplaceColors.border },
  sectionHeading: { flexDirection: 'row' as const, alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#222', fontSize: 17, fontWeight: '700' as const },
  input: { marginBottom: 10, backgroundColor: '#FFF', borderRadius: 12 },
  fieldError: { color: '#B4233C', fontSize: 12, marginTop: -6, marginBottom: 8, marginLeft: 12 },
  paymentOption: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, padding: 14, borderWidth: 1, borderColor: marketplaceColors.border, borderRadius: 12, marginTop: 8 },
  paymentSelected: { borderColor: brandPurple, backgroundColor: marketplaceColors.primarySoft },
  paymentText: { flex: 1 },
  paymentTitle: { color: '#333', fontWeight: '600' as const },
  hint: { color: '#777', fontSize: 13 },
  summaryRow: { flexDirection: 'row' as const, justifyContent: 'space-between', paddingVertical: 8 },
  summaryValue: { color: '#333' },
  savings: { color: '#179B62', fontWeight: '600' as const },
  totalLabel: { color: '#222', fontWeight: '700' as const, fontSize: 16 },
  total: { color: brandPurple, fontWeight: '800' as const, fontSize: 20 },
  placeOrder: { marginTop: 14, borderRadius: 12, paddingVertical: 3 },
  cancelCheckout: { marginTop: 8, borderRadius: 12 },
  disclaimer: { color: '#888', fontSize: 11, lineHeight: 16, marginTop: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: marketplaceColors.background },
  emptyTitle: { color: '#222', fontSize: 19, fontWeight: '700' as const },
});
