/**
 * Profile Screen - Cookbook
 * Still TODO (features, not bugs): real profile stats.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useFavorites } from '@/context/FavoritesContext';
import { recipeApi } from '@/services/recipeApi';
import { Card, Button, List, Avatar, Divider } from 'react-native-paper';
import { getProfileStyles } from './profileStyles';

// Alert.alert with buttons does nothing on react-native-web, so use the browser's dialogs there.
type WebDialogs = { confirm?: (message: string) => boolean };
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const userId = user?.id;
  const { settings } = useSettings();
  const { count: favoriteCount, isLoaded: favoritesLoaded } = useFavorites();
  const styles = getProfileStyles(settings.darkModeEnabled);
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [collectionCount, setCollectionCount] = useState<number | null>(null);
  const [statsError, setStatsError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || userId == null) return;
      let cancelled = false;
      setRecipeCount(null);
      setCollectionCount(null);
      setStatsError(false);

      const loadProfileCounts = async () => {
        const [recipesResult, cookbookResult] = await Promise.allSettled([
          recipeApi.getRecipes({ limit: 0 }),
          AsyncStorage.getItem(`user_cookbook:${userId}`),
        ]);
        if (cancelled) return;

        let failed = false;
        if (recipesResult.status === 'fulfilled') {
          setRecipeCount(
            recipesResult.value.recipes.filter((recipe) => recipe.userId === userId).length
          );
        } else {
          console.error('Failed to load profile recipe count:', recipesResult.reason);
          failed = true;
        }

        if (cookbookResult.status === 'fulfilled') {
          try {
            const raw: unknown = cookbookResult.value
              ? JSON.parse(cookbookResult.value)
              : { collections: [] };
            const collections =
              typeof raw === 'object' &&
              raw !== null &&
              !Array.isArray(raw) &&
              Array.isArray((raw as Record<string, unknown>).collections)
                ? (raw as { collections: unknown[] }).collections
                : [];
            setCollectionCount(
              collections.filter(
                (collection) =>
                  typeof collection === 'object' &&
                  collection !== null &&
                  !Array.isArray(collection) &&
                  typeof (collection as Record<string, unknown>).id === 'string' &&
                  typeof (collection as Record<string, unknown>).name === 'string' &&
                  Array.isArray((collection as Record<string, unknown>).recipeIds)
              ).length
            );
          } catch (error) {
            console.error('Failed to read profile collection count:', error);
            failed = true;
          }
        } else {
          console.error('Failed to load profile collection count:', cookbookResult.reason);
          failed = true;
        }

        setStatsError(failed);
      };

      void loadProfileCounts();
      return () => {
        cancelled = true;
      };
    }, [isAuthenticated, userId])
  );

  const handleLogout = () => {
    confirmAction('Logout', 'Are you sure you want to logout?', 'Logout', logout);
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleMyRecipes = () => {
    router.push('/my-recipes');
  };

  const handleCookbook = () => {
    router.push('/my-cookbook');
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
          <Text style={styles.statValue}>{recipeCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoritesLoaded ? favoriteCount : '…'}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collectionCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Collections</Text>
        </View>
      </View>
      {statsError && (
        <Text style={styles.statsError}>
          Some counts couldn’t be loaded. Reopen Profile to try again.
        </Text>
      )}

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