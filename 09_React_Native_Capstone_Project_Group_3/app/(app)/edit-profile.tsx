/**
 * Edit Profile - updates the user through PUT /users/{id}
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/services/authApi';
import { validateProfileForm } from '@/utils/validation';

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const change = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSave = async () => {
    const problem = validateProfileForm(form);
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update your profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          Signed in as @{user?.username}
        </Text>

        <TextInput
          label="First name"
          mode="outlined"
          value={form.firstName}
          onChangeText={change('firstName')}
          style={styles.input}
          autoCapitalize="words"
          disabled={saving}
          testID="edit-firstName"
        />
        <TextInput
          label="Last name"
          mode="outlined"
          value={form.lastName}
          onChangeText={change('lastName')}
          style={styles.input}
          autoCapitalize="words"
          disabled={saving}
          testID="edit-lastName"
        />
        <TextInput
          label="Email"
          mode="outlined"
          value={form.email}
          onChangeText={change('email')}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          disabled={saving}
          testID="edit-email"
        />

        {error ? (
          <View style={[styles.error, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={{ color: theme.colors.error }}>{error}</Text>
          </View>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
          testID="edit-save"
        >
          Save changes
        </Button>
        <Button mode="text" onPress={() => router.back()} disabled={saving}>
          Cancel
        </Button>
      </ScrollView>

      <Snackbar
        visible={saved}
        onDismiss={() => {
          setSaved(false);
          router.back();
        }}
        duration={1500}
      >
        Profile updated
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  input: { marginBottom: 14 },
  error: { padding: 12, borderRadius: 8, marginBottom: 14 },
  button: { marginTop: 8, marginBottom: 8, borderRadius: 12 },
});
