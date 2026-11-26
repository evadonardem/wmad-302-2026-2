/**
 * Profile Screen
 * Shows the signed-in user, order stats and links to orders, addresses,
 * edit profile, settings and logout.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Avatar, Button, Card, Divider, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ordersStorage } from '@/utils/storage';
import { styles } from './profileStyles';

interface MenuItem {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  href: string;
}

const MENU: MenuItem[] = [
  { title: 'My Orders', description: 'Track and review your orders', icon: 'package-variant', href: '/(app)/orders' },
  { title: 'Addresses', description: 'Manage delivery addresses', icon: 'map-marker', href: '/(app)/addresses' },
  { title: 'Edit Profile', description: 'Update your information', icon: 'account-edit', href: '/(app)/edit-profile' },
  { title: 'Settings', description: 'Manage data on this device', icon: 'cog', href: '/(app)/settings' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { totals } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const [spent, setSpent] = useState(0);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Refresh stats whenever the tab gains focus (e.g. after placing an order)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      ordersStorage
        .getForUser(user.id)
        .then((orders) => {
          setOrderCount(orders.length);
          setSpent(orders.reduce((sum, o) => sum + o.total, 0));
        })
        .catch(() => undefined);
    }, [user])
  );

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view profile</Text>
      </View>
    );
  }

  const renderMenuItem = (item: MenuItem, index: number) => (
    <React.Fragment key={item.title}>
      {index > 0 && <Divider style={styles.divider} />}
      <List.Item
        title={item.title}
        description={item.description}
        left={(props) => <MaterialCommunityIcons name={item.icon} size={24} color="#1A73E8" style={props.style} />}
        right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#5F6368" style={props.style} />}
        onPress={() => router.push(item.href)}
      />
    </React.Fragment>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar.Image size={88} source={{ uri: user.image }} style={styles.avatar} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orderCount}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${spent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totals.totalQuantity}</Text>
          <Text style={styles.statLabel}>In cart</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>{MENU.map(renderMenuItem)}</List.Section>
        </Card>
      </View>

      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={() => setConfirmLogout(true)}
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

      <ConfirmDialog
        visible={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        destructive
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />
    </ScrollView>
  );
}
