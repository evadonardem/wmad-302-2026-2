/**
 * Edit Profile - PUT /users/{id}
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, HelperText, Snackbar, TextInput, useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { MAX_CONTENT_WIDTH, spacing } from '@/constants/layout';
import { FieldErrors, ProfileFormValues, hasErrors, validateProfile } from '@/utils/validators';
import { getErrorMessage } from '@/utils/errors';

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, updateProfile } = useAuth();

  const [values, setValues] = useState<ProfileFormValues>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors<ProfileFormValues>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const setField = (field: keyof ProfileFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    const validation = validateProfile(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await updateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
      });
      setSaved(true);
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not update your profile'));
    } finally {
      setSaving(false);
    }
  };

  const input = (
    key: keyof ProfileFormValues,
    label: string,
    props?: { keyboardType?: 'email-address' | 'phone-pad'; autoCapitalize?: 'none' | 'words' }
  ) => (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={values[key]}
        onChangeText={(v) => setField(key, v)}
        error={!!errors[key]}
        disabled={saving}
        keyboardType={props?.keyboardType}
        autoCapitalize={props?.autoCapitalize ?? 'words'}
      />
      <HelperText type="error" visible={!!errors[key]}>
        {errors[key] ?? ''}
      </HelperText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <Banner visible={submitError !== null} icon="alert-circle-outline" style={styles.banner}>
            {submitError ?? ''}
          </Banner>
          {input('firstName', 'First name')}
          {input('lastName', 'Last name')}
          {input('email', 'Email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
          {input('phone', 'Phone (optional)', { keyboardType: 'phone-pad', autoCapitalize: 'none' })}
          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.save}>
            Save changes
          </Button>
        </View>
      </ScrollView>
      <Snackbar
        visible={saved}
        duration={1200}
        onDismiss={() => {
          setSaved(false);
          router.back();
        }}
      >
        Profile updated
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  banner: { marginBottom: spacing.md },
  save: { marginTop: spacing.md, maxWidth: MAX_CONTENT_WIDTH },
});
