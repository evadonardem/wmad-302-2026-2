import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  Divider,
  List,
  Portal,
  Switch,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/services/productApi';
import { Product, Cart, DeliveryStatus } from '@/types/product';
import { favoritesStorage } from '@/utils/storage';
import { styles as baseStyles } from './profileStyles';
import { AppLanguage, useAppPreferences } from '@/context/AppPreferencesContext';
import { requestNotificationPermission, setDealNotificationsEnabled } from '@/services/localNotifications';
import { getThemedStyles } from '@/utils/themeStyles';
import { advanceOrderTracking, createDeliveredOrderTracking, createOrderTracking, DELIVERY_STATUSES } from '@/services/orderTracking';
import { Alert } from '@/utils/alert';

type ProfileDialog = 'edit' | 'orders' | 'addresses' | 'payment' | 'settings' | 'wishlist' | 'logout' | null;
type ProfileSettings = { orderUpdates: boolean; dealUpdates: boolean };

const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  outForDelivery: 'Out for delivery',
  delivered: 'Delivered',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const { colorMode, language, setColorMode, setLanguage, t } = useAppPreferences();
  const styles = getThemedStyles(baseStyles, colorMode === 'dark');
  const [dialog, setDialog] = useState<ProfileDialog>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [orders, setOrders] = useState<Cart[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Cart | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [addressDraft, setAddressDraft] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [paymentLabel, setPaymentLabel] = useState('');
  const [paymentLastFour, setPaymentLastFour] = useState('');
  const [settings, setSettings] = useState<ProfileSettings>({ orderUpdates: true, dealUpdates: false });
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const storageKey = (name: string) => `marketplace_${name}_${user?.id ?? 'guest'}`;

  const loadList = async <T,>(key: string): Promise<T[]> => {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) as T[] : [];
  };

  const handleLogout = () => {
    setDialog('logout');
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error: unknown) {
      console.error('Logout failed:', error);
      setDialog(null);
      setLogoutFailed(true);
    } finally {
      setLoggingOut(false);
    }
  };

  const saveProfile = async () => {
    if (!user || !firstName.trim() || !lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Check your details', 'Enter your first name, last name, and a valid email address.');
      return;
    }
    setSaving(true);
    try {
      const updatedProfile = await productApi.updateUser(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      await updateUser(updatedProfile);
      setDialog(null);
      Alert.alert('Profile updated', 'Your profile information has been saved.');
    } catch (error) {
      console.error('Profile update failed:', error);
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showOrders = async () => {
    if (!user) return;
    setDialog('orders');
    setOrdersLoading(true);
    setOrderError(null);
    const [remoteResult, savedResult] = await Promise.allSettled([
      productApi.getUserCarts(user.id),
      loadList<Cart>(`marketplace_orders_${user.id}`),
    ]);
    const remoteOrders = remoteResult.status === 'fulfilled' ? remoteResult.value : [];
    const savedOrders = savedResult.status === 'fulfilled' ? savedResult.value : [];
    const errors: string[] = [];
    if (remoteResult.status === 'rejected') {
      console.error('Could not load remote order history:', remoteResult.reason);
      errors.push('Online order history is unavailable.');
    }
    if (savedResult.status === 'rejected') {
      console.error('Could not load saved orders:', savedResult.reason);
      errors.push('Saved order history could not be read from this device.');
    }
    const trackedSavedOrders = savedOrders.map((order) => ({
      ...order,
      deliveryTracking: order.deliveryTracking ?? createOrderTracking(user.id, order.id),
    }));
    const trackedRemoteOrders = remoteOrders.map((order) => ({
      ...order,
      deliveryTracking: order.deliveryTracking ?? createDeliveredOrderTracking(user.id, order.id),
    }));
    if (savedResult.status === 'fulfilled' && savedOrders.some((order) => !order.deliveryTracking)) {
      try {
        await AsyncStorage.setItem(`marketplace_orders_${user.id}`, JSON.stringify(trackedSavedOrders));
      } catch (trackingError) {
        console.error('Could not save order tracking information:', trackingError);
        errors.push('Tracking details could not be saved on this device.');
      }
    }
    const combined = [...trackedSavedOrders, ...trackedRemoteOrders];
    setOrders(combined.filter((order, index) =>
      combined.findIndex((candidate) => candidate.id === order.id) === index
    ));
    setOrderError(errors.length ? errors.join(' ') : null);
    setOrdersLoading(false);
  };

  const advanceSelectedOrder = async () => {
    if (!selectedOrder?.deliveryTracking || !user) return;
    const tracking = advanceOrderTracking(selectedOrder.deliveryTracking);
    if (tracking === selectedOrder.deliveryTracking) return;
    const updatedOrder = { ...selectedOrder, deliveryTracking: tracking };
    try {
      const savedOrders = await loadList<Cart>(`marketplace_orders_${user.id}`);
      const updatedOrders = [updatedOrder, ...savedOrders.filter((order) => order.id !== updatedOrder.id)];
      await AsyncStorage.setItem(`marketplace_orders_${user.id}`, JSON.stringify(updatedOrders));
      setSelectedOrder(updatedOrder);
      setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
    } catch (trackingError) {
      console.error('Could not save delivery tracking update:', trackingError);
      Alert.alert('Tracking update failed', 'The delivery status could not be saved. Please try again.');
    }
  };

  const showAddresses = async () => {
    try {
      setAddresses(await loadList<string>(storageKey('addresses')));
      setDialog('addresses');
    } catch (error) {
      console.error('Could not load saved addresses:', error);
      Alert.alert('Could not load addresses', 'Please try again.');
    }
  };

  const addAddress = async () => {
    const address = addressDraft.trim();
    if (!address) {
      Alert.alert('Address required', 'Enter a delivery address first.');
      return;
    }
    const updated = [...addresses, address];
    try {
      await AsyncStorage.setItem(storageKey('addresses'), JSON.stringify(updated));
      setAddresses(updated);
      setAddressDraft('');
    } catch (error) {
      console.error('Could not save address:', error);
      Alert.alert('Could not save address', 'Please try again.');
    }
  };

  const removeAddress = async (index: number) => {
    const updated = addresses.filter((_, addressIndex) => addressIndex !== index);
    try {
      await AsyncStorage.setItem(storageKey('addresses'), JSON.stringify(updated));
      setAddresses(updated);
    } catch (error) {
      console.error('Could not remove address:', error);
      Alert.alert('Could not remove address', 'Please try again.');
    }
  };

  const showPaymentMethods = async () => {
    try {
      setPaymentMethods(await loadList<string>(storageKey('payments')));
      setDialog('payment');
    } catch (error) {
      console.error('Could not load payment methods:', error);
      Alert.alert('Could not load payment methods', 'Please try again.');
    }
  };

  const addPaymentMethod = async () => {
    const label = paymentLabel.trim();
    if (!label || !/^\d{4}$/.test(paymentLastFour)) {
      Alert.alert('Payment details required', 'Enter a card label and its last four digits. Do not enter your full card number.');
      return;
    }
    const updated = [...paymentMethods, `${label} •••• ${paymentLastFour}`];
    try {
      await AsyncStorage.setItem(storageKey('payments'), JSON.stringify(updated));
      setPaymentMethods(updated);
      setPaymentLabel('');
      setPaymentLastFour('');
    } catch (error) {
      console.error('Could not save payment method:', error);
      Alert.alert('Could not save payment method', 'Please try again.');
    }
  };

  const showSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey('settings'));
      const saved = stored ? JSON.parse(stored) as Partial<ProfileSettings> : {};
      setSettings({
        orderUpdates: saved.orderUpdates ?? false,
        dealUpdates: saved.dealUpdates ?? false,
      });
      setDialog('settings');
    } catch (error) {
      console.error('Could not load profile settings:', error);
      Alert.alert('Could not load settings', 'Please try again.');
    }
  };

  const toggleOrderUpdates = async (enabled: boolean) => {
    try {
      if (enabled && !(await requestNotificationPermission())) {
        Alert.alert('Notifications unavailable', 'Allow notifications in your device settings to receive order updates.');
        return;
      }
      const updated = { ...settings, orderUpdates: enabled };
      await AsyncStorage.setItem(storageKey('settings'), JSON.stringify(updated));
      setSettings(updated);
    } catch (error) {
      console.error('Could not save settings:', error);
      Alert.alert('Could not save settings', 'Please try again.');
    }
  };

  const toggleDealUpdates = async (enabled: boolean) => {
    try {
      if (enabled && !(await requestNotificationPermission())) {
        Alert.alert('Notifications unavailable', 'Allow notifications in your device settings to receive deal updates.');
        return;
      }
      await setDealNotificationsEnabled(enabled, t('Flash deals are live'), t('Check out today’s limited-time marketplace deals.'));
      const updated = { ...settings, dealUpdates: enabled };
      await AsyncStorage.setItem(storageKey('settings'), JSON.stringify(updated));
      setSettings(updated);
    } catch (error) {
      console.error('Could not update deal notifications:', error);
      Alert.alert('Could not update notifications', 'Please try again.');
    }
  };

  const changeLanguage = async (nextLanguage: AppLanguage) => {
    try {
      await setLanguage(nextLanguage);
    } catch (error) {
      console.error('Could not save language preference:', error);
      Alert.alert('Could not save language', 'Please try again.');
    }
  };

  const changeColorMode = async (enabled: boolean) => {
    try {
      await setColorMode(enabled ? 'dark' : 'light');
    } catch (error) {
      console.error('Could not save theme preference:', error);
      Alert.alert('Could not save theme', 'Please try again.');
    }
  };

  const showWishlist = async () => {
    if (!user) return;
    try {
      const ids = await favoritesStorage.getIds();
      const products = await Promise.all(ids.map((id) => productApi.getProductById(id)));
      setWishlist(products);
      setDialog('wishlist');
    } catch (error) {
      console.error('Could not load wishlist:', error);
      Alert.alert('Could not load wishlist', 'Please try again.');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await favoritesStorage.removeId(productId);
      setWishlist((current) => current.filter((product) => product.id !== productId));
    } catch (error) {
      console.error('Could not remove wishlist item:', error);
      Alert.alert('Could not update wishlist', 'Please try again.');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view profile</Text>
      </View>
    );
  }

  const ordersTotal = orders.reduce((total, order) => total + order.discountedTotal, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar.Image size={88} source={{ uri: user.image }} style={styles.avatar} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${ordersTotal.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wishlist.length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title={t('My Orders')}
              description={t('Track and manage orders')}
              left={(props) => <MaterialCommunityIcons name="package-variant" size={24} color="#66BB6A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#5F6368" style={props.style} />}
              onPress={showOrders}
            />
            <Divider style={styles.divider} />
            <List.Item
              title={t('Wishlist')}
              description={t('Saved items for later')}
              left={(props) => <MaterialCommunityIcons name="heart" size={24} color="#66BB6A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#5F6368" style={props.style} />}
              onPress={showWishlist}
            />
            <Divider style={styles.divider} />
            <List.Item
              title={t('Addresses')}
              description={`${addresses.length} saved`}
              left={(props) => <MaterialCommunityIcons name="map-marker" size={24} color="#66BB6A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#5F6368" style={props.style} />}
              onPress={showAddresses}
            />
            <Divider style={styles.divider} />
            <List.Item
              title={t('Payment Methods')}
              description={`${paymentMethods.length} saved`}
              left={(props) => <MaterialCommunityIcons name="credit-card" size={24} color="#66BB6A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#5F6368" style={props.style} />}
              onPress={showPaymentMethods}
            />
          </List.Section>
        </Card>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title={t('Edit Profile')}
              description={t('Update your information')}
              left={(props) => <MaterialCommunityIcons name="account-edit" size={24} color="#66BB6A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#5F6368" style={props.style} />}
              onPress={() => setDialog('edit')}
            />
            <Divider style={styles.divider} />
            <List.Item
              title={t('settings')}
              description={t('orderNotifications')}
              left={(props) => <MaterialCommunityIcons name="cog" size={24} color="#66BB6A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#5F6368" style={props.style} />}
              onPress={showSettings}
            />
          </List.Section>
        </Card>
      </View>

      <View style={styles.logoutContainer}>
        <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton} icon="logout">
          <Text style={styles.logoutButtonText}>{t('Logout')}</Text>
        </Button>
      </View>

      <Text style={{ color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 16 }}>Marketplace v1.0.0</Text>

      <Portal>
        <Dialog visible={dialog === 'logout'} onDismiss={() => !loggingOut && setDialog(null)}>
          <Dialog.Title>{t('Logout')}</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.onSurface }}>{t('Are you sure you want to logout?')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)} disabled={loggingOut}>{t('Cancel')}</Button>
            <Button onPress={confirmLogout} loading={loggingOut} disabled={loggingOut}>{t('Logout')}</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={logoutFailed} onDismiss={() => setLogoutFailed(false)}>
          <Dialog.Title>{t('Logout failed')}</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.onSurface }}>{t('Your session could not be cleared. Please try again.')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutFailed(false)}>{t('Close')}</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={dialog === 'edit'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>{t('Edit profile')}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="First name" value={firstName} onChangeText={setFirstName} mode="outlined" style={{ marginBottom: 10 }} />
            <TextInput label="Last name" value={lastName} onChangeText={setLastName} mode="outlined" style={{ marginBottom: 10 }} />
            <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" keyboardType="email-address" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)} disabled={saving}>{t('Cancel')}</Button>
            <Button onPress={saveProfile} loading={saving} disabled={saving}>{t('Save')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'orders'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>{t('Order history')}</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 420 }}>
            {ordersLoading ? <ActivityIndicator style={{ padding: 24 }} /> : orderError && orders.length === 0 ? (
              <Text style={{ padding: 20, color: colors.error }}>{orderError}</Text>
            ) : orders.length === 0 ? (
              <Text style={{ padding: 20, color: colors.onSurfaceVariant }}>No orders yet. Your completed orders will appear here.</Text>
            ) : (
              <>
                {orderError ? <Text style={{ padding: 12, color: colors.error }}>{orderError}</Text> : null}
                {orders.map((item, index) => (
                  <List.Item
                    key={`${item.id}-${index}`}
                    title={`Order #${item.id}`}
                    description={`${item.totalProducts} products · ${item.totalQuantity} items · ${item.deliveryTracking ? t(DELIVERY_STATUS_LABELS[item.deliveryTracking.status]) : ''}`}
                    right={() => <Text style={{ alignSelf: 'center', fontWeight: '700' }}>${item.discountedTotal.toFixed(2)}</Text>}
                    onPress={() => {
                      setDialog(null);
                      setSelectedOrder(item);
                    }}
                  />
                ))}
              </>
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions><Button onPress={() => setDialog(null)}>{t('Close')}</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={selectedOrder !== null} onDismiss={() => setSelectedOrder(null)}>
          <Dialog.Title>{selectedOrder ? `Order #${selectedOrder.id}` : 'Order details'}</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 460 }}>
            {selectedOrder && (
              <>
                {selectedOrder.products.map((item, index) => (
                  <List.Item
                    key={`${item.id}-${index}`}
                    title={item.title}
                    description={`Quantity: ${item.quantity}`}
                    right={() => <Text style={{ alignSelf: 'center' }}>${item.discountedTotal.toFixed(2)}</Text>}
                  />
                ))}
                {selectedOrder.deliveryTracking ? (
                  <View style={{ padding: 16 }}>
                    <Text style={{ color: colors.onSurface, fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
                      {t('Delivery tracking')}
                    </Text>
                    <Text style={{ color: colors.onSurfaceVariant, marginBottom: 4 }}>
                      {t('Tracking number')}: {selectedOrder.deliveryTracking.trackingNumber}
                    </Text>
                    <Text style={{ color: colors.onSurfaceVariant, marginBottom: 12 }}>
                      {t('Estimated delivery')}: {new Date(selectedOrder.deliveryTracking.estimatedDelivery).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                    </Text>
                    {DELIVERY_STATUSES.map((status, index) => {
                      const update = selectedOrder.deliveryTracking?.updates.find((item) => item.status === status);
                      const complete = index <= DELIVERY_STATUSES.indexOf(selectedOrder.deliveryTracking!.status);
                      return (
                        <View key={status} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                          <MaterialCommunityIcons
                            name={complete ? 'check-circle' : 'checkbox-blank-circle-outline'}
                            size={20}
                            color={complete ? colors.primary : colors.onSurfaceVariant}
                          />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={{ color: colors.onSurface, fontWeight: complete ? '600' : '400' }}>
                              {t(DELIVERY_STATUS_LABELS[status])}
                            </Text>
                            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
                              {update
                                ? new Date(update.timestamp).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')
                                : t('Awaiting update')}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                    <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
                      {t('Simulated tracking only')}
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            {selectedOrder?.deliveryTracking?.status !== 'delivered' && (
              <Button onPress={advanceSelectedOrder}>{t('Advance demo tracking')}</Button>
            )}
            <Button onPress={() => setSelectedOrder(null)}>{t('Close')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'addresses'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>{t('Delivery addresses')}</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 300 }}>
            {addresses.length ? addresses.map((address, index) => (
              <List.Item
                key={`${address}-${index}`}
                title={address}
                right={(props) => <MaterialCommunityIcons {...props} name="delete-outline" size={22} color="#EA4335" onPress={() => removeAddress(index)} />}
              />
            )) : <Text style={{ padding: 16, color: colors.onSurfaceVariant }}>{t('No saved addresses.')}</Text>}
          </Dialog.ScrollArea>
          <Dialog.Content>
            <TextInput label="New address" value={addressDraft} onChangeText={setAddressDraft} mode="outlined" multiline />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>{t('Close')}</Button>
            <Button onPress={addAddress}>Add address</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'payment'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Payment methods</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 260 }}>
            {paymentMethods.length ? paymentMethods.map((method, index) => (
              <List.Item
                key={`${method}-${index}`}
                title={method}
                right={(props) => <MaterialCommunityIcons {...props} name="delete-outline" size={22} color="#EA4335" onPress={async () => {
                  const updated = paymentMethods.filter((_, methodIndex) => methodIndex !== index);
                  try {
                    await AsyncStorage.setItem(storageKey('payments'), JSON.stringify(updated));
                    setPaymentMethods(updated);
                  } catch (error) {
                    console.error('Could not remove payment method:', error);
                    Alert.alert('Could not remove payment method', 'Please try again.');
                  }
                }} />}
              />
            )) : <Text style={{ padding: 16, color: colors.onSurfaceVariant }}>{t('No saved payment methods.')}</Text>}
          </Dialog.ScrollArea>
          <Dialog.Content>
            <TextInput label="Card label" value={paymentLabel} onChangeText={setPaymentLabel} mode="outlined" style={{ marginBottom: 10 }} />
            <TextInput label="Last four digits only" value={paymentLastFour} onChangeText={setPaymentLastFour} keyboardType="number-pad" maxLength={4} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>{t('Close')}</Button>
            <Button onPress={addPaymentMethod}>Save method</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'settings'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>{t('settings')}</Dialog.Title>
          <Dialog.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ flex: 1 }}>{t('orderNotifications')}</Text>
              <Switch value={settings.orderUpdates} onValueChange={toggleOrderUpdates} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ flex: 1 }}>{t('dealNotifications')}</Text>
              <Switch value={settings.dealUpdates} onValueChange={toggleDealUpdates} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ flex: 1 }}>{t('darkMode')}</Text>
              <Switch value={colorMode === 'dark'} onValueChange={changeColorMode} />
            </View>
            <Text style={{ marginBottom: 8 }}>{t('language')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button mode={language === 'en' ? 'contained' : 'outlined'} onPress={() => void changeLanguage('en')}>
                {t('english')}
              </Button>
              <Button mode={language === 'es' ? 'contained' : 'outlined'} onPress={() => void changeLanguage('es')}>
                {t('spanish')}
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions><Button onPress={() => setDialog(null)}>Done</Button></Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'wishlist'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Wishlist</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 420 }}>
            {wishlist.length ? wishlist.map((item) => (
              <List.Item
                key={item.id}
                title={item.title}
                description={`$${item.price.toFixed(2)}`}
                onPress={() => {
                  setDialog(null);
                  router.push(`/(app)/product/${item.id}`);
                }}
                right={(props) => <MaterialCommunityIcons {...props} name="delete-outline" size={22} color="#EA4335" onPress={() => removeFromWishlist(item.id)} />}
              />
            )) : <Text style={{ padding: 20, color: colors.onSurfaceVariant }}>Your wishlist is empty.</Text>}
          </Dialog.ScrollArea>
          <Dialog.Actions><Button onPress={() => setDialog(null)}>Close</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
