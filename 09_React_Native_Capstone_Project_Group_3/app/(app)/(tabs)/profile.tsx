/**
 * Profile Screen - Cookbook
 * User info, live stats, navigation to edit profile / settings / my recipes, logout.
 */
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Avatar, Button, Card, Divider, List, Text, useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAllRecipes } from '@/hooks';
import { reviewsStorage } from '@/utils/storage';
import { ConfirmDialog } from '@/components/ConfirmDialog';

function StatItem({ value, label }: { value: number; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.statItem}>
      <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
        {value}
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { count: favoriteCount } = useFavorites();
  const { recipes } = useAllRecipes();
  const [reviewCount, setReviewCount] = useState(0);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Refresh the review count whenever the tab gains focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        reviewsStorage.countByUser(user.id).then(setReviewCount).catch(() => undefined);
      }
    }, [user])
  );

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge">Please log in to view your profile</Text>
      </View>
    );
  }

  const myRecipeCount = recipes.filter((recipe) => recipe.userId === user.id).length;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const handleLogout = async () => {
    setConfirmLogout(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const chevron = () => <List.Icon icon="chevron-right" />;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {user.image ? (
          <Avatar.Image size={88} source={{ uri: user.image }} />
        ) : (
          <Avatar.Text size={88} label={initials} />
        )}
        <View style={styles.names}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
            @{user.username}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {user.email}
          </Text>
        </View>
      </View>

      <Card style={[styles.stats, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.statsRow}>
          <StatItem value={myRecipeCount} label="Recipes" />
          <StatItem value={favoriteCount} label="Favorites" />
          <StatItem value={reviewCount} label="Reviews" />
        </View>
      </Card>

      <Card style={[styles.menu, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <List.Item
          title="My Recipes"
          description="Recipes you've created"
          left={(props) => <List.Icon {...props} icon="book-edit" color={theme.colors.primary} />}
          right={chevron}
          onPress={() => router.push('/(app)/my-recipes')}
        />
        <Divider />
        <List.Item
          title="Favorites"
          description="Your saved recipes"
          left={(props) => <List.Icon {...props} icon="heart" color={theme.colors.primary} />}
          right={chevron}
          onPress={() => router.push('/(app)/(tabs)/favorites')}
        />
      </Card>

      <Card style={[styles.menu, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <List.Item
          title="Edit Profile"
          description="Update your information"
          left={(props) => <List.Icon {...props} icon="account-edit" color={theme.colors.primary} />}
          right={chevron}
          onPress={() => router.push('/(app)/edit-profile')}
        />
        <Divider />
        <List.Item
          title="Settings"
          description="Theme, notifications, data"
          left={(props) => <List.Icon {...props} icon="cog" color={theme.colors.primary} />}
          right={chevron}
          onPress={() => router.push('/(app)/settings')}
        />
      </Card>

      <Button
        mode="outlined"
        icon="logout"
        onPress={() => setConfirmLogout(true)}
        style={styles.logout}
        testID="logout-button"
      >
        Logout
      </Button>

      <Text variant="bodySmall" style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
        Cookbook v1.0.0
      </Text>

      <ConfirmDialog
        visible={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 },
  names: { marginLeft: 16, flex: 1 },
  stats: { marginBottom: 16, borderRadius: 16 },
  statsRow: { flexDirection: 'row', paddingVertical: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  menu: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  logout: { marginTop: 8, borderRadius: 12 },
  version: { textAlign: 'center', marginTop: 20 },
});
