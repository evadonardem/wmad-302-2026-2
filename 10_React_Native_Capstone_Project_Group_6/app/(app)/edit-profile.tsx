/**
 * Edit Profile - Marketplace
 * Change name, email and phone -> PUT /users/{id} (see authApi.updateProfile).
 * Validation lives in utils/profile.ts; errors show under each field.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, HelperText, Snackbar, TextInput } from 'react-native-paper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/services/authApi';
import { ProfileUpdate } from '@/types/auth';
import { ProfileErrors, validateProfile } from '@/utils/profile';
import { useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/colors';

export default function EditProfileScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState<ProfileUpdate>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const setField = (field: keyof ProfileUpdate, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/profile');
  };

  const handleSave = async () => {
    if (saving) return; // ignore double taps

    const validationErrors = validateProfile(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      await updateProfile(form);
      setSaved(true); // the snackbar below sends the person back when it closes
    } catch (error: unknown) {
      setSubmitError(extractErrorMessage(error, 'Could not save your profile'));
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    field: keyof ProfileUpdate,
    label: string,
    options: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      autoComplete?: 'given-name' | 'family-name' | 'email' | 'tel';
      autoCapitalize?: 'none' | 'words';
    } = {}
  ) => (
    <View style={styles.field}>
      <TextInput
        mode="outlined"
        label={label}
        value={form[field]}
        onChangeText={(text) => setField(field, text)}
        error={!!errors[field]}
        keyboardType={options.keyboardType}
        autoComplete={options.autoComplete}
        autoCapitalize={options.autoCapitalize ?? 'words'}
      />
      <HelperText type="error" visible={!!errors[field]}>
        {errors[field] ?? ''}
      </HelperText>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.username}>@{user?.username}</Text>
        {renderField('firstName', 'First name', { autoComplete: 'given-name' })}
        {renderField('lastName', 'Last name', { autoComplete: 'family-name' })}
        {renderField('email', 'Email', {
          keyboardType: 'email-address',
          autoComplete: 'email',
          autoCapitalize: 'none',
        })}
        {renderField('phone', 'Phone (optional)', { keyboardType: 'phone-pad', autoComplete: 'tel' })}

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.button}>
          Save changes
        </Button>
        <Button mode="text" onPress={goBack} disabled={saving}>
          Cancel
        </Button>
      </ScrollView>

      <Snackbar visible={saved} onDismiss={goBack} duration={1500}>
        Profile updated
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, paddingBottom: 48 },
  username: { fontSize: 14, color: colors.primary, fontWeight: '500', marginBottom: 12 },
  field: { marginBottom: 4 },
  submitError: { color: colors.errorText, marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
});
