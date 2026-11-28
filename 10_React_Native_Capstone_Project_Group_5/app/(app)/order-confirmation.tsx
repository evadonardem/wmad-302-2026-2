import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { marketplaceColors } from '@/constants/theme';

const brandPurple = '#75648A';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId, total, itemCount, recipient, payment, couponCode, couponDiscount } = useLocalSearchParams<{
    orderId?: string;
    total?: string;
    itemCount?: string;
    recipient?: string;
    payment?: string;
    couponCode?: string;
    couponDiscount?: string;
  }>();

  return (
    <View style={styles.screen}>
      <View style={styles.successIcon}>
        <MaterialCommunityIcons name="check-bold" size={38} color="#FFF" />
      </View>
      <Text style={styles.eyebrow}>THANK YOU FOR SHOPPING WITH KARTORA</Text>
      <Text style={styles.title}>Order placed!</Text>
      <Text style={styles.message}>
        Thanks{recipient ? `, ${recipient}` : ''}. Your order has been received.
      </Text>
      <View style={styles.orderCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Order number</Text>
          <Text style={styles.value}>{orderId ? `#${orderId}` : 'Confirmed'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Items</Text>
          <Text style={styles.value}>{itemCount ?? '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{payment === 'demo-card' ? 'Demo card' : 'Cash on delivery'}</Text>
        </View>
        {couponCode && Number(couponDiscount) > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Coupon ({couponCode})</Text>
            <Text style={styles.savings}>-${Number(couponDiscount).toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>${Number(total ?? 0).toFixed(2)}</Text>
        </View>
      </View>
      <Text style={styles.note}>This is a demo order. No real payment was processed.</Text>
      <Button
        mode="contained"
        buttonColor={brandPurple}
        onPress={() => router.replace('/(app)/(tabs)/home')}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Continue shopping
      </Button>
      <Button
        mode="text"
        textColor={brandPurple}
        onPress={() => router.replace('/(app)/orders')}
        style={styles.ordersButton}
      >
        View my orders
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.background, alignItems: 'center' as const, justifyContent: 'center' as const, padding: 24 },
  successIcon: { width: 76, height: 76, borderRadius: 26, backgroundColor: '#25845A', alignItems: 'center' as const, justifyContent: 'center', shadowColor: '#25845A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 5 },
  eyebrow: { color: '#81788A', fontSize: 10, fontWeight: '800' as const, letterSpacing: 1.1, marginTop: 22 },
  title: { color: '#30283A', fontSize: 28, fontWeight: '800' as const, marginTop: 7 },
  message: { color: '#746C7A', fontSize: 15, textAlign: 'center' as const, marginTop: 8, lineHeight: 22 },
  orderCard: { alignSelf: 'stretch' as const, borderWidth: 1, borderColor: marketplaceColors.border, borderRadius: 18, padding: 18, marginTop: 26, backgroundColor: '#FFF', shadowColor: '#30283A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  row: { flexDirection: 'row' as const, justifyContent: 'space-between', paddingVertical: 9 },
  label: { color: '#746C7A' },
  value: { color: '#30283A', fontWeight: '600' as const, maxWidth: '60%' as const, textAlign: 'right' as const },
  total: { color: brandPurple, fontWeight: '800' as const, fontSize: 19 },
  savings: { color: '#25845A', fontWeight: '600' as const },
  note: { color: '#81788A', fontSize: 12, textAlign: 'center' as const, marginTop: 16, lineHeight: 18 },
  button: { alignSelf: 'stretch' as const, marginTop: 22, borderRadius: 13 },
  buttonContent: { minHeight: 48 },
  ordersButton: { marginTop: 2 },
});
