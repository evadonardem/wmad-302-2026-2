/**
 * Profile Screen
 * User info, order stats, and links to orders / addresses / edit profile / settings.
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Badge, Button, Card, Divider, List, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useAddresses } from '@/context/AddressContext';
import { useOrders } from '@/hooks/useOrders';
import { ConfirmDialog } from '@/components/CommonComponents';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { formatCurrency } from '@/utils/pricing';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { addresses } = useAddresses();
  const { stats } = useOrders();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    setConfirmLogout(false);
    // Navigate first so the auth guard doesn't re-route with a "redirect back to profile"
    router.replace('/(auth)/login');
    await logout();
  };

  const menuItem = (title: string, description: string, icon: IconName, onPress: () => void, badge?: number) => (
    <List.Item
      title={title}
      description={description}
      left={(props) => (
        <View style={props.style}>
          <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
          {badge !== undefined && badge > 0 && <Badge size={16} style={styles.menuBadge}>{badge}</Badge>}
        </View>
      )}
      right={(props) => (
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} style={props.style} />
      )}
      onPress={onPress}
    />
  );

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          {user?.image ? (
            <Avatar.Image size={88} source={{ uri: user.image }} />
          ) : (
            <Avatar.Text size={88} label={initials} />
          )}
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[styles.username, { color: theme.colors.primary }]}>@{user?.username}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{user?.email}</Text>
          </View>
        </View>

        <View style={[styles.stats, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{stats.count}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Orders</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{formatCurrency(stats.spent)}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Spent</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{addresses.length}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Addresses</Text>
          </View>
        </View>

        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            {menuItem('My Orders', 'Track and review your orders', 'package-variant', () => router.push('/(app)/orders'), stats.count)}
            <Divider />
            {menuItem('Addresses', 'Manage delivery addresses', 'map-marker', () => router.push('/(app)/addresses'))}
          </List.Section>
        </Card>

        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            {menuItem('Edit Profile', 'Update your information', 'account-edit', () => router.push('/(app)/edit-profile'))}
            <Divider />
            {menuItem('Settings', 'Notifications and preferences', 'cog', () => router.push('/(app)/settings'))}
          </List.Section>
        </Card>

        <Button
          mode="outlined"
          icon="logout"
          textColor={theme.colors.error}
          style={styles.logout}
          onPress={() => setConfirmLogout(true)}
        >
          Logout
        </Button>

        <Text style={[styles.version, { color: theme.colors.outline }]}>Marketplace v1.0.0</Text>
      </View>

      <ConfirmDialog
        visible={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        destructive
        onDismiss={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: 16 },
  nameContainer: { marginLeft: spacing.lg, flex: 1 },
  name: { fontSize: 20, fontWeight: '800' },
  username: { fontSize: 14, fontWeight: '600', marginVertical: 2 },
  stats: { flexDirection: 'row', borderRadius: 16, paddingVertical: spacing.lg, marginTop: spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statDivider: { width: StyleSheet.hairlineWidth },
  menuCard: { marginTop: spacing.md, borderRadius: 16, overflow: 'hidden' },
  menuBadge: { position: 'absolute', right: -6, top: -6 },
  logout: { marginTop: spacing.lg },
  version: { textAlign: 'center', marginTop: spacing.lg, fontSize: 12 },
});
