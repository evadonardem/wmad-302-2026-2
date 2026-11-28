import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Title, Button, IconButton, TextInput, Dialog, Portal, Snackbar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { Cart, CartItem } from '@/types/product';
import { styles as baseStyles } from './cartStyles';
import { getCoupon, Coupon } from '@/constants/coupons';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { sendLocalNotification } from '@/services/localNotifications';
import { getThemedStyles } from '@/utils/themeStyles';
import { createOrderTracking } from '@/services/orderTracking';

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { items, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const { t, colorMode } = useAppPreferences();
  const styles = getThemedStyles(baseStyles, colorMode === 'dark');
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState<string | null>(null);
  const [removeProductId, setRemoveProductId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const totals = useMemo(() => items.reduce(
    (result, item) => ({
      subtotal: result.subtotal + item.price * item.quantity,
      total: result.total + item.price * (1 - item.discountPercentage / 100) * item.quantity,
    }),
    { subtotal: 0, total: 0 }
  ), [items]);
  const couponDiscount = coupon ? totals.total * coupon.discountPercentage / 100 : 0;
  const checkoutTotal = totals.total - couponDiscount;

  React.useEffect(() => {
    if (coupon && !getCoupon(coupon.code, totals.subtotal)) {
      setCoupon(null);
      setCouponError(t('invalidCoupon'));
    }
  }, [coupon, totals.subtotal, t]);

  const applyCoupon = () => {
    const nextCoupon = getCoupon(couponCode, totals.subtotal);
    if (!nextCoupon) {
      setCoupon(null);
      setCouponError(t('invalidCoupon'));
      return;
    }
    setCoupon(nextCoupon);
    setCouponCode(nextCoupon.code);
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    if (!shippingName.trim() || !shippingAddress.trim()) {
      setCheckoutError('Enter a recipient name and delivery address to continue.');
      return;
    }

    setCheckoutError(null);
    setPlacingOrder(true);
    try {
      const order = await productApi.addCart({
        userId: user.id,
        products: items.map((item) => ({ id: item.productId, quantity: item.quantity })),
      });
      const trackedOrder: Cart = {
        ...order,
        deliveryTracking: createOrderTracking(user.id, order.id),
      };
      const ordersKey = `marketplace_orders_${user.id}`;
      let historyWarning = '';
      try {
        const savedOrders = await AsyncStorage.getItem(ordersKey);
        const previousOrders: Cart[] = savedOrders ? JSON.parse(savedOrders) as Cart[] : [];
        await AsyncStorage.setItem(ordersKey, JSON.stringify([trackedOrder, ...previousOrders]));
      } catch (storageError) {
        console.error('Order placed but could not be saved to local order history:', storageError);
        historyWarning = ' Your order history could not be saved on this device.';
      }
      try {
        const savedSettings = await AsyncStorage.getItem(`marketplace_settings_${user.id}`);
        const orderUpdates = savedSettings ? (JSON.parse(savedSettings) as { orderUpdates?: boolean }).orderUpdates : false;
        if (orderUpdates) {
          await sendLocalNotification(t('Order confirmed'), `${t('Order')} #${order.id}: ${t('Your order has been placed.')}`);
        }
      } catch (notificationError) {
        console.error('Order placed but notification could not be sent:', notificationError);
        historyWarning += ' Your order notification could not be sent.';
      }
      clearCart();
      setCheckoutVisible(false);
      setOrderConfirmation(
        `Order #${order.id} was placed successfully. Tracking #${trackedOrder.deliveryTracking?.trackingNumber}. Total: $${checkoutTotal.toFixed(2)}.${historyWarning}`
      );
      setShippingName('');
      setShippingAddress('');
      setCoupon(null);
      setCouponCode('');
    } catch (error) {
      console.error('Checkout failed:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const confirmRemove = (productId: number) => {
    setRemoveProductId(productId);
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.thumbnail }} style={styles.itemImage} resizeMode="contain" />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.itemPriceRow}>
            <Text style={styles.itemCurrentPrice}>${discountedPrice.toFixed(2)}</Text>
            {item.discountPercentage > 0 && (
              <Text style={styles.itemOriginalPrice}>${item.price.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.quantityControls}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
              accessibilityLabel="Decrease quantity"
            />
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => {
                if (!updateQuantity(item.productId, item.quantity + 1)) {
                  setCartNotice(`Only ${item.stock} items are available.`);
                }
              }}
              disabled={item.quantity >= item.stock}
              accessibilityLabel="Increase quantity"
            />
          </View>
        </View>
        <IconButton
          icon="delete-outline"
          size={24}
          iconColor="#EA4335"
          onPress={() => confirmRemove(item.productId)}
          accessibilityLabel="Remove item"
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66BB6A" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cart-outline" size={80} color="#DADCE0" />
          <Text style={styles.emptyTitle}>{t('Your Cart is Empty')}</Text>
          <Text style={styles.emptyText}>{t('Add some products to get started')}</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(app)/(tabs)/home')}
            style={styles.browseButton}
            contentStyle={styles.buttonContent}
          >
            {t('Continue Shopping')}
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.productId.toString()}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              <View style={styles.header}>
                <Title style={styles.headerTitle}>{t('Shopping Cart')} ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</Title>
              </View>
            }
          />
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('Subtotal')}</Text>
              <Text style={styles.summaryValue}>${totals.subtotal.toFixed(2)}</Text>
            </View>
            {totals.subtotal > totals.total && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('Discount')}</Text>
                <Text style={styles.discountValue}>-${(totals.subtotal - totals.total).toFixed(2)}</Text>
              </View>
            )}
            {coupon && (
              <View style={styles.summaryRow}>
                <Text style={styles.discountValue}>{t('couponDiscount')} ({coupon.code})</Text>
                <Text style={styles.discountValue}>-${couponDiscount.toFixed(2)}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <TextInput
                label={t('coupon')}
                value={couponCode}
                onChangeText={(value) => {
                  setCouponCode(value);
                  setCouponError('');
                }}
                mode="outlined"
                dense
                style={{ flex: 1 }}
                disabled={Boolean(coupon)}
                autoCapitalize="characters"
              />
              <Button mode="outlined" onPress={coupon ? () => {
                setCoupon(null);
                setCouponCode('');
                setCouponError('');
              } : applyCoupon}>
                {coupon ? t('removeCoupon') : t('applyCoupon')}
              </Button>
            </View>
            {couponError ? <Text style={{ color: '#EA4335', marginTop: 4 }}>{couponError}</Text> : null}
            {coupon ? <Text style={{ color: colors.primary, marginTop: 4 }}>{t('couponApplied')}: {coupon.code}</Text> : null}
            <View style={styles.summaryRowDivider} />
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>{t('Total')}</Text>
              <Text style={styles.summaryValueTotal}>${checkoutTotal.toFixed(2)}</Text>
            </View>
            <Button mode="contained" onPress={() => {
              setCheckoutError(null);
              setCheckoutVisible(true);
            }} style={styles.checkoutButton}>
              {t('Checkout')}
            </Button>
          </View>
        </>
      )}

      <Portal>
        <Dialog visible={checkoutVisible} onDismiss={() => !placingOrder && setCheckoutVisible(false)}>
          <Dialog.Title>{t('Delivery details')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('Recipient name')}
              value={shippingName}
              onChangeText={setShippingName}
              mode="outlined"
              style={{ marginBottom: 12 }}
              disabled={placingOrder}
            />
            <TextInput
              label={t('Delivery address')}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              mode="outlined"
              multiline
              disabled={placingOrder}
            />
            {checkoutError ? (
              <Text style={{ color: colors.error, marginTop: 8 }}>{checkoutError}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setCheckoutVisible(false);
              setCheckoutError(null);
            }} disabled={placingOrder}>Cancel</Button>
            <Button onPress={handleCheckout} loading={placingOrder} disabled={placingOrder}>{t('Place order')}</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={orderConfirmation !== null} onDismiss={() => setOrderConfirmation(null)}>
          <Dialog.Title>{t('Order confirmed')}</Dialog.Title>
          <Dialog.Content><Text style={{ color: colors.onSurface }}>{orderConfirmation}</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setOrderConfirmation(null)}>Continue</Button></Dialog.Actions>
        </Dialog>
        <Dialog visible={removeProductId !== null} onDismiss={() => setRemoveProductId(null)}>
          <Dialog.Title>Remove item?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.onSurface }}>Remove this item from your cart?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRemoveProductId(null)}>Cancel</Button>
            <Button
              textColor={colors.error}
              onPress={() => {
                if (removeProductId !== null) removeItem(removeProductId);
                setRemoveProductId(null);
              }}
            >
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={cartNotice !== null}
        onDismiss={() => setCartNotice(null)}
        duration={3000}
      >
        {cartNotice ?? ''}
      </Snackbar>
    </View>
  );
}
