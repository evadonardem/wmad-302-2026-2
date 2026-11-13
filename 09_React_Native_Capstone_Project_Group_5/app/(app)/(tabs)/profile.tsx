/**
 * Profile Screen - Cookbook
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, List, Avatar, Divider, Dialog, Portal, TextInput, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeApi } from '@/services/recipeApi';
import { favoritesStorage, getStorageItem, setStorageItem } from '@/utils/storage';
import { styles } from './profileStyles';

interface ProfilePreferences {
  showRecipeRatings: boolean;
  showNutritionInfo: boolean;
}

const DEFAULT_PREFERENCES: ProfilePreferences = {
  showRecipeRatings: true,
  showNutritionInfo: true,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, refreshUser, updateProfile } = useAuth();
  const [counts, setCounts] = useState({ recipes: 0, favorites: 0, categories: 0 });
  const [editVisible, setEditVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const loadProfileData = useCallback(async () => {
    try {
      const [recipes, favorites, categories, storedPreferences] = await Promise.all([
        recipeApi.getRecipes({ limit: 1 }),
        favoritesStorage.getIds(),
        recipeApi.getCategories(),
        getStorageItem<ProfilePreferences>('user_settings'),
      ]);
      setCounts({ recipes: recipes.total, favorites: favorites.length, categories: categories.length });
      setPreferences({ ...DEFAULT_PREFERENCES, ...storedPreferences });
    } catch {
      setSettingsError('Unable to load some profile data. Pull down to retry.');
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshUser();
    void loadProfileData();
  }, [loadProfileData, refreshUser]));

  const handleLogout = () => {
    setLogoutVisible(true);
  };

  const handleEditProfile = () => {
    setEditForm({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    });
    setProfileError('');
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    const firstName = editForm.firstName.trim();
    const lastName = editForm.lastName.trim();
    const email = editForm.email.trim().toLowerCase();
    if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError('Enter your first name, last name, and a valid email address.');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    try {
      await updateProfile({ firstName, lastName, email });
      setEditVisible(false);
    } catch {
      setProfileError('Your profile could not be saved. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettings = () => {
    setSettingsError('');
    setSettingsVisible(true);
  };

  const updatePreference = async (key: keyof ProfilePreferences, value: boolean) => {
    const nextPreferences = { ...preferences, [key]: value };
    setPreferences(nextPreferences);
    try {
      await setStorageItem('user_settings', nextPreferences);
      setSettingsError('');
    } catch {
      setSettingsError('Unable to save this preference. Please try again.');
    }
  };

  const handleMyRecipes = () => {
    router.push({ pathname: '/(app)/(tabs)/search', params: { view: 'all' } });
  };

  const handleCookbook = () => {
    router.push('/(app)/(tabs)/favorites');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view profile</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit profile" onPress={handleEditProfile}>
          {user?.image ? (
            <Avatar.Image size={88} source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <Avatar.Text
              size={88}
              label={`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`}
              style={styles.avatar}
            />
          )}
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.statItem}
          onPress={() => router.push({ pathname: '/(app)/(tabs)/search', params: { view: 'all' } })}
        >
          <Text style={styles.statValue}>{counts.recipes}</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.statItem}
          onPress={() => router.push('/(app)/(tabs)/favorites')}
        >
          <Text style={styles.statValue}>{counts.favorites}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.statItem}
          onPress={() => router.push('/(app)/(tabs)/categories')}
        >
          <Text style={styles.statValue}>{counts.categories}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Card style={styles.menuCard} elevation={1}>
          <List.Section>
            <List.Item
              title="Browse Recipes"
              description="Explore the recipe collection"
              left={(props) => (
                <MaterialCommunityIcons name="book-edit" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleMyRecipes}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="My Cookbook"
              description="Open your saved recipes"
              left={(props) => (
                <MaterialCommunityIcons name="book" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleCookbook}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Favorites"
              description="Your saved recipes"
              left={(props) => (
                <MaterialCommunityIcons name="heart" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
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
              left={(props) => (
                <MaterialCommunityIcons name="account-edit" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleEditProfile}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Settings"
              description="Notifications, theme, privacy"
              left={(props) => (
                <MaterialCommunityIcons name="cog" size={24} color="#E85D04" style={props.style} />
              )}
              right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />}
              onPress={handleSettings}
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
          icon="logout"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Button>
      </View>

      <View style={styles.version}>
        <Text style={styles.versionText}>Cookbook v1.0.0</Text>
      </View>
    </ScrollView>
    <Portal>
      <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
        <Dialog.Title>Edit Profile</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="First name"
            mode="outlined"
            value={editForm.firstName}
            onChangeText={(firstName) => setEditForm((current) => ({ ...current, firstName }))}
            style={styles.dialogInput}
            disabled={savingProfile}
          />
          <TextInput
            label="Last name"
            mode="outlined"
            value={editForm.lastName}
            onChangeText={(lastName) => setEditForm((current) => ({ ...current, lastName }))}
            style={styles.dialogInput}
            disabled={savingProfile}
          />
          <TextInput
            label="Email"
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            value={editForm.email}
            onChangeText={(email) => setEditForm((current) => ({ ...current, email }))}
            style={styles.dialogInput}
            disabled={savingProfile}
          />
          {profileError ? <Text style={styles.dialogError}>{profileError}</Text> : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setEditVisible(false)} disabled={savingProfile}>Cancel</Button>
          <Button onPress={() => void handleSaveProfile()} loading={savingProfile} disabled={savingProfile}>
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
        <Dialog.Title>Recipe Display</Dialog.Title>
        <Dialog.Content>
          <List.Item
            title="Show recipe ratings"
            description="Display ratings on Discover cards"
            right={() => (
              <Switch
                value={preferences.showRecipeRatings}
                onValueChange={(value) => void updatePreference('showRecipeRatings', value)}
              />
            )}
          />
          <List.Item
            title="Show nutrition details"
            description="Display calories on Discover cards"
            right={() => (
              <Switch
                value={preferences.showNutritionInfo}
                onValueChange={(value) => void updatePreference('showNutritionInfo', value)}
              />
            )}
          />
          {settingsError ? <Text style={styles.dialogError}>{settingsError}</Text> : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setSettingsVisible(false)}>Done</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={logoutVisible} onDismiss={() => setLogoutVisible(false)}>
        <Dialog.Title>Log out?</Dialog.Title>
        <Dialog.Content>
          <Text>You will need to sign in again to access your cookbook.</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setLogoutVisible(false)}>Cancel</Button>
          <Button
            textColor="#C62828"
            onPress={() => {
              setLogoutVisible(false);
              logout();
            }}
          >
            Log out
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
    </>
  );
}
