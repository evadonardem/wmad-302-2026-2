import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Avatar, Badge, Button, Card, Dialog, Divider, List, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import ProductRecommendations from '@/components/ProductRecommendations';
import { MarketplaceOrder, ordersStorage } from '@/utils/marketplaceStorage';
import { styles } from './profileStyles';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { favoriteIds } = useFavorites();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    ordersStorage.getAll()
      .then((savedOrders) => {
        if (active) setOrders(savedOrders);
      })
      .catch((error: unknown) => {
        Alert.alert('Could not load order summary', error instanceof Error ? error.message : 'Please try again.');
      });
    return () => { active = false; };
  }, []));

  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view your account.</Text>
      </View>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar.Image
          size={82}
          source={{ uri: user?.image || 'https://dummyjson.com/icon/emilys/128' }}
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Button compact textColor="#75648A" onPress={() => router.push('/(app)/edit-profile')}>
          Edit
        </Button>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Demo spend</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoriteIds.length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="My Orders"
              description="View order status and details"
              left={(props) => (
                <View style={props.style}>
                  <MaterialCommunityIcons name="package-variant" size={24} color="#75648A" />
                  {orders.length > 0 && (
                    <Badge size={16} style={{ position: 'absolute', right: -4, top: -4 }}>
                      {orders.length}
                    </Badge>
                  )}
                </View>
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#777" style={props.style} />}
              onPress={() => router.push('/(app)/orders')}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Wishlist"
              description="Products saved for later"
              left={(props) => <MaterialCommunityIcons name="heart" size={24} color="#75648A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#777" style={props.style} />}
              onPress={() => router.push('/(app)/wishlist')}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Delivery addresses"
              description="Manage saved shipping addresses"
              left={(props) => <MaterialCommunityIcons name="map-marker" size={24} color="#75648A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#777" style={props.style} />}
              onPress={() => router.push('/(app)/addresses')}
            />
          </List.Section>
        </Card>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="Settings & payments"
              description="Notifications and demo payment info"
              left={(props) => <MaterialCommunityIcons name="cog" size={24} color="#75648A" style={props.style} />}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#777" style={props.style} />}
              onPress={() => router.push('/(app)/settings')}
            />
          </List.Section>
        </Card>
      </View>

      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          textColor="#59486F"
          icon="logout"
        >
          Logout
        </Button>
      </View>

      <ProductRecommendations />

      <Text style={styles.versionText}>Kartora · You Shop. We Deliver.</Text>
      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
          style={styles.logoutDialog}
        >
          <Dialog.Content>
            <View style={styles.logoutDialogHeader}>
              <View style={styles.logoutDialogIcon}>
                <MaterialCommunityIcons name="logout" size={23} color="#B4233C" />
              </View>
              <View style={styles.logoutDialogHeading}>
                <Text style={styles.logoutDialogEyebrow}>ACCOUNT</Text>
                <Text style={styles.logoutDialogTitle}>Log out?</Text>
              </View>
            </View>
            <Text style={styles.logoutDialogMessage}>
              You will need to sign in again to access your account.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.logoutDialogActions}>
            <Button
              mode="outlined"
              textColor="#75648A"
              onPress={() => setLogoutDialogVisible(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              buttonColor="#B4233C"
              onPress={() => {
                setLogoutDialogVisible(false);
                logout();
              }}
            >
              Log out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
