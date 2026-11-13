/**
 * Register Screen
 * - Validates every field and shows the message under the field (works on web,
 *   unlike Alert.alert which does nothing in a browser).
 * - Calls register() from AuthContext, which creates the user and auto-logs in.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  Button,
  Checkbox,
  HelperText,
  SegmentedButtons,
  TextInput as PaperTextInput,
  useTheme,
} from 'react-native-paper';
import { useThemedStyles } from '@/context/ThemeContext';
import { styles as rawStyles } from './styles';

type Gender = 'male' | 'female';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: Gender;
}

// One optional error message per text field
type FormErrors = Partial<Record<keyof FormData | 'terms', string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Extra styles this screen needs (the shared auth styles don't have them)
const local = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  fieldGap: { marginBottom: 4 },
  label: { fontSize: 12, marginBottom: 6 },
  terms: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  termsText: { flex: 1, fontSize: 13 },
});

export default function RegisterScreen() {
  const router = useRouter();
  const styles = useThemedStyles(rawStyles);
  const { colors } = useTheme();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Returns an object of error messages; empty object = form is valid
  const validateForm = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';

    if (!formData.username.trim()) e.username = 'Username is required';
    else if (formData.username.trim().length < 3) e.username = 'At least 3 characters';

    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_REGEX.test(formData.email.trim())) e.email = 'Invalid email format';

    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'At least 6 characters';

    if (formData.confirmPassword !== formData.password) e.confirmPassword = 'Passwords do not match';

    if (formData.age.trim()) {
      const age = Number(formData.age);
      if (!Number.isInteger(age) || age < 13 || age > 120) e.age = 'Age must be 13–120';
    }

    if (!agreedToTerms) e.terms = 'You must agree to the Terms of Service';
    return e;
  };

  const handleRegister = async () => {
    const found = validateForm();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        age: formData.age.trim() ? Number(formData.age) : undefined,
        gender: formData.gender,
      });
      // register() already logged the user in, so go straight to Home
      router.replace('/(app)/(tabs)/home');
    } catch {
      // The error message is stored in AuthContext and shown below
    }
  };

  // Update one field and clear its error as the user types
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (error) clearError();
  };

  const eyeIcon = (
    <PaperTextInput.Icon
      icon={showPassword ? 'eye-off' : 'eye'}
      onPress={() => setShowPassword((v) => !v)}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍳</Text>
          <Text style={styles.appName}>Cookbook</Text>
          <Text style={styles.tagline}>Create Your Account</Text>
        </View>

        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start building your recipe collection</Text>

            {/* Name row */}
            <View style={local.row}>
              <View style={local.half}>
                <PaperTextInput
                  label="First Name"
                  mode="outlined"
                  value={formData.firstName}
                  onChangeText={(v) => handleFieldChange('firstName', v)}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  error={!!errors.firstName}
                  disabled={isLoading}
                />
                <HelperText type="error" visible={!!errors.firstName}>
                  {errors.firstName}
                </HelperText>
              </View>
              <View style={local.half}>
                <PaperTextInput
                  label="Last Name"
                  mode="outlined"
                  value={formData.lastName}
                  onChangeText={(v) => handleFieldChange('lastName', v)}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  disabled={isLoading}
                />
                <HelperText type="error" visible={!!errors.lastName}>
                  {errors.lastName}
                </HelperText>
              </View>
            </View>

            <PaperTextInput
              label="Username"
              mode="outlined"
              value={formData.username}
              onChangeText={(v) => handleFieldChange('username', v)}
              autoCapitalize="none"
              autoComplete="username"
              error={!!errors.username}
              disabled={isLoading}
            />
            <HelperText type="error" visible={!!errors.username}>
              {errors.username}
            </HelperText>

            <PaperTextInput
              label="Email"
              mode="outlined"
              value={formData.email}
              onChangeText={(v) => handleFieldChange('email', v)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              error={!!errors.email}
              disabled={isLoading}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <PaperTextInput
              label="Password"
              mode="outlined"
              value={formData.password}
              onChangeText={(v) => handleFieldChange('password', v)}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              error={!!errors.password}
              disabled={isLoading}
              right={eyeIcon}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>

            <PaperTextInput
              label="Confirm Password"
              mode="outlined"
              value={formData.confirmPassword}
              onChangeText={(v) => handleFieldChange('confirmPassword', v)}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              disabled={isLoading}
              right={eyeIcon}
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword}
            </HelperText>

            {/* Optional fields */}
            <PaperTextInput
              label="Age (optional)"
              mode="outlined"
              value={formData.age}
              onChangeText={(v) => handleFieldChange('age', v)}
              keyboardType="numeric"
              error={!!errors.age}
              disabled={isLoading}
            />
            <HelperText type="error" visible={!!errors.age}>
              {errors.age}
            </HelperText>

            <Text style={[local.label, { color: colors.onSurfaceVariant }]}>Gender</Text>
            <SegmentedButtons
              value={formData.gender}
              onValueChange={(v) => handleFieldChange('gender', v)}
              buttons={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />

            {/* Terms */}
            <View style={local.terms}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={() => {
                  setAgreedToTerms((v) => !v);
                  setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
              />
              <Text style={[local.termsText, { color: colors.onSurfaceVariant }]}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </View>
            <HelperText type="error" visible={!!errors.terms}>
              {errors.terms}
            </HelperText>

            {/* Server error (e.g. network problem) */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Already have an account? </Text>
              <Text style={styles.linkText} onPress={() => router.replace('/(auth)/login')}>
                Sign In
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
