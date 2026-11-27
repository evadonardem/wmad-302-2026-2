/**
 * Profile Screen - Marketplace
 * User info, Edit Profile (PUT /users/{id}), Order History (GET /carts/user/{id}),
 * Saved Addresses, Wishlist, Settings, and Logout
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Switch,
  TextInput as PaperTextInput,
  Title,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productApi } from '@/services/productApi';
import { addressStorage, orderStorage } from '@/utils/storage';
import { Cart } from '@/types/product';
import { UserAddress } from '@/types/auth';
import { styles } from './profileStyles';

type ActiveModal = 'orders' | 'edit' | 'addresses' | 'settings' | null;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const { wishlistIds } = useCart();

  const [orders, setOrders] = useState<Cart[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Cart | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Edit profile form state
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Saved addresses state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostal, setNewPostal] = useState('');

  // Settings toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const loadOrdersAndAddresses = useCallback(async () => {
    if (!user?.id) return;
    setLoadingOrders(true);
    try {
      const [localOrders, savedAddresses] = await Promise.all([
        orderStorage.getOrders(),
        addressStorage.getAddresses(),
      ]);

      let apiOrders: Cart[] = [];
      try {
        const res = await productApi.getUserCarts(user.id);
        apiOrders = res.carts ?? [];
      } catch {
        // Fallback cleanly if user ID is a locally registered mock ID
        apiOrders = [];
      }

      const seenIds = new Set(localOrders.map((o) => o.id));
      const mergedOrders = [
        ...localOrders,
        ...apiOrders.filter((o) => !seenIds.has(o.id)),
      ];
      setOrders(mergedOrders);

      if (savedAddresses.length > 0) {
        setAddresses(savedAddresses);
      } else if (user.address) {
        setAddresses([user.address]);
      }
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    void loadOrdersAndAddresses();
  }, [user, loadOrdersAndAddresses]);

  const handleLogout = () => {
    const performLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        void performLogout();
      }
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showAlert('Validation Error', 'First name, last name, and email are required.');
      return;
    }
    try {
      setSavingProfile(true);
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      setActiveModal(null);
      showAlert('Saved', 'Your profile has been updated.');
    } catch (err) {
      showAlert(
        'Update Failed',
        err instanceof Error ? err.message : 'Could not update profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newStreet.trim() || !newCity.trim()) {
      showAlert('Validation Error', 'Street and city are required.');
      return;
    }
    const created: UserAddress = {
      address: newStreet.trim(),
      city: newCity.trim(),
      state: 'Metro',
      postalCode: newPostal.trim() || '0000',
      country: 'Philippines',
    };
    const next = [...addresses, created];
    setAddresses(next);
    await addressStorage.setAddresses(next);
    setNewStreet('');
    setNewCity('');
    setNewPostal('');
  };

  const handleRemoveAddress = async (index: number) => {
    const next = addresses.filter((_, i) => i !== index);
    setAddresses(next);
    await addressStorage.setAddresses(next);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view profile</Text>
      </View>
    );
  }

  const totalSpent = orders.reduce(
    (sum, order) => sum + (order.discountedTotal ?? order.total ?? 0),
    0
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Image
          size={88}
          source={{ uri: user.image || 'https://dummyjson.com/icon/user/128' }}
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wishlistIds.length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
      </View>

      {/* Account Menu */}
      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="My Orders"
              description="View order history and receipts"
              left={(props) => (
                <View style={props.style}>
                  <MaterialCommunityIcons name="package-variant" size={24} color="#1A73E8" />
                  {orders.length > 0 && (
                    <Badge size={16} style={{ position: 'absolute', right: -4, top: -4 }}>
                      {orders.length}
                    </Badge>
                  )}
                </View>
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#5F6368"
                  style={props.style}
                />
              )}
              onPress={() => {
                setSelectedOrder(null);
                setActiveModal('orders');
              }}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Wishlist"
              description={`${wishlistIds.length} saved item(s)`}
              left={(props) => (
                <MaterialCommunityIcons
                  name="heart"
                  size={24}
                  color="#1A73E8"
                  style={props.style}
                />
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#5F6368"
                  style={props.style}
                />
              )}
              onPress={() => {
                if (wishlistIds.length > 0) {
                  router.push(`/product/${wishlistIds[0]}`);
                } else {
                  showAlert('Wishlist Empty', 'Tap the heart icon on any product to save it.');
                }
              }}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Addresses"
              description={`${addresses.length} saved delivery address(es)`}
              left={(props) => (
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="#1A73E8"
                  style={props.style}
                />
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#5F6368"
                  style={props.style}
                />
              )}
              onPress={() => setActiveModal('addresses')}
            />
          </List.Section>
        </Card>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="Edit Profile"
              description="Update your name, email, and phone"
              left={(props) => (
                <MaterialCommunityIcons
                  name="account-edit"
                  size={24}
                  color="#1A73E8"
                  style={props.style}
                />
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#5F6368"
                  style={props.style}
                />
              )}
              onPress={() => setActiveModal('edit')}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Settings"
              description="Notifications and account preferences"
              left={(props) => (
                <MaterialCommunityIcons
                  name="cog"
                  size={24}
                  color="#1A73E8"
                  style={props.style}
                />
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#5F6368"
                  style={props.style}
                />
              )}
              onPress={() => setActiveModal('settings')}
            />
          </List.Section>
        </Card>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          icon="logout"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Button>
      </View>

      <View style={styles.version}>
        <Text style={styles.versionText}>Marketplace v1.0.0</Text>
      </View>

      {/* Modal for Orders / Edit Profile / Addresses / Settings */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Title style={modalStyles.headerTitle}>
              {activeModal === 'orders' && (selectedOrder ? `Order #${selectedOrder.id}` : 'My Orders')}
              {activeModal === 'edit' && 'Edit Profile'}
              {activeModal === 'addresses' && 'Delivery Addresses'}
              {activeModal === 'settings' && 'Settings'}
            </Title>
            <IconButton icon="close" onPress={() => setActiveModal(null)} />
          </View>

          <ScrollView contentContainerStyle={modalStyles.body}>
            {activeModal === 'orders' && (
              <>
                {loadingOrders ? (
                  <ActivityIndicator size="large" color="#1A73E8" />
                ) : selectedOrder ? (
                  <Card style={modalStyles.card}>
                    <Card.Content>
                      <Text style={modalStyles.boldText}>
                        {`Order #${selectedOrder.id} · ${selectedOrder.totalQuantity} items`}
                      </Text>
                      <Divider style={{ marginVertical: 10 }} />
                      {selectedOrder.products.map((p) => (
                        <View key={`${selectedOrder.id}-${p.id}`} style={modalStyles.orderLine}>
                          <Text style={{ flex: 1 }}>
                            {p.title} × {p.quantity}
                          </Text>
                          <Text style={{ fontWeight: '600' }}>
                            ${(p.discountedTotal ?? p.price * p.quantity).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                      <Divider style={{ marginVertical: 10 }} />
                      <Text style={modalStyles.totalText}>
                        Total Paid: ${(selectedOrder.discountedTotal ?? selectedOrder.total).toFixed(2)}
                      </Text>
                      <Button
                        mode="outlined"
                        onPress={() => setSelectedOrder(null)}
                        style={{ marginTop: 14 }}
                      >
                        Back to All Orders
                      </Button>
                    </Card.Content>
                  </Card>
                ) : orders.length === 0 ? (
                  <Text style={modalStyles.mutedText}>No orders yet.</Text>
                ) : (
                  orders.map((ord) => (
                    <Card
                      key={ord.id.toString()}
                      style={modalStyles.card}
                      onPress={() => setSelectedOrder(ord)}
                    >
                      <Card.Content>
                        <View style={modalStyles.orderLine}>
                          <Text style={modalStyles.boldText}>Order #{ord.id}</Text>
                          <Text style={{ color: '#1A73E8', fontWeight: '700' }}>
                            ${(ord.discountedTotal ?? ord.total).toFixed(2)}
                          </Text>
                        </View>
                        <Text style={modalStyles.mutedText}>
                          {`${ord.totalProducts} product(s) · ${ord.totalQuantity} item(s) — Tap for details`}
                        </Text>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </>
            )}

            {activeModal === 'edit' && (
              <Card style={modalStyles.card}>
                <Card.Content>
                  <PaperTextInput
                    mode="outlined"
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={modalStyles.input}
                  />
                  <PaperTextInput
                    mode="outlined"
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    style={modalStyles.input}
                  />
                  <PaperTextInput
                    mode="outlined"
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={modalStyles.input}
                  />
                  <PaperTextInput
                    mode="outlined"
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={modalStyles.input}
                  />
                  <Button
                    mode="contained"
                    onPress={handleSaveProfile}
                    loading={savingProfile}
                    disabled={savingProfile}
                  >
                    Save Changes
                  </Button>
                </Card.Content>
              </Card>
            )}

            {activeModal === 'addresses' && (
              <>
                {addresses.map((addr, idx) => (
                  <Card key={`${addr.address}-${idx}`} style={modalStyles.card}>
                    <Card.Content style={modalStyles.orderLine}>
                      <View style={{ flex: 1 }}>
                        <Text style={modalStyles.boldText}>{addr.address}</Text>
                        <Text style={modalStyles.mutedText}>
                          {`${addr.city}, ${addr.postalCode} (${addr.country})`}
                        </Text>
                      </View>
                      <IconButton
                        icon="delete-outline"
                        iconColor="#EA4335"
                        onPress={() => void handleRemoveAddress(idx)}
                      />
                    </Card.Content>
                  </Card>
                ))}

                <Card style={modalStyles.card}>
                  <Card.Content>
                    <Text style={[modalStyles.boldText, { marginBottom: 8 }]}>
                      Add New Address
                    </Text>
                    <PaperTextInput
                      mode="outlined"
                      label="Street Address"
                      value={newStreet}
                      onChangeText={setNewStreet}
                      style={modalStyles.input}
                    />
                    <PaperTextInput
                      mode="outlined"
                      label="City"
                      value={newCity}
                      onChangeText={setNewCity}
                      style={modalStyles.input}
                    />
                    <PaperTextInput
                      mode="outlined"
                      label="Postal Code"
                      value={newPostal}
                      onChangeText={setNewPostal}
                      style={modalStyles.input}
                    />
                    <Button mode="contained" onPress={() => void handleAddAddress()}>
                      Save Address
                    </Button>
                  </Card.Content>
                </Card>
              </>
            )}

            {activeModal === 'settings' && (
              <Card style={modalStyles.card}>
                <Card.Content>
                  <View style={modalStyles.settingRow}>
                    <Text style={modalStyles.boldText}>Promotional Notifications</Text>
                    <Switch value={pushNotifications} onValueChange={setPushNotifications} />
                  </View>
                  <Divider style={{ marginVertical: 12 }} />
                  <View style={modalStyles.settingRow}>
                    <Text style={modalStyles.boldText}>Order Status Alerts</Text>
                    <Switch value={orderUpdates} onValueChange={setOrderUpdates} />
                  </View>
                </Card.Content>
              </Card>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#202124' },
  body: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12 },
  input: { marginBottom: 12, backgroundColor: '#FFFFFF' },
  boldText: { fontSize: 15, fontWeight: '700', color: '#202124' },
  mutedText: { fontSize: 13, color: '#5F6368', marginTop: 4 },
  totalText: { fontSize: 16, fontWeight: '700', color: '#1A73E8' },
  orderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});