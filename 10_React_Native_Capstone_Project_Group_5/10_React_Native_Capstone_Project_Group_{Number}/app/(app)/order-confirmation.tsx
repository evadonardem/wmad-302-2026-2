import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const orange = '#EE4D2D';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId, total, itemCount, recipient, payment } = useLocalSearchParams<{
    orderId?: string;
    total?: string;
    itemCount?: string;
    recipient?: string;
    payment?: string;
  }>();

  return (
    <View style={styles.screen}>
      <View style={styles.successIcon}>
        <MaterialCommunityIcons name="check" size={54} color="#FFF" />
      </View>
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
        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>${Number(total ?? 0).toFixed(2)}</Text>
        </View>
      </View>
      <Text style={styles.note}>This is a demo order. No real payment was processed.</Text>
      <Button
        mode="contained"
        buttonColor={orange}
        onPress={() => router.replace('/(app)/(tabs)/home')}
        style={styles.button}
      >
        Continue shopping
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF', alignItems: 'center' as const, justifyContent: 'center' as const, padding: 24 },
  successIcon: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#19A56A', alignItems: 'center' as const, justifyContent: 'center' as const },
  title: { color: '#222', fontSize: 26, fontWeight: '800' as const, marginTop: 20 },
  message: { color: '#666', fontSize: 15, textAlign: 'center' as const, marginTop: 8, lineHeight: 22 },
  orderCard: { alignSelf: 'stretch' as const, borderWidth: 1, borderColor: '#EEE', borderRadius: 10, padding: 16, marginTop: 26 },
  row: { flexDirection: 'row' as const, justifyContent: 'space-between', paddingVertical: 9 },
  label: { color: '#777' },
  value: { color: '#333', fontWeight: '600' as const },
  total: { color: orange, fontWeight: '800' as const, fontSize: 17 },
  note: { color: '#888', fontSize: 12, textAlign: 'center' as const, marginTop: 16 },
  button: { alignSelf: 'stretch' as const, marginTop: 22 },
});
