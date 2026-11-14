/**
 * Register Screen - Cookbook
 *
 * Flow:
 *  1. Validate the form locally
 *  2. POST /auth/register via authApi.register()
 *  3. Auto-login with the new credentials and go to Home
 *     - If auto-login fails (e.g. the API doesn't persist new users),
 *       tell the user the account was created and send them to Login
 *
 * Requires authApi.register() (README TODO #2) to be implemented.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';
import { Card, Button, TextInput as PaperTextInput, Checkbox } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/authApi';
import { styles } from './styles';

type Gender = 'male' | 'female';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: Gender;
}

const INITIAL_FORM: RegisterFormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  gender: 'male',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const apiMessage = (err.response?.data as { message?: string } | undefined)?.message;
    return apiMessage || err.message || 'Registration failed';
  }
  return err instanceof Error ? err.message : 'Registration failed';
}

export default function RegisterScreen() {
  const router = useRouter();
  const { login, isLoading, clearError } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Context isLoading only tracks context actions; we also track our own API call
  const busy = isLoading || submitting;

  const handleFieldChange = <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    const { firstName, lastName, username, email, password, confirmPassword, age } = formData;

    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!username.trim()) return 'Username is required';
    if (username.trim().length < 3) return 'Username must be at least 3 characters';
    if (!email.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(email.trim())) return 'Invalid email format';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';

    if (age.trim()) {
      const parsedAge = Number(age);
      if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120) {
        return 'Age must be a whole number between 13 and 120';
      }
    }

    if (!agreedToTerms) return 'You must agree to the Terms of Service';
    return null;
  };

  const handleRegister = async () => {
    if (busy) return;

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    const username = formData.username.trim();
    const password = formData.password;

    setSubmitting(true);
    clearError();

    try {
      // 1. Create the account
      await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username,
        password,
        email: formData.email.trim(),
        age: formData.age.trim() ? Number(formData.age) : undefined,
        gender: formData.gender,
      });
    } catch (err) {
      Alert.alert('Registration Failed', getErrorMessage(err));
      setSubmitting(false);
      return;
    }

    // 2. Account created - try to sign in automatically
    try {
      await login(username, password);
      router.replace('/(app)/(tabs)/home');
    } catch {
      // Registration worked but auto-login didn't: send them to the login screen
      clearError();
      Alert.alert(
        'Account Created',
        'Your account was created. Please sign in to continue.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍳</Text>
          <Text style={styles.appName}>Cookbook</Text>
          <Text style={styles.tagline}>Create Your Account</Text>
        </View>

        {/* Register Card */}
        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start building your recipe collection</Text>

            {/* Name Fields Row */}
            <View style={registerStyles.nameRow}>
              <PaperTextInput
                label="First Name"
                mode="outlined"
                value={formData.firstName}
                onChangeText={(v) => handleFieldChange('firstName', v)}
                style={[styles.input, registerStyles.halfInput]}
                autoCapitalize="words"
                autoComplete="name-given"
                returnKeyType="next"
                disabled={busy}
              />
              <PaperTextInput
                label="Last Name"
                mode="outlined"
                value={formData.lastName}
                onChangeText={(v) => handleFieldChange('lastName', v)}
                style={[styles.input, registerStyles.halfInput]}
                autoCapitalize="words"
                autoComplete="name-family"
                returnKeyType="next"
                disabled={busy}
              />
            </View>

            {/* Username */}
            <PaperTextInput
              label="Username"
              mode="outlined"
              value={formData.username}
              onChangeText={(v) => handleFieldChange('username', v)}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="next"
              disabled={busy}
            />

            {/* Email */}
            <PaperTextInput
              label="Email"
              mode="outlined"
              value={formData.email}
              onChangeText={(v) => handleFieldChange('email', v)}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              disabled={busy}
            />

            {/* Password */}
            <PaperTextInput
              label="Password"
              mode="outlined"
              value={formData.password}
              onChangeText={(v) => handleFieldChange('password', v)}
              style={styles.input}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="next"
              disabled={busy}
              right={
                <PaperTextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword((prev) => !prev)}
                />
              }
            />

            {/* Confirm Password */}
            <PaperTextInput
              label="Confirm Password"
              mode="outlined"
              value={formData.confirmPassword}
              onChangeText={(v) => handleFieldChange('confirmPassword', v)}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              disabled={busy}
              error={formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword}
              right={
                <PaperTextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                />
              }
            />

            {/* Optional Fields */}
            <View style={registerStyles.optionalRow}>
              <PaperTextInput
                label="Age (Optional)"
                mode="outlined"
                value={formData.age}
                onChangeText={(v) => handleFieldChange('age', v.replace(/[^0-9]/g, ''))}
                style={[styles.input, registerStyles.halfInput]}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="done"
                disabled={busy}
              />
              <View style={[registerStyles.halfInput, registerStyles.genderSelector]}>
                <Text style={registerStyles.genderLabel}>Gender</Text>
                <View style={registerStyles.genderOptions}>
                  {(['male', 'female'] as const).map((option) => {
                    const selected = formData.gender === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleFieldChange('gender', option)}
                        disabled={busy}
                        style={[
                          registerStyles.genderOption,
                          selected && registerStyles.genderOptionSelected,
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            registerStyles.genderOptionText,
                            selected && registerStyles.genderOptionTextSelected,
                          ]}
                        >
                          {option === 'male' ? '♂ Male' : '♀ Female'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Terms Checkbox */}
            <View style={registerStyles.termsContainer}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreedToTerms((prev) => !prev)}
                disabled={busy}
              />
              <Text style={registerStyles.termsText} onPress={() => setAgreedToTerms((prev) => !prev)}>
                I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={busy}
              style={registerStyles.registerButton}
              disabled={busy}
              contentStyle={styles.buttonContent}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </Button>

            {/* Login Link */}
            <View style={registerStyles.loginContainer}>
              <Text style={registerStyles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                disabled={busy}
                style={styles.link}
              >
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Register-only styles. The shared ./styles.ts doesn't define these,
 * so they live here to avoid touching the shared file.
 */
const registerStyles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  optionalRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  genderSelector: {
    justifyContent: 'center',
  },
  genderLabel: {
    fontSize: 12,
    color: '#8D6E63',
    marginBottom: 6,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#E85D04',
    borderColor: '#E85D04',
  },
  genderOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E85D04',
  },
  genderOptionTextSelected: {
    color: '#FFFFFF',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#8D6E63',
    lineHeight: 18,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    height: 52,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  loginText: {
    fontSize: 14,
    color: '#8D6E63',
  },
});