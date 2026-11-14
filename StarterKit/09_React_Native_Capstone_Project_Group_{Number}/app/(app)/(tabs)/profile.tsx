
/**
 * Profile Screen - Cookbook
 */

import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';

import {
  Card,
  Title,
  Button,
  List,
  Avatar,
  Divider,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import type { ProfileUpdateData } from '@/context/AuthContext';

import { favoritesStorage } from '@/utils/storage';

import { styles } from './profileStyles';

export default function ProfileScreen() {
  const router = useRouter();

  const {
    user,
    logout,
    isAuthenticated,
    isLoading,
    updateUser,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadFavorites = async () => {
        try {
          const ids = await favoritesStorage.getIds();

          if (mounted) {
            setFavoriteCount(ids.length);
          }
        } catch (error) {
          console.error('Failed to load favorites:', error);
        }
      };

      loadFavorites();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const openEditProfile = () => {
    if (!user) return;

    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setUsername(user.username || '');
    setEmail(user.email || '');
    setGender(user.gender || 'male');

    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !email.trim()
    ) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    const profileData: ProfileUpdateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      gender,
    };

    try {
      setSaving(true);
      await updateUser(profileData);
      setIsEditing(false);

      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Profile update failed';

      Alert.alert('Update Failed', message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleFavorites = () => {
    router.push('/(app)/(tabs)/favorites');
  };

  const handleSettings = () => {
    router.push('/(app)/settings');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={localStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="account-lock-outline"
          size={64}
          color="#E85D04"
        />

        <Text style={styles.notLoggedIn}>
          Please log in to view your profile.
        </Text>

        <Button
          mode="contained"
          buttonColor="#E85D04"
          onPress={() => router.replace('/(auth)/login')}
          style={localStyles.loginButton}
        >
          Go to Login
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Profile Header */}
      <View style={styles.header}>
        {user.image ? (
          <Avatar.Image
            size={88}
            source={{ uri: user.image }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={88}
            label={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
            style={styles.avatar}
            color="#E85D04"
          />
        )}

        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.id}</Text>
          <Text style={styles.statLabel}>User ID</Text>
        </View>
      </View>

      {/* Edit Profile */}
      {isEditing && (
        <Card style={localStyles.editCard}>
          <Card.Content>
            <Title style={localStyles.editTitle}>Edit Profile</Title>

            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={localStyles.input}
            />

            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={localStyles.input}
            />

            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              autoCapitalize="none"
              style={localStyles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={localStyles.input}
            />

            <Text style={localStyles.genderLabel}>Gender</Text>

            <View style={localStyles.genderContainer}>
              <Button
                mode={gender === 'male' ? 'contained' : 'outlined'}
                buttonColor={gender === 'male' ? '#E85D04' : undefined}
                onPress={() => setGender('male')}
                style={localStyles.genderButton}
              >
                Male
              </Button>

              <Button
                mode={gender === 'female' ? 'contained' : 'outlined'}
                buttonColor={gender === 'female' ? '#E85D04' : undefined}
                onPress={() => setGender('female')}
                style={localStyles.genderButton}
              >
                Female
              </Button>
            </View>

            <View style={localStyles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => setIsEditing(false)}
                disabled={saving}
                style={localStyles.actionButton}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPress={handleSaveProfile}
                loading={saving}
                disabled={saving}
                buttonColor="#E85D04"
                style={localStyles.actionButton}
              >
                Save Changes
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Account Menu */}
      <View style={styles.section}>
        <Title style={localStyles.sectionTitle}>My Account</Title>

        <Card style={styles.menuCard}>
          {!isEditing && (
            <>
              <List.Item
                title="Edit Profile"
                description="Update your personal information"
                left={(props) => (
                  <List.Icon {...props} icon="account-edit-outline" color="#E85D04" />
                )}
                right={(props) => (
                  <List.Icon {...props} icon="chevron-right" />
                )}
                onPress={openEditProfile}
              />

              <Divider style={styles.divider} />
            </>
          )}

          <List.Item
            title="My Favorites"
            description={`${favoriteCount} saved recipes`}
            left={(props) => (
              <List.Icon {...props} icon="heart-outline" color="#E85D04" />
            )}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" />
            )}
            onPress={handleFavorites}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Settings"
            description="Manage your app preferences"
            left={(props) => (
              <List.Icon {...props} icon="cog-outline" color="#E85D04" />
            )}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" />
            )}
            onPress={handleSettings}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Account Information"
            description={`User ID: ${user.id}`}
            left={(props) => (
              <List.Icon {...props} icon="information-outline" color="#E85D04" />
            )}
          />
        </Card>
      </View>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          labelStyle={styles.logoutButtonText}
        >
          Logout
        </Button>
      </View>

      <View style={styles.version}>
        <Text style={styles.versionText}>Cookbook v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    color: '#8D6E63',
  },
  loginButton: {
    marginTop: 20,
  },
  editCard: {
    marginBottom: 24,
    borderRadius: 16,
  },
  editTitle: {
    color: '#3E2723',
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
    marginTop: 8,
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    color: '#3E2723',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
