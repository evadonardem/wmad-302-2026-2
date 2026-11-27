/**
 * Profile Screen - Cookbook
 * TODO: Students implement
 * - Display user info from auth context
 * - Edit profile (PUT /users/{id})
 * - View order history / saved recipes
 * - Settings (notifications, theme, etc.)
 * - Logout
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAsyncStorage } from '@/hooks';
import { recipeApi } from '@/services/recipeApi';
import { confirmAction, showMessage } from '@/utils/alerts';
import {
  Card,
  Button,
  List,
  Avatar,
  Divider,
  Portal,
  Dialog,
  TextInput as PaperTextInput,
  Switch,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './profileStyles';
import type { Recipe } from '@/types/recipe';
import { colors } from '@/constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Icons for the menu rows (Paper passes the layout style to left/right renderers)
interface RowIconProps {
  style?: StyleProp<ViewStyle>;
}

const leftIcon = (name: IconName) =>
  function LeftIcon({ style }: RowIconProps) {
    return <MaterialCommunityIcons name={name} size={24} color={colors.primary} style={style} />;
  };

const chevron = ({ style }: RowIconProps) => (
  <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} style={style} />
);

interface UserSettings {
  notifications: boolean;
  metricUnits: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: true,
  metricUnits: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Layout for the dialogs
const localStyles = StyleSheet.create({
  dialogInput: { marginBottom: 12 },
  dialogScroll: { maxHeight: 260 },
});

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { count: favoritesCount, clearFavorites } = useFavorites();
  // Settings are saved in AsyncStorage under 'user_settings'
  const [settings, setSettings] = useAsyncStorage<UserSettings>('user_settings', DEFAULT_SETTINGS);

  // Recipes created by this user (recipes carry a userId)
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Dialogs
  const [editVisible, setEditVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [myRecipesVisible, setMyRecipesVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Edit profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const userId = user?.id;

  // Stats: how many recipes belong to this user
  useEffect(() => {
    if (userId === undefined) return;
    let cancelled = false;

    recipeApi
      .getRecipes({ limit: 0 })
      .then((response) => {
        if (!cancelled) {
          setMyRecipes(response.recipes.filter((recipe) => recipe.userId === userId));
        }
      })
      .catch(() => {
        // Stats are optional, keep the screen usable
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleLogout = () => {
    confirmAction({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      destructive: true,
      onConfirm: logout,
    });
  };

  // Open the edit dialog with the current values
  const handleEditProfile = () => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
    setEditError(null);
    setEditVisible(true);
  };

  // Save: PUT /users/{id}
  const handleSaveProfile = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirst || !trimmedLast) {
      setEditError('First and last name are required');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEditError('Invalid email format');
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await updateUser({ firstName: trimmedFirst, lastName: trimmedLast, email: trimmedEmail });
      setEditVisible(false);
      setMessage('Profile updated');
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSettings = () => {
    setSettingsVisible(true);
  };

  const handleClearFavorites = () => {
    confirmAction({
      title: 'Clear favorites',
      message: 'Remove all your saved recipes?',
      confirmText: 'Clear',
      destructive: true,
      onConfirm: () => {
        clearFavorites();
        setSettingsVisible(false);
        setMessage('Favorites cleared');
      },
    });
  };

  const handleMyRecipes = () => {
    setMyRecipesVisible(true);
  };

  const handleCookbook = () => {
    showMessage('Coming soon', 'Personal collections and meal plans are not available yet.');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notLoggedIn}>Please log in to view profile</Text>
      </View>
    );
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          {user?.image ? (
            <Avatar.Image size={88} source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={88} label={initials} style={styles.avatar} />
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
            <Text style={styles.statValue}>{statsLoading ? '–' : myRecipes.length}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoritesCount}</Text>
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
                left={leftIcon('book-edit')}
                right={chevron}
                onPress={handleMyRecipes}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="My Croc Book"
                description="Personal collections & meal plans"
                left={leftIcon('book-open-variant')}
                right={chevron}
                onPress={handleCookbook}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Favorites"
                description="Your saved recipes"
                left={leftIcon('heart')}
                right={chevron}
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
                left={leftIcon('account-edit')}
                right={chevron}
                onPress={handleEditProfile}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Settings"
                description="Notifications, units, favorites"
                left={leftIcon('cog')}
                right={chevron}
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
          <Text style={styles.versionText}>Croc Book v1.0.0</Text>
        </View>
      </ScrollView>

      <Portal>
        {/* Edit Profile Dialog */}
        <Dialog visible={editVisible} onDismiss={() => !saving && setEditVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label="First Name"
              mode="outlined"
              value={firstName}
              onChangeText={setFirstName}
              style={localStyles.dialogInput}
              autoCapitalize="words"
              disabled={saving}
            />
            <PaperTextInput
              label="Last Name"
              mode="outlined"
              value={lastName}
              onChangeText={setLastName}
              style={localStyles.dialogInput}
              autoCapitalize="words"
              disabled={saving}
            />
            <PaperTextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              style={localStyles.dialogInput}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              disabled={saving}
            />
            <HelperText type="error" visible={!!editError}>
              {editError}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onPress={handleSaveProfile} loading={saving} disabled={saving}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="Notifications"
              description="Recipe reminders and tips"
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => setSettings({ ...settings, notifications: value })}
                />
              )}
            />
            <List.Item
              title="Metric units"
              description="Show grams and millilitres"
              right={() => (
                <Switch
                  value={settings.metricUnits}
                  onValueChange={(value) => setSettings({ ...settings, metricUnits: value })}
                />
              )}
            />
            <Button
              mode="outlined"
              icon="heart-broken"
              onPress={handleClearFavorites}
              disabled={favoritesCount === 0}
            >
              Clear all favorites
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSettingsVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>

        {/* My Recipes Dialog */}
        <Dialog visible={myRecipesVisible} onDismiss={() => setMyRecipesVisible(false)}>
          <Dialog.Title>My Recipes</Dialog.Title>
          <Dialog.ScrollArea style={localStyles.dialogScroll}>
            <ScrollView>
              {myRecipes.length === 0 ? (
                <List.Item
                  title="No recipes yet"
                  description="Recipes you create will appear here"
                />
              ) : (
                myRecipes.map((recipe) => (
                  <List.Item
                    key={recipe.id}
                    title={recipe.name}
                    description={recipe.cuisine}
                    onPress={() => {
                      setMyRecipesVisible(false);
                      router.push(`/(app)/recipe/${recipe.id}`);
                    }}
                  />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setMyRecipesVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={3000}>
          {message}
        </Snackbar>
      </Portal>
    </>
  );
}