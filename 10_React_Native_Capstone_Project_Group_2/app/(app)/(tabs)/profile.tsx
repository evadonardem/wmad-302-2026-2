/**
 * Profile Screen - Marketplace
 * Completed implementation:
 * - Display and edit user information through the auth context and PUT /users/{id}
 * - View demo order/cart history through GET /carts/user/{id}
 * - Store delivery address, payment preference, and notification preference locally
 * - Display saved wishlist IDs and support logout
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, List, Avatar, Divider, Badge, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { favoritesStorage, getStorageItem, setStorageItem } from '@/utils/storage';
import type { Cart } from '@/types/product';
import { styles } from './profileStyles';

type ProfileDialog = 'edit' | 'address' | 'payment' | null;
interface ProfileSettings { address?: string; payment?: string; notifications?: boolean; }

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [dialog, setDialog] = useState<ProfileDialog>(null);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [entry, setEntry] = useState('');
  const [settings, setSettings] = useState<ProfileSettings>({});
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    getStorageItem<ProfileSettings>('user_settings').then((value) => setSettings(value || {}));
    favoritesStorage.getIds().then((ids) => setWishlistCount(ids.length));
  }, []);

 const handleLogout = () => {
  logout();
  router.replace('/(auth)/login');
};
  const handleEditProfile = () => {
    setFirstName(user?.firstName || ''); setLastName(user?.lastName || ''); setEmail(user?.email || ''); setDialog('edit');
  };
  const saveProfile = async () => {
    if (!user?.id || !firstName.trim() || !lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Check details', 'Enter your first name, last name, and a valid email address.'); return;
    }
    try {
      await productApi.updateUser(user.id, { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      Alert.alert('Profile updated', 'Your profile details were updated in the app and saved to your session.');
      setDialog(null);
    } catch (error) { Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again.'); }
  };
  const handleOrders = async () => {
    if (!user?.id) return;
    setOrdersLoading(true);
    try {
      const cart = await productApi.getUserCart(user.id) as Cart;
      setOrderCount(cart.totalProducts || 0);
      Alert.alert('Order History', cart.products?.length
        ? cart.products.map((item) => `${item.title} × ${item.quantity} — $${item.discountedTotal.toFixed(2)}`).join('\n')
        : 'No orders were found for this demo account.');
    } catch (error) { Alert.alert('Unable to load orders', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setOrdersLoading(false); }
  };
  const handleWishlist = async () => {
    const ids = await favoritesStorage.getIds();
    setWishlistCount(ids.length);
    Alert.alert('Wishlist', ids.length ? `You have ${ids.length} saved product(s). Product IDs: ${ids.join(', ')}` : 'Your wishlist is empty. Save products to see them here.');
  };
  const saveLocalSetting = async (key: 'address' | 'payment', value: string) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated); await setStorageItem('user_settings', updated); setDialog(null);
    Alert.alert('Saved', `${key === 'address' ? 'Delivery address' : 'Payment preference'} saved on this device.`);
  };
  const handleAddresses = () => { setEntry(settings.address || ''); setDialog('address'); };
  const handlePayment = () => { setEntry(settings.payment || ''); setDialog('payment'); };
  const handleSettings = () => Alert.alert('Settings', `Notifications: ${settings.notifications === false ? 'Off' : 'On'}\nTheme: Sky Blue\nPrivacy: Your preferences are stored on this device.`, [
    { text: 'Toggle Notifications', onPress: async () => { const updated = { ...settings, notifications: settings.notifications === false }; setSettings(updated); await setStorageItem('user_settings', updated); } },
    { text: 'Close', style: 'cancel' },
  ]);

  if (!isAuthenticated) return <View style={styles.centerContainer}><Text style={styles.notLoggedIn}>Please log in to view profile</Text><Button mode="contained" onPress={() => router.replace('/(auth)/login')}>Log In</Button></View>;

  return <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Image size={88} source={{ uri: user?.image || 'https://dummyjson.com/icon/emilys/150' }} style={styles.avatar} />
        <View style={styles.nameContainer}><Text style={styles.name}>{user?.firstName} {user?.lastName}</Text><Text style={styles.username}>@{user?.username}</Text><Text style={styles.email}>{user?.email}</Text></View>
      </View>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}><Text style={styles.statValue}>{orderCount}</Text><Text style={styles.statLabel}>Orders</Text></View>
        <View style={styles.statItem}><Text style={styles.statValue}>—</Text><Text style={styles.statLabel}>Spent</Text></View>
        <View style={styles.statItem}><Text style={styles.statValue}>{wishlistCount}</Text><Text style={styles.statLabel}>Wishlist</Text></View>
      </View>
      {/* Menu Sections */}
      <View style={styles.section}><Card style={styles.menuCard} elevation={1}><List.Section>
        <List.Item title="My Orders" description="Track and review demo orders" left={(props) => <View style={props.style}><MaterialCommunityIcons name="package-variant" size={24} color="#0284C7" /><Badge size={16} style={{ position: 'absolute', right: -4, top: -4 }}>{orderCount}</Badge></View>} right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#0284C7" style={props.style} />} onPress={handleOrders} />
        <Divider style={styles.divider} />
        <List.Item title="Wishlist" description="Saved items for later" left={(props) => <MaterialCommunityIcons name="heart" size={24} color="#0284C7" style={props.style} />} right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#0284C7" style={props.style} />} onPress={handleWishlist} />
        <Divider style={styles.divider} />
        <List.Item title="Addresses" description={settings.address || 'Manage delivery address'} left={(props) => <MaterialCommunityIcons name="map-marker" size={24} color="#0284C7" style={props.style} />} right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#0284C7" style={props.style} />} onPress={handleAddresses} />
        <Divider style={styles.divider} />
        <List.Item title="Payment Methods" description={settings.payment || 'Manage payment preference'} left={(props) => <MaterialCommunityIcons name="credit-card" size={24} color="#0284C7" style={props.style} />} right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#0284C7" style={props.style} />} onPress={handlePayment} />
      </List.Section></Card></View>
      <View style={styles.section}><Card style={styles.menuCard} elevation={1}><List.Section>
        <List.Item title="Edit Profile" description="Update your information" left={(props) => <MaterialCommunityIcons name="account-edit" size={24} color="#0284C7" style={props.style} />} right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#0284C7" style={props.style} />} onPress={handleEditProfile} />
        <Divider style={styles.divider} />
        <List.Item title="Settings" description="Notifications, theme, privacy" left={(props) => <MaterialCommunityIcons name="cog" size={24} color="#0284C7" style={props.style} />} right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#0284C7" style={props.style} />} onPress={handleSettings} />
      </List.Section></Card></View>
      {/* Logout Button */}
      <View style={styles.logoutContainer}><Button mode="contained" onPress={handleLogout} style={styles.logoutButton} contentStyle={styles.logoutButtonContent} icon="logout">Logout</Button></View>
      <View style={styles.version}><Text style={styles.versionText}>Marketplace v1.0.0 · Sky Blue</Text></View>
    </ScrollView>
    <Portal><Dialog visible={dialog !== null} onDismiss={() => setDialog(null)}>
      <Dialog.Title>{dialog === 'edit' ? 'Edit Profile' : dialog === 'address' ? 'Delivery Address' : 'Payment Preference'}</Dialog.Title>
      <Dialog.Content>
        {dialog === 'edit' ? <><TextInput label="First name" value={firstName} onChangeText={setFirstName} mode="outlined" /><TextInput label="Last name" value={lastName} onChangeText={setLastName} mode="outlined" style={{ marginTop: 10 }} /><TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={{ marginTop: 10 }} /></> : <TextInput label={dialog === 'address' ? 'Full delivery address' : 'e.g. Cash on Delivery, GCash'} value={entry} onChangeText={setEntry} mode="outlined" multiline />}
      </Dialog.Content>
      <Dialog.Actions><Button onPress={() => setDialog(null)}>Cancel</Button><Button onPress={() => dialog === 'edit' ? saveProfile() : dialog ? saveLocalSetting(dialog, entry.trim()) : undefined}>Save</Button></Dialog.Actions>
    </Dialog></Portal>
  </>;
}
