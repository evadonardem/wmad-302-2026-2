/**
 * Profile Screen - Cookbook
 * - Shows the logged-in user and real stats taken from their favorites
 * - Edit profile (PUT /users/{id}; saved on the device too, see authApi)
 * - Settings (clear favorites, about) and logout
 * Dialogs are used instead of Alert.alert because Alert does nothing on web.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useRecipeCatalog } from '@/hooks';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  Divider,
  HelperText,
  List,
  Portal,
  Snackbar,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './profileStyles';

type DialogName = 'logout' | 'edit' | 'settings' | 'clearFavorites' | null;
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
}
type EditErrors = Partial<Record<keyof EditForm, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const local = StyleSheet.create({
  saveError: { color: '#C62828', fontSize: 13, marginTop: 4 },
  settingsRow: { marginBottom: 12 },
  aboutText: { color: '#5D4037', fontSize: 13, marginTop: 4 },
});

// Menu row helpers
const menuIcon = (name: IconName) => (props: { style?: object }) => (
  <MaterialCommunityIcons name={name} size={24} color="#E85D04" style={props.style} />
);
const chevron = (props: { style?: object }) => (
  <MaterialCommunityIcons name="chevron-right" size={24} color="#8D6E63" style={props.style} />
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const { ids, count, clearFavorites } = useFavorites();
  const { recipes: catalog } = useRecipeCatalog();

  const [dialog, setDialog] = useState<DialogName>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Edit form
  const [form, setForm] = useState<EditForm>({ firstName: '', lastName: '', email: '' });
  const [formErrors, setFormErrors] = useState<EditErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Stats come from the user's favorite recipes
  const stats = useMemo(() => {
    const favorites = catalog.filter((recipe) => ids.includes(recipe.id));
    const cuisines = new Set(favorites.map((recipe) => recipe.cuisine)).size;
    const average =
      favorites.length > 0
        ? (favorites.reduce((sum, recipe) => sum + recipe.rating, 0) / favorites.length).toFixed(1)
        : '–';
    return { cuisines, average };
  }, [catalog, ids]);

  const openEdit = () => {
    setForm({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    });
    setFormErrors({});
    setSaveError(null);
    setDialog('edit');
  };

  const validate = (): EditErrors => {
    const errors: EditErrors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Invalid email format';
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      });
      setDialog(null);
      setMessage('Profile updated');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setSaveError(null);
  };

  const confirmLogout = async () => {
    setDialog(null);
    await logout();
  };

  const confirmClearFavorites = () => {
    clearFavorites();
    setDialog(null);
    setMessage('Favorites cleared');
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
            <Text style={styles.statValue}>{count}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.cuisines}</Text>
            <Text style={styles.statLabel}>Cuisines</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.average}</Text>
            <Text style={styles.statLabel}>Avg. rating</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Card style={styles.menuCard} elevation={1}>
            <List.Section>
              <List.Item
                title="Favorites"
                description="Your saved recipes"
                left={menuIcon('heart')}
                right={chevron}
                onPress={() => router.push('/(app)/(tabs)/favorites')}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Edit Profile"
                description="Update your name and email"
                left={menuIcon('account-edit')}
                right={chevron}
                onPress={openEdit}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Settings"
                description="Manage favorites, about the app"
                left={menuIcon('cog')}
                right={chevron}
                onPress={() => setDialog('settings')}
              />
            </List.Section>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={() => setDialog('logout')}
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
        {/* Logout */}
        <Dialog visible={dialog === 'logout'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancel</Button>
            <Button onPress={confirmLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Edit profile */}
        <Dialog visible={dialog === 'edit'} onDismiss={() => !saving && setDialog(null)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label="First name"
              mode="outlined"
              value={form.firstName}
              onChangeText={(v) => setField('firstName', v)}
              error={!!formErrors.firstName}
              disabled={saving}
            />
            <HelperText type="error" visible={!!formErrors.firstName}>
              {formErrors.firstName}
            </HelperText>
            <PaperTextInput
              label="Last name"
              mode="outlined"
              value={form.lastName}
              onChangeText={(v) => setField('lastName', v)}
              error={!!formErrors.lastName}
              disabled={saving}
            />
            <HelperText type="error" visible={!!formErrors.lastName}>
              {formErrors.lastName}
            </HelperText>
            <PaperTextInput
              label="Email"
              mode="outlined"
              value={form.email}
              onChangeText={(v) => setField('email', v)}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!formErrors.email}
              disabled={saving}
            />
            <HelperText type="error" visible={!!formErrors.email}>
              {formErrors.email}
            </HelperText>
            {saveError && <Text style={local.saveError}>{saveError}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onPress={handleSave} loading={saving} disabled={saving}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Settings */}
        <Dialog visible={dialog === 'settings'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Content>
            <View style={local.settingsRow}>
              <Button
                mode="outlined"
                icon="heart-remove-outline"
                disabled={count === 0}
                onPress={() => setDialog('clearFavorites')}
              >
                Clear all favorites ({count})
              </Button>
            </View>
            <Divider />
            <Text style={local.aboutText}>Cookbook v1.0.0</Text>
            <Text style={local.aboutText}>Recipe data from DummyJSON</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Confirm clearing favorites */}
        <Dialog visible={dialog === 'clearFavorites'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Clear favorites</Dialog.Title>
          <Dialog.Content>
            <Text>Remove all {count} saved recipes? This can't be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog('settings')}>Cancel</Button>
            <Button onPress={confirmClearFavorites}>Clear</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={3000}>
          {message}
        </Snackbar>
      </Portal>
    </>
  );
}
