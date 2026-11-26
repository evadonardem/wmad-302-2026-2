/**
 * Settings - manage data stored on this device.
 */
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import Constants from 'expo-constants';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { addressStorage, clearOrdersForUser } from '@/utils/storage';
import { styles } from './accountStyles';

type Action = 'cart' | 'addresses' | 'orders';

const COPY: Record<Action, { title: string; message: string; done: string }> = {
  cart: {
    title: 'Clear cart',
    message: 'Remove every item from your cart?',
    done: 'Cart cleared',
  },
  addresses: {
    title: 'Delete saved addresses',
    message: 'Remove all saved addresses from this device?',
    done: 'Addresses deleted',
  },
  orders: {
    title: 'Clear order history',
    message: 'Remove orders saved on this device? Orders from the server are not affected.',
    done: 'Order history cleared',
  },
};

export default function SettingsScreen() {
  const { user } = useAuth();
  const { clearCart, totals } = useCart();
  const [pending, setPending] = useState<Action | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const confirm = async () => {
    const action = pending;
    setPending(null);
    if (!action || !user) return;
    try {
      if (action === 'cart') clearCart();
      if (action === 'addresses') await addressStorage.clearForUser(user.id);
      if (action === 'orders') await clearOrdersForUser(user.id);
      setMessage(COPY[action].done);
    } catch {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Data on this device</Text>
      <Text style={styles.note}>Your cart, addresses and placed orders are stored locally.</Text>

      <Button mode="outlined" icon="cart-remove" onPress={() => setPending('cart')} disabled={totals.totalQuantity === 0} style={styles.button}>
        Clear cart
      </Button>
      <Button mode="outlined" icon="map-marker-remove" onPress={() => setPending('addresses')} style={styles.button}>
        Delete saved addresses
      </Button>
      <Button mode="outlined" icon="package-variant-closed-remove" onPress={() => setPending('orders')} style={styles.button}>
        Clear order history
      </Button>

      <Text style={[styles.note, { marginTop: 24, textAlign: 'center' }]}>
        Marketplace v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>

      <ConfirmDialog
        visible={pending !== null}
        title={pending ? COPY[pending].title : ''}
        message={pending ? COPY[pending].message : ''}
        confirmLabel="Confirm"
        destructive
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
      <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={3000}>
        {message ?? ''}
      </Snackbar>
    </ScrollView>
  );
}
