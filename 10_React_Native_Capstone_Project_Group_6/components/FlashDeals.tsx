/**
 * Flash Deals - banner + countdown + horizontal list of the biggest discounts.
 *
 * Why the old section was blank: it only looked at the first 20 products and kept
 * those with a discount OVER 20%. DummyJSON discounts are all under ~20%, so
 * nothing ever matched. Now this component loads every product itself and shows
 * the biggest discounts (see utils/deals.ts).
 *
 * It is self-contained so Home only has to render <FlashDeals />.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Portal, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { useCart } from '@/context/CartContext';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';
import { Product } from '@/types/product';
import { getFinalPrice } from '@/utils/productFilters';
import { formatCountdown, getFlashDeals, getMaxDiscount, getMsUntilMidnight, getStockLabel } from '@/utils/deals';

/** Ticks every second; the deal "resets" at midnight so it simply starts over. */
function useCountdown() {
  const [ms, setMs] = useState(() => getMsUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(getMsUntilMidnight()), 1000);
    return () => clearInterval(id); // stop the timer when leaving the screen
  }, []);
  return ms;
}

export default function FlashDeals() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useAppTheme(); // for icon colors (icons take a color prop, not a style)
  const router = useRouter();
  const { addToCart } = useCart();
  const msLeft = useCountdown();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await productApi.getProducts({ limit: 0 }); // 0 = all products
      setProducts(res.products);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deals = useMemo(() => getFlashDeals(products), [products]);
  const maxDiscount = getMaxDiscount(deals);
  const [hh, mm, ss] = formatCountdown(msLeft).split(':');

  const openDeals = () => router.push('/(app)/(tabs)/search?sort=discount');

  const handleAdd = (product: Product) => {
    const result = addToCart(product);
    if (result === 'added') setToast(`Added "${product.title}" to cart`);
    else if (result === 'max_reached') setToast(`Only ${product.stock} in stock - already in your cart`);
    else setToast('Sorry, this item is out of stock');
  };

  const renderTimerBox = (value: string, label: string) => (
    <View style={styles.timerBox} accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.timerValue}>{value}</Text>
    </View>
  );

  const renderDeal = ({ item }: { item: Product }) => {
    const stockLabel = getStockLabel(item.stock);
    return (
      <TouchableOpacity
        style={styles.dealCard}
        activeOpacity={0.85}
        onPress={() => router.push(`/(app)/product/${item.id}`)}
      >
        <View style={styles.dealImageBox}>
          <Image source={{ uri: item.thumbnail }} style={styles.dealImage} resizeMode="contain" />
          <View style={styles.dealBadge}>
            <Text style={styles.dealBadgeText}>{`-${Math.round(item.discountPercentage)}%`}</Text>
          </View>
        </View>
        <Text style={styles.dealTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.dealPrice}>${getFinalPrice(item).toFixed(2)}</Text>
          <Text style={styles.dealOldPrice}>${item.price.toFixed(2)}</Text>
        </View>
        {stockLabel ? <Text style={styles.stockLabel}>{stockLabel}</Text> : <View style={styles.stockSpacer} />}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAdd(item)}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.title} to cart`}
        >
          <MaterialCommunityIcons name="cart-plus" size={18} color={colors.onPrimary} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Banner: the headline number, the countdown and a button to see everything */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <View style={styles.tagRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color={colors.onPrimary} />
            <Text style={styles.tag}>FLASH SALE</Text>
          </View>
          <Text style={styles.bannerTitle}>{maxDiscount > 0 ? `UP TO ${maxDiscount}% OFF` : 'TODAY ONLY'}</Text>
          <Text style={styles.endsIn}>Ends in</Text>
          <View style={styles.timerRow} accessibilityRole="timer">
            {renderTimerBox(hh, 'hours')}
            <Text style={styles.colon}>:</Text>
            {renderTimerBox(mm, 'minutes')}
            <Text style={styles.colon}>:</Text>
            {renderTimerBox(ss, 'seconds')}
          </View>
          <TouchableOpacity style={styles.shopNow} onPress={openDeals} accessibilityRole="button">
            <Text style={styles.shopNowText}>Shop Now</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <MaterialCommunityIcons name="sale" size={84} color={colors.onPrimary} style={styles.bannerArt} />
      </View>

      {/* Never blank: always a spinner, an error with Retry, or an empty message */}
      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.onPrimary} />
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>Couldn&apos;t load the deals.</Text>
          <TouchableOpacity onPress={load} accessibilityRole="button">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : deals.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>No deals right now. Check back soon!</Text>
        </View>
      ) : (
        <FlatList
          data={deals}
          renderItem={renderDeal}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Portal: a Snackbar inside a ScrollView would be hidden, Portal shows it on top */}
      <Portal>
        <Snackbar
          visible={toast !== null}
          onDismiss={() => setToast(null)}
          duration={2500}
          action={{ label: 'View cart', onPress: () => router.push('/(app)/(tabs)/cart') }}
        >
          {toast ?? ''}
        </Snackbar>
      </Portal>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { marginBottom: 24 },
    banner: {
      marginHorizontal: 16,
      borderRadius: 20,
      backgroundColor: c.primary,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },
    bannerLeft: { flex: 1 },
    bannerArt: { position: 'absolute', right: 8, bottom: 6, opacity: 0.18 },
    tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    tag: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: c.onPrimary, marginLeft: 2 },
    bannerTitle: { fontSize: 26, fontWeight: '800', color: c.onPrimary },
    endsIn: { fontSize: 12, color: c.onPrimary, opacity: 0.8, marginTop: 8, marginBottom: 4 },
    timerRow: { flexDirection: 'row', alignItems: 'center' },
    timerBox: {
      minWidth: 40,
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderRadius: 8,
      backgroundColor: c.onPrimary,
      alignItems: 'center',
    },
    timerValue: { fontSize: 18, fontWeight: '800', color: c.primary, fontVariant: ['tabular-nums'] },
    colon: { fontSize: 18, fontWeight: '800', color: c.onPrimary, marginHorizontal: 4 },
    shopNow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: 14,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: c.onPrimary,
    },
    shopNowText: { fontSize: 14, fontWeight: '700', color: c.primary, marginRight: 6 },
    list: { paddingHorizontal: 16, paddingTop: 14 },
    separator: { width: 12 },
    dealCard: {
      width: 160,
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 10,
    },
    dealImageBox: {
      height: 120,
      borderRadius: 12,
      backgroundColor: c.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    dealImage: { width: '100%', height: '100%' },
    dealBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      backgroundColor: c.primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    dealBadgeText: { fontSize: 12, fontWeight: '800', color: c.onPrimary },
    dealTitle: { fontSize: 14, fontWeight: '600', color: c.text, minHeight: 36 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
    dealPrice: { fontSize: 16, fontWeight: '800', color: c.primaryText },
    dealOldPrice: { fontSize: 12, color: c.textFaint, textDecorationLine: 'line-through', marginLeft: 6 },
    stockLabel: { fontSize: 12, fontWeight: '600', color: c.error, marginTop: 4, height: 16 },
    stockSpacer: { height: 20 },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.primary,
    },
    addButtonText: { fontSize: 14, fontWeight: '700', color: c.onPrimary, marginLeft: 6 },
    stateBox: { alignItems: 'center', paddingVertical: 24 },
    stateText: { fontSize: 14, color: c.textMuted },
    retryText: { fontSize: 14, fontWeight: '700', color: c.primaryText, marginTop: 8 },
  });
