import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Appbar, Button, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { appColors } from '@/constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { settings } = useSettings();
  const colors = settings.darkModeEnabled ? appColors.dark : appColors.light;
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
  }, [user?.id, user?.firstName, user?.lastName, user?.email]);

  const saveProfile = async () => {
    const updated = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    };

    if (!updated.firstName || !updated.lastName) {
      setErrorMessage('First and last name are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email)) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateProfile(updated);
      router.back();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.description, { color: colors.muted }]}>
            Update the name and email shown on your profile.
          </Text>
          <TextInput
            mode="outlined"
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            disabled={isSaving}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            disabled={isSaving}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            disabled={isSaving}
            style={styles.input}
          />
          {errorMessage && (
            <Text style={[styles.error, { color: colors.error }]}>{errorMessage}</Text>
          )}
          <Button
            mode="contained"
            onPress={saveProfile}
            loading={isSaving}
            disabled={isSaving || !user}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  error: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
