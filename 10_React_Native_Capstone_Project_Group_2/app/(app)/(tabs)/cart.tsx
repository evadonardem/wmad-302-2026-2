/**
 * Cart Screen - Marketplace
 * Completed implementation:
 * - Cart state and add/remove/update quantity actions
 * - Persist cart items to AsyncStorage
 * - Apply the demo SKY10 coupon
 * - Submit checkout through POST /carts/add
 * - DummyJSON Carts API: https://dummyjson.com/docs/carts
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Button, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cartStorage } from '@/utils/storage';
import { productApi } from '@/services/productApi';
import { useAuth } from '@/context/AuthContext';
import type { CartItem as StoredCartItem } from '@/types/product';
import { styles } from './cartStyles';

interface CartItem extends StoredCartItem { id: number; }
interface Cart { items: CartItem[]; total: number; discountedTotal: number; totalProducts: number; totalQuantity: number; }
const emptyCart: Cart = { items: [], total: 0, discountedTotal: 0, totalProducts: 0, totalQuantity: 0 };

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Cart data is stored locally so it remains available between app sessions.
  useFocusEffect(
  useCallback(() => {
    void loadCart();
  }, [])
);
  const calculateTotals = (items: CartItem[]): Cart => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountedTotal = items.reduce((sum, item) => sum + item.price * (1 - item.discountPercentage / 100) * item.quantity, 0);
    return { items, total, discountedTotal, totalProducts: items.length, totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0) };
  };
  const loadCart = async () => {
    try {
      const stored = await cartStorage.getCart();
      setCart(calculateTotals(stored.map((item) => ({ ...item, id: item.productId }))));
    } catch (error) { Alert.alert('Cart error', error instanceof Error ? error.message : 'Unable to load your cart.'); }
    finally { setLoading(false); }
  };
  const saveItems = async (items: CartItem[]) => {
    const normalized: StoredCartItem[] = items.map(({ id, ...item }) => item);
    await cartStorage.setCart(normalized);
    setCart(calculateTotals(items));
  };
  const updateQuantity = async (productId: number, newQuantity: number) => {
    const item = cart.items.find((entry) => entry.productId === productId);
    if (!item) return;
    if (newQuantity > item.stock) { Alert.alert('Out of Stock', `Only ${item.stock} items are available.`); return; }
    if (newQuantity < 1) { removeItem(productId); return; }
    await saveItems(cart.items.map((entry) => entry.productId === productId ? { ...entry, quantity: newQuantity } : entry));
  };
  const removeItem = (productId: number) => {
    Alert.alert('Remove Item', 'Remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { void saveItems(cart.items.filter((entry) => entry.productId !== productId)); } },
    ]);
  };
  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'SKY10') { setCouponApplied(true); Alert.alert('Coupon applied', 'SKY10 gives you an extra 10% off.'); }
    else { setCouponApplied(false); Alert.alert('Invalid coupon', 'Try the demo coupon SKY10.'); }
  };
  const handleCheckout = () => {
    if (!cart.items.length) return;
    if (!user?.id) { Alert.alert('Sign in required', 'Please log in before placing an order.'); return; }
    Alert.alert('Confirm Order', `Place this order for $${(cart.discountedTotal * (couponApplied ? 0.9 : 1)).toFixed(2)}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Place Order', onPress: () => { void (async () => {
        setCheckingOut(true);
        try {
          const order = await productApi.addCart({ userId: user.id, products: cart.items.map((item) => ({ id: item.productId, quantity: item.quantity })) });
          await cartStorage.clear(); setCart(emptyCart); setCouponApplied(false);
          Alert.alert('Order submitted', `Demo order #${order.id} was created successfully.`);
        } catch (error) { Alert.alert('Checkout failed', error instanceof Error ? error.message : 'Please try again.'); }
        finally { setCheckingOut(false); }
      })(); } },
    ]);
  };
  const renderItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return <View style={styles.cartItem}>
      <Image source={{ uri: item.thumbnail }} style={styles.itemImage} resizeMode="contain" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.itemPriceRow}><Text style={styles.itemCurrentPrice}>${discountedPrice.toFixed(2)}</Text>{item.discountPercentage > 0 && <Text style={styles.itemOriginalPrice}>${item.price.toFixed(2)}</Text>}</View>
        <View style={styles.quantityControls}>
          <IconButton icon="minus" size={20} onPress={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} accessibilityLabel="Decrease quantity" />
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <IconButton icon="plus" size={20} onPress={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} accessibilityLabel="Increase quantity" />
        </View>
      </View>
      <IconButton icon="delete-outline" size={24} iconColor="#0284C7" onPress={() => removeItem(item.productId)} accessibilityLabel="Remove item" />
    </View>;
  };
  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#38BDF8" /><Text style={styles.loadingText}>Loading cart...</Text></View>;
  const isEmpty = cart.items.length === 0;
  return <View style={styles.container}>
    {isEmpty ? <View style={styles.emptyState}>
      <MaterialCommunityIcons name="cart-outline" size={80} color="#7DD3FC" />
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text><Text style={styles.emptyText}>Add some products to get started</Text>
      <Button mode="contained" onPress={() => router.push('/(app)/(tabs)/home')} style={styles.browseButton} contentStyle={styles.buttonContent}>Continue Shopping</Button>
    </View> : <>
      <FlatList data={cart.items} renderItem={renderItem} keyExtractor={(item) => item.productId.toString()} contentContainerStyle={styles.listContent} ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.headerTitle}>Shopping Cart ({cart.totalQuantity} items)</Text></View>} />
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>${cart.total.toFixed(2)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Product discounts</Text><Text style={styles.summaryValue}>-${(cart.total-cart.discountedTotal).toFixed(2)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Coupon</Text><Text style={styles.summaryValue}>{couponApplied ? '-10%' : '—'}</Text></View>
        <TextInput mode="outlined" label="Coupon code (try SKY10)" value={coupon} onChangeText={setCoupon} right={<TextInput.Icon icon="ticket-percent" onPress={applyCoupon} />} />
        <View style={styles.summaryRowTotal}><Text style={styles.summaryLabelTotal}>Total</Text><Text style={styles.summaryValueTotal}>${(cart.discountedTotal * (couponApplied ? 0.9 : 1)).toFixed(2)}</Text></View>
        <Button mode="contained" onPress={handleCheckout} loading={checkingOut} disabled={checkingOut} style={styles.checkoutButton}>Proceed to Checkout</Button>
      </View>
    </>}
  </View>;
}
