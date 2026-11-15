/**
 * Shopping cart icon with a badge showing how many items are still to buy.
 * Tapping it opens the Shopping list. Pass `style` to position it (for example
 * absolute on the recipe page) and colors to match a floating button.
 */
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCookbook } from '@/context/CookbookContext';

interface CartButtonProps {
  style?: StyleProp<ViewStyle>;
  mode?: 'contained' | 'outlined';
  containerColor?: string;
  iconColor?: string;
}

export function CartButton({ style, mode, containerColor, iconColor }: CartButtonProps) {
  const router = useRouter();
  const { shopping } = useCookbook();
  const toBuy = shopping.filter((item) => !item.checked).length;

  return (
    <View style={style}>
      <IconButton
        icon="cart-outline"
        mode={mode}
        containerColor={containerColor}
        iconColor={iconColor}
        onPress={() => router.push('/(app)/cookbook/shopping-list')}
        accessibilityLabel={toBuy > 0 ? `Shopping list, ${toBuy} items to buy` : 'Shopping list'}
      />
      {toBuy > 0 && (
        <Badge size={18} style={styles.badge}>
          {toBuy > 99 ? '99+' : toBuy}
        </Badge>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', top: 2, right: 2 },
});
