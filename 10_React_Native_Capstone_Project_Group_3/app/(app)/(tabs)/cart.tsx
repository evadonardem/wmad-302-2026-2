/**
 * Cart & Checkout Screen - Marketplace
 */
import React, { useState } from 'react';
import { View, Text, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  IconButton,
  TextInput as PaperTextInput,
  Title,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Cart, CartItem } from '@/types/product';
import { styles } from './cartStyles';

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    couponCode,
    total,
    discountedTotal,
    totalQuantity,
    isLoading,
    isCheckingOut,
    updateQuantity,
    removeItem,
    applyCoupon,
    checkout,
  } = useCart();

  const [couponInput, setCouponInput] = useState(couponCode ?? '');
  const [couponFeedback, setCouponFeedback] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [shippingAddress, setShippingAddress] = useState(
    user?.address
      ? `${user.address.address}, ${user.address.city}`
      : '123 Main Street, Metro City'
  );
  const [confirmedOrder, setConfirmedOrder] = useState<Cart | null>(null);

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponInput);
    setCouponFeedback({ text: result.message, isError: !result.ok });
  };

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert('Remove Item', `Remove "${item.title}" from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void removeItem(item.productId);
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!shippingAddress.trim()) {
      Alert.alert(
        'Missing Address',
        'Please enter a delivery address before placing your order.'
      );
      return;
    }

    const activeUserId = user?.id ?? 1;
    try {
      const order = await checkout(activeUserId);
      setCouponInput('');
      setCouponFeedback(null);
      setConfirmedOrder(order);
    } catch (err) {
      Alert.alert(
        'Checkout Failed',
        err instanceof Error ? err.message : 'Unable to place order right now.'
      );
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return (
      <View style={styles.cartItem}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.itemImage}
          resizeMode="contain"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.itemPriceRow}>
            <Text style={styles.itemCurrentPrice}>
              ${discountedPrice.toFixed(2)}
            </Text>
            {item.discountPercentage > 0 && (
              <Text style={styles.itemOriginalPrice}>
                ${item.price.toFixed(2)}
              </Text>
            )}
          </View>
          <View style={styles.quantityControls}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() =>
                void updateQuantity(item.productId, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
              accessibilityLabel="Decrease quantity"
            />
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() =>
                void updateQuantity(item.productId, item.quantity + 1)
              }
              disabled={item.quantity >= item.stock}
              accessibilityLabel="Increase quantity"
            />
          </View>
        </View>
        <IconButton
          icon="delete-outline"
          size={24}
          iconColor="#EA4335"
          onPress={() => handleRemoveItem(item)}
          accessibilityLabel="Remove item"
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (confirmedOrder) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="check-circle"
          size={84}
          color="#34A853"
        />
        <Text style={styles.emptyTitle}>Order Placed!</Text>
        <Text style={styles.emptyText}>
          {`Order #${confirmedOrder.id} · ${confirmedOrder.totalQuantity} item(s)\nTotal Paid: $${confirmedOrder.discountedTotal.toFixed(2)}`}
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            setConfirmedOrder(null);
            router.push('/(app)/(tabs)/profile');
          }}
          style={styles.browseButton}
          contentStyle={styles.buttonContent}
        >
          View Order History
        </Button>
        <Button
          mode="outlined"
          onPress={() => {
            setConfirmedOrder(null);
            router.push('/(app)/(tabs)/home');
          }}
          style={{ marginTop: 12, borderRadius: 8 }}
        >
          Continue Shopping
        </Button>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="cart-outline"
          size={80}
          color="#DADCE0"
        />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptyText}>Add some products to get started</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(app)/(tabs)/home')}
          style={styles.browseButton}
          contentStyle={styles.buttonContent}
        >
          Continue Shopping
        </Button>
      </View>
    );
  }

  const savings = Math.max(0, total - discountedTotal);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: 310 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Title style={styles.headerTitle}>
              {`Shopping Cart (${totalQuantity} items)`}
            </Title>
          </View>
        }
        ListFooterComponent={
          <Card
            style={{
              marginTop: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
            }}
          >
            <Card.Content>
              <Text
                style={{ fontWeight: '700', marginBottom: 8, color: '#202124' }}
              >
                Delivery & Promo Code
              </Text>
              <PaperTextInput
                mode="outlined"
                label="Shipping Address"
                value={shippingAddress}
                onChangeText={setShippingAddress}
                dense
                style={{ marginBottom: 10, backgroundColor: '#FFFFFF' }}
              />
              <View
                style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
              >
                <PaperTextInput
                  mode="outlined"
                  label="Coupon (SAVE10 / SAVE20)"
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                  dense
                  style={{ flex: 1, backgroundColor: '#FFFFFF' }}
                />
                <Button mode="outlined" onPress={handleApplyCoupon}>
                  Apply
                </Button>
              </View>
              {couponFeedback && (
                <HelperText
                  type={couponFeedback.isError ? 'error' : 'info'}
                  visible={!!couponFeedback}
                >
                  {couponFeedback.text}
                </HelperText>
              )}
            </Card.Content>
          </Card>
        }
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        {savings > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {couponCode ? `Savings (${couponCode})` : 'Discount'}
            </Text>
            <Text style={styles.discountValue}>-${savings.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.summaryRowDivider} />
        <View style={styles.summaryRowTotal}>
          <Text style={styles.summaryLabelTotal}>Total</Text>
          <Text style={styles.summaryValueTotal}>
            ${discountedTotal.toFixed(2)}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleCheckout}
          loading={isCheckingOut}
          disabled={isCheckingOut}
          style={styles.checkoutButton}
          contentStyle={styles.buttonContent}
        >
          {isCheckingOut ? 'Placing Order...' : 'Place Order'}
        </Button>
      </View>
    </View>
  );
}