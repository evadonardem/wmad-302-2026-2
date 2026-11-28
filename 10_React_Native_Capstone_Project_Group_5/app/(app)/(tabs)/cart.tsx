import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, IconButton, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import ProductRecommendations from '@/components/ProductRecommendations';
import CouponEntry from '@/components/CouponEntry';
import { marketplaceColors } from '@/constants/theme';
import { calculateCouponDiscount } from '@/utils/coupons';
import { showAlert } from '@/utils/platformAlert';

const brandPurple = '#75648A';

export default function CartScreen() {
  const router = useRouter();
  const { sourceProductId } = useLocalSearchParams<{ sourceProductId?: string }>();
  const {
    items,
    isLoading,
    totalQuantity,
    appliedCoupon,
    updateQuantity,
    removeItem,
  } = useCart();
  const [selectedProductIds, setSelectedProductIds] = useState<number[] | null>(null);
  const previousProductIds = useRef<number[]>([]);
  const removalInProgress = useRef<number | null>(null);
  const [removingProductId, setRemovingProductId] = useState<number | null>(null);
  const [removedProductTitle, setRemovedProductTitle] = useState<string | null>(null);
  const removalOpacity = useRef(new Animated.Value(1)).current;
  const removalTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) return;
    const currentProductIds = items.map((item) => item.productId);
    const addedProductIds = currentProductIds.filter(
      (productId) => !previousProductIds.current.includes(productId)
    );
    const availableProductIds = new Set(currentProductIds);
    setSelectedProductIds((current) => current === null
      ? currentProductIds
      : [
          ...current.filter((productId) => availableProductIds.has(productId)),
          ...addedProductIds,
        ]);
    previousProductIds.current = currentProductIds;
  }, [items, isLoading]);

  const selectedIds = selectedProductIds ?? items.map((item) => item.productId);
  const selectedIdSet = new Set(selectedIds);
  const selectedItems = items.filter((item) => selectedIdSet.has(item.productId));
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedDiscountedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * (1 - item.discountPercentage / 100) * item.quantity,
    0
  );
  const selectedCouponDiscount = calculateCouponDiscount(appliedCoupon, selectedDiscountedTotal);
  const selectedTotal = Number((selectedDiscountedTotal - selectedCouponDiscount).toFixed(2));
  const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = selectedItems.length === items.length;

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((current) => {
      const currentSelection = current ?? items.map((item) => item.productId);
      return currentSelection.includes(productId)
        ? currentSelection.filter((id) => id !== productId)
        : [...currentSelection, productId];
    });
  };

  const update = async (productId: number, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      showAlert('Quantity unavailable', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const animateRemove = (productId: number, title: string) => {
    if (removalInProgress.current !== null) return;

    removalInProgress.current = productId;
    setRemovingProductId(productId);
    setRemovedProductTitle(null);
    Animated.parallel([
      Animated.timing(removalOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(removalTranslateX, {
        toValue: 28,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        removalInProgress.current = null;
        setRemovingProductId(null);
        removalOpacity.setValue(1);
        removalTranslateX.setValue(0);
        return;
      }

      void removeItem(productId)
        .then(() => setRemovedProductTitle(title))
        .catch((error: unknown) => {
          showAlert('Could not remove item', error instanceof Error ? error.message : 'Try again.');
        })
        .finally(() => {
          removalInProgress.current = null;
          setRemovingProductId(null);
          removalOpacity.setValue(1);
          removalTranslateX.setValue(0);
        });
    });
  };

  const decrease = async (productId: number, title: string, quantity: number) => {
    if (quantity > 1) {
      await update(productId, quantity - 1);
      return;
    }

    animateRemove(productId, title);
  };

  const confirmRemove = (productId: number, title: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Remove this item from your cart?')) {
        animateRemove(productId, title);
      }
      return;
    }

    showAlert('Remove item', 'Remove this item from your cart?', [
      { text: 'Keep item', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => animateRemove(productId, title),
      },
    ]);
  };

  const removalFeedback = (
    <Snackbar
      visible={removedProductTitle !== null}
      onDismiss={() => setRemovedProductTitle(null)}
      duration={2600}
      style={styles.removalSnackbar}
      action={{ label: 'OK', onPress: () => setRemovedProductTitle(null) }}
    >
      {`${removedProductTitle ?? ''} removed from your cart`}
    </Snackbar>
  );

  const goBack = () => {
    const productId = Number(sourceProductId);
    if (sourceProductId && Number.isInteger(productId) && productId > 0) {
      router.replace(`/(app)/product/${productId}`);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)/home');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.cartHeader}>
          <IconButton icon="arrow-left" onPress={goBack} accessibilityLabel="Go back" />
          <Text style={styles.cartHeaderTitle}>My Cart</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.muted}>Loading your cart...</Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.cartHeader}>
          <IconButton icon="arrow-left" onPress={goBack} accessibilityLabel="Go back" />
          <Text style={styles.cartHeaderTitle}>My Cart</Text>
        </View>
        <ScrollView contentContainerStyle={styles.emptyContent}>
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cart-outline" size={76} color="#CCC" />
            <Text style={styles.emptyTitle}>Your cart is waiting</Text>
            <Text style={styles.muted}>Find something you love and add it here.</Text>
            <Button mode="contained" buttonColor={brandPurple} onPress={() => router.push('/(app)/(tabs)/home')}>
              Start shopping
            </Button>
          </View>
          <ProductRecommendations
            title="You might like"
            subtitle="Discover products to add to your cart"
          />
        </ScrollView>
        {removalFeedback}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.cartHeader}>
        <IconButton icon="arrow-left" onPress={goBack} accessibilityLabel="Go back" />
        <Text style={styles.cartHeaderTitle}>My Cart</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>My Cart ({totalQuantity})</Text>
        <View style={styles.selectionHeader}>
          <IconButton
            icon={allSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
            iconColor={brandPurple}
            size={22}
            onPress={() => setSelectedProductIds(allSelected ? [] : items.map((item) => item.productId))}
            accessibilityLabel={allSelected ? 'Deselect all products' : 'Select all products'}
          />
          <Text style={styles.selectionLabel}>Select all</Text>
          <Text style={styles.selectionCount}>{selectedItems.length} selected</Text>
        </View>
        {items.map((item) => {
          const unitPrice = item.price * (1 - item.discountPercentage / 100);
          const isSelected = selectedIdSet.has(item.productId);
          return (
            <Animated.View
              key={item.productId}
              style={removingProductId === item.productId ? {
                opacity: removalOpacity,
                transform: [
                  { translateX: removalTranslateX },
                  {
                    scale: removalOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              } : undefined}
            >
              <Card
                style={[styles.card, isSelected && styles.selectedCard]}
                mode="contained"
              >
                <View style={styles.itemRow}>
                  <IconButton
                    icon={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    iconColor={isSelected ? brandPurple : '#A79EAE'}
                    size={22}
                    style={styles.itemCheckbox}
                    onPress={() => toggleProductSelection(item.productId)}
                    disabled={removingProductId !== null}
                    accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${item.title}`}
                  />
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
                        onPress={() => void decrease(item.productId, item.title, item.quantity)}
                        disabled={removingProductId !== null}
                        accessibilityLabel={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                      />
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <IconButton
                        icon="plus"
                        size={18}
                        onPress={() => void update(item.productId, item.quantity + 1)}
                        disabled={removingProductId !== null || item.quantity >= item.stock}
                        accessibilityLabel="Increase quantity"
                      />
                    </View>
                  </View>
                  <IconButton
                    icon="delete-outline"
                    iconColor={brandPurple}
                    onPress={() => confirmRemove(item.productId, item.title)}
                    disabled={removingProductId !== null}
                    accessibilityLabel={`Remove ${item.title}`}
                  />
                </View>
              </Card>
            </Animated.View>
          );
        })}

        <Card style={styles.summary} mode="contained">
          <Text style={styles.summaryTitle}>Order summary · {selectedQuantity} selected</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Selected items</Text>
            <Text style={styles.summaryValue}>${selectedSubtotal.toFixed(2)}</Text>
          </View>
          {selectedSubtotal > selectedDiscountedTotal && (
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>Product discounts</Text>
              <Text style={styles.savings}>-${(selectedSubtotal - selectedDiscountedTotal).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Shipping</Text>
            <Text style={styles.savings}>FREE</Text>
          </View>
          <CouponEntry discountAmount={selectedCouponDiscount} />
          {appliedCoupon && selectedCouponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>Coupon ({appliedCoupon.code})</Text>
              <Text style={styles.savings}>-${selectedCouponDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>${selectedTotal.toFixed(2)}</Text>
          </View>
          {selectedItems.length === 0 && (
            <Text style={styles.selectionPrompt}>Select at least one product to continue.</Text>
          )}
          <Button
            mode="contained"
            buttonColor={brandPurple}
            style={styles.checkoutButton}
            disabled={selectedItems.length === 0}
            onPress={() => router.push({
              pathname: '/(app)/checkout',
              params: { selectedItemIds: selectedItems.map((item) => item.productId).join(',') },
            })}
          >
            Checkout {selectedQuantity} {selectedQuantity === 1 ? 'item' : 'items'}
          </Button>
        </Card>
        <ProductRecommendations
          title="You might like"
          subtitle="Discover products to add to your cart"
        />
      </ScrollView>
      {removalFeedback}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.background },
  cartHeader: { height: 56, flexDirection: 'row' as const, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: marketplaceColors.border },
  cartHeaderTitle: { flex: 1, marginLeft: 4, color: '#222', fontSize: 18, fontWeight: '700' as const },
  emptyContent: { flexGrow: 1, paddingBottom: 32 },
  content: { padding: 14, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '800' as const, color: '#222', marginBottom: 12 },
  selectionHeader: { flexDirection: 'row' as const, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10, paddingRight: 12, borderWidth: 1, borderColor: marketplaceColors.border },
  selectionLabel: { color: '#333', fontWeight: '600' as const },
  selectionCount: { color: '#777', fontSize: 12, marginLeft: 'auto' as const },
  card: { backgroundColor: '#FFF', marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: marketplaceColors.border, overflow: 'hidden' },
  selectedCard: { borderColor: brandPurple },
  itemRow: { flexDirection: 'row' as const, alignItems: 'center', padding: 8 },
  itemCheckbox: { margin: 0, marginRight: 2 },
  image: { width: 82, height: 82, backgroundColor: marketplaceColors.background, borderRadius: 12 },
  itemInfo: { flex: 1, paddingHorizontal: 6 },
  itemTitle: { color: '#222', fontWeight: '600' as const, fontSize: 14 },
  itemPrice: { color: brandPurple, fontWeight: '700' as const, fontSize: 16, marginTop: 6 },
  oldPrice: { color: '#999', fontSize: 12, textDecorationLine: 'line-through' as const },
  controls: { flexDirection: 'row' as const, alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: marketplaceColors.border, borderRadius: 10, marginTop: 6 },
  quantity: { minWidth: 24, textAlign: 'center' as const, color: '#333', fontWeight: '600' as const },
  summary: { backgroundColor: '#FFF', padding: 18, marginTop: 4, borderRadius: 18, borderWidth: 1, borderColor: marketplaceColors.border },
  summaryTitle: { fontSize: 17, color: '#222', fontWeight: '700' as const, marginBottom: 10 },
  summaryRow: { flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  summaryValue: { color: '#333', fontSize: 13 },
  savings: { color: '#179B62', fontWeight: '600' as const },
  divider: { height: 1, backgroundColor: marketplaceColors.border, marginVertical: 8 },
  totalLabel: { fontWeight: '700' as const, color: '#222', fontSize: 16 },
  total: { color: brandPurple, fontSize: 20, fontWeight: '800' as const },
  selectionPrompt: { color: '#9B5B27', fontSize: 13, marginTop: 4 },
  checkoutButton: { marginTop: 14, borderRadius: 12, paddingVertical: 3 },
  removalSnackbar: { backgroundColor: brandPurple },
  empty: { minHeight: 420, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  emptyTitle: { color: '#222', fontSize: 20, fontWeight: '700' as const },
  muted: { color: '#777', fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
