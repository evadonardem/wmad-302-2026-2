/**
 * Profile Screen - Cookbook
 * Still TODO (features, not bugs): edit profile (PUT /users/{id}), real stats,
 * settings, my recipes, personal cookbook.
 */
import React from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, List, Avatar, Divider } from 'react-native-paper';
import { styles } from './profileStyles';

// Alert.alert with buttons does nothing on react-native-web, so use the browser's dialogs there.
type WebDialogs = { confirm?: (message: string) => boolean; alert?: (message: string) => void };
const webDialogs = globalThis as unknown as WebDialogs;

function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (webDialogs.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    webDialogs.alert?.(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    confirmAction('Logout', 'Are you sure you want to logout?', 'Logout', logout);
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    notify('TODO', 'Implement edit profile: PUT /users/{id}');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings
    notify('TODO', 'Implement settings screen');
  };

  const handleMyRecipes = () => {
    // TODO: Navigate to user's created recipes
    notify('TODO', 'Implement my recipes screen');
  };

  const handleCookbook = () => {
    // TODO: Navigate to personal cookbook/collections
    notify('TODO', 'Implement personal cookbook');
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
        {user?.image ? (
          <Avatar.Image size={88} source={{ uri: user.image }} style={styles.avatar} />
        ) : (
          <Avatar.Icon size={88} icon="account" style={styles.avatar} color="#E85D04" />
        )}
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
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Collections</Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="My Recipes"
              description="Recipes you've created"
              left={(props) => <List.Icon {...props} icon="book-edit" color="#E85D04" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#8D6E63" />}
              onPress={handleMyRecipes}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="My Cookbook"
              description="Personal collections & meal plans"
              left={(props) => <List.Icon {...props} icon="book-open-variant" color="#E85D04" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#8D6E63" />}
              onPress={handleCookbook}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Favorites"
              description="Your saved recipes"
              left={(props) => <List.Icon {...props} icon="heart" color="#E85D04" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#8D6E63" />}
              onPress={() => router.push('/(app)/(tabs)/favorites')}
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
              left={(props) => <List.Icon {...props} icon="account-edit" color="#E85D04" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#8D6E63" />}
              onPress={handleEditProfile}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Settings"
              description="Notifications, theme, privacy"
              left={(props) => <List.Icon {...props} icon="cog" color="#E85D04" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#8D6E63" />}
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
        <Text style={styles.versionText}>Cookbook v1.0.0</Text>
      </View>
    </ScrollView>
  );
}