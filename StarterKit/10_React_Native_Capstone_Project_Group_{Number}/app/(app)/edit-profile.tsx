/**
 * Edit Profile - PUT /users/{id}, then update the signed-in user locally.
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, HelperText, Snackbar, TextInput } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { updateUser } from '@/services/userApi';
import { hasErrors, validateProfile, ProfileErrors, ProfileValues } from '@/utils/validation';
import { styles } from './accountStyles';

const FIELDS: { key: keyof ProfileValues; label: string }[] = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser: applyUserChanges } = useAuth();

  const [values, setValues] = useState<ProfileValues>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    const found = validateProfile(values);
    setErrors(found);
    if (hasErrors(found) || !user) return;

    const changes = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
    };

    setSaving(true);
    try {
      await updateUser(user.id, changes);
      applyUserChanges(changes);
      setMessage('Profile updated');
      setTimeout(() => router.back(), 800);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update your profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {FIELDS.map(({ key, label }) => (
          <View key={key} style={styles.fieldGap}>
            <TextInput
              label={label}
              mode="outlined"
              value={values[key]}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
              keyboardType={key === 'email' ? 'email-address' : 'default'}
              error={Boolean(errors[key])}
              style={styles.input}
              onChangeText={(text) => {
                setValues((prev) => ({ ...prev, [key]: text }));
                if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
              }}
            />
            <HelperText type="error" visible={Boolean(errors[key])}>
              {errors[key] ?? ''}
            </HelperText>
          </View>
        ))}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Save changes
        </Button>
      </ScrollView>
      <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={3000}>
        {message ?? ''}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}
