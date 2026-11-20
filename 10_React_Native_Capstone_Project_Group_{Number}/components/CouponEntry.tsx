import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, IconButton, TextInput } from 'react-native-paper';
import { useCart } from '@/context/CartContext';
import { marketplaceColors } from '@/constants/theme';

interface CouponEntryProps {
  discountAmount?: number;
}

export default function CouponEntry({ discountAmount }: CouponEntryProps) {
  const { appliedCoupon, couponDiscount, applyCoupon, removeCoupon } = useCart();
  const displayedDiscount = discountAmount ?? couponDiscount;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      await applyCoupon(code);
      setCode('');
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : 'Could not apply this coupon.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Voucher or discount code</Text>
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          dense
          placeholder="Enter code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          style={styles.input}
          onSubmitEditing={() => void handleApply()}
          accessibilityLabel="Voucher or discount code"
        />
        <Button
          mode="outlined"
          compact
          onPress={() => void handleApply()}
          loading={applying}
          disabled={applying || !code.trim()}
          textColor={marketplaceColors.primary}
        >
          Apply
        </Button>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {appliedCoupon && (
        <View style={styles.appliedRow}>
          <Text style={styles.appliedText}>
            {appliedCoupon.code} applied · save ${displayedDiscount.toFixed(2)}
          </Text>
          <IconButton
            icon="close"
            size={18}
            onPress={removeCoupon}
            accessibilityLabel="Remove coupon"
          />
        </View>
      )}
      <Text style={styles.hint}>
        KARTORA10: 10% off · WELCOME5: $5 off. One coupon per order.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 8,
  },
  heading: {
    color: marketplaceColors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  error: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 5,
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingLeft: 10,
    borderRadius: 8,
    backgroundColor: marketplaceColors.primarySoft,
  },
  appliedText: {
    flex: 1,
    color: marketplaceColors.primaryDark,
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    color: marketplaceColors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
});
