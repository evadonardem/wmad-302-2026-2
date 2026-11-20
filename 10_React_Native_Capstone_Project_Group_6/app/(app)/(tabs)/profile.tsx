/**
 * Profile Screen - Marketplace
 * - User info from the auth context
 * - Real Orders / Spent numbers (same sources as Order History)
 * - Menu: My Orders, Addresses, Payment (default, in Settings), Edit Profile, Settings
 * - Logout (confirmation dialog)
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { Card, Button, List, Avatar, Divider, Badge, Dialog, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productApi } from '@/services/productApi';
import { Order } from '@/types/product';
import { apiCartToOrder, belongsToUser } from '@/utils/orders';
import { computeOrderStats } from '@/utils/profile';
import { orderStorage } from '@/utils/storage';
import { createStyles } from './profileStyles';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { count: wishlistCount } = useWishlist();

  // Alert.alert does nothing in the browser, so the confirmation is a Paper Dialog
  // (works on web and phone)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [stats, setStats] = useState({ count: 0, spent: 0 });

  // Count the orders again every time this tab comes into view (e.g. after checkout).
  // Same sources as Order History: orders saved in the app + DummyJSON past orders.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;

      const loadStats = async () => {
        const saved = (await orderStorage.getOrders().catch(() => [] as Order[])).filter((o) =>
          belongsToUser(o, user)
        );
        let past: Order[] = [];
        if (!user.isSimulated) {
          try {
            const response = await productApi.getUserCarts(user.id);
            past = response.carts.map(apiCartToOrder);
          } catch {
            // Offline: just count the saved orders
          }
        }
        if (!cancelled) setStats(computeOrderStats([...saved, ...past]));
      };

      void loadStats();
      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const handleLogout = () => setShowLogoutDialog(true);

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout(); // clears the saved session; the route guard then sends you to Login
  };

  const handleEditProfile = () => {
    router.push('/(app)/edit-profile');
  };

  const handleOrders = () => {
    router.push('/(app)/orders');
  };

  const handleAddresses = () => {
    router.push('/(app)/addresses');
  };

  // The default payment method is chosen in Settings
  const handlePayment = () => {
    router.push('/(app)/settings');
  };

  const handleSettings = () => {
    router.push('/(app)/settings');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Image
          size={88}
          source={{ uri: user?.image || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.count}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${stats.spent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wishlistCount}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="My Orders"
              description="Track and manage orders"
              left={(props) => (
                <View style={props.style}>
                  <MaterialCommunityIcons name="package-variant" size={24} color={colors.primary} />
                  {stats.count > 0 ? (
                    <Badge size={16} style={{ position: 'absolute', right: -4, top: -4 }}>
                      {stats.count}
                    </Badge>
                  ) : null}
                </View>
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} style={props.style} />}
              onPress={handleOrders}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Wishlist"
              description="Saved items for later"
              left={(props) => (
                <MaterialCommunityIcons name="heart" size={24} color={colors.primary} style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} style={props.style} />}
              onPress={() => router.push('/(app)/wishlist')}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Addresses"
              description="Manage delivery addresses"
              left={(props) => (
                <MaterialCommunityIcons name="map-marker" size={24} color={colors.primary} style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} style={props.style} />}
              onPress={handleAddresses}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Payment Methods"
              description="Choose your default payment"
              left={(props) => (
                <MaterialCommunityIcons name="credit-card" size={24} color={colors.primary} style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} style={props.style} />}
              onPress={handlePayment}
            />
          </List.Section>
        </Card>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="Edit Profile"
              description="Update your information"
              left={(props) => (
                <MaterialCommunityIcons name="account-edit" size={24} color={colors.primary} style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} style={props.style} />}
              onPress={handleEditProfile}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Settings"
              description="Notifications, theme, privacy"
              left={(props) => (
                <MaterialCommunityIcons name="cog" size={24} color={colors.primary} style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} style={props.style} />}
              onPress={handleSettings}
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

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={confirmLogout} textColor={colors.error}>
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}