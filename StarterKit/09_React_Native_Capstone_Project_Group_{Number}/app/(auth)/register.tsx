// FILE: app/(auth)/register.tsx
/**
 * Register Screen - SKELETON WITH TODOs
 * Students complete this screen to learn auth flow
 * 
 * TODO LIST:
 * 1. Wire form validation
 * 2. Call authApi.register() in handleRegister
 * 3. On success, call context.login() or navigate to login
 * 4. Add password confirmation field
 * 5. Add terms checkbox
 * 6. Handle loading/error states properly
 * 7. Test with DummyJSON /auth/register endpoint
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Checkbox } from 'react-native-paper';
import { styles } from './styles';

type Gender = 'male' | 'female';

interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: Gender;
}

const INITIAL_FORM: RegisterForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  gender: 'male',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_AGE = 13;
const MAX_AGE = 120;

export default function RegisterScreen() {
  const router = useRouter();
  // `register` from context creates the account AND signs the user in
  // (it calls authApi.register(), which saves the session, then dispatches AUTH_SUCCESS).
  const { register, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState<RegisterForm>(INITIAL_FORM);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Errors coming from authApi.register() (e.g. username already taken).
  // Context `error` covers login failures, so we only alert once.
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation helpers
  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';

    const username = formData.username.trim();
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';

    const email = formData.email.trim();
    if (!email) return 'Email is required';
    if (!EMAIL_PATTERN.test(email)) return 'Invalid email format';

    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';

    const age = formData.age.trim();
    if (age) {
      const parsedAge = Number(age);
      if (Number.isNaN(parsedAge)) return 'Age must be a number';
      if (parsedAge < MIN_AGE || parsedAge > MAX_AGE) {
        return `Age must be between ${MIN_AGE} and ${MAX_AGE}`;
      }
    }

    if (!agreedToTerms) return 'You must agree to the Terms of Service';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (error) clearError();
    setSubmitError(null);

    const username = formData.username.trim();
    const age = formData.age.trim();

    // 1. Create the account (and sign in): POST /users/add, then demo login for tokens
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username,
        password: formData.password,
        email: formData.email.trim(),
        age: age ? Number(age) : undefined,
        gender: formData.gender,
      });
    } catch (err) {
      // Show register failures inline instead of a silent console.error
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Could not create your account. Please try again.'
      );
      return;
    }

    // 2. Auto-login: the session is already saved by register(), so go straight to home
    router.replace('/(app)/(tabs)/home');
  };

  // Generic over the form keys so we never index state with a plain `string`
  const handleFieldChange = <K extends keyof RegisterForm>(
    field: K,
    value: RegisterForm[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
    if (submitError) setSubmitError(null);
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const displayError = submitError ?? error;

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
            <View style={styles.nameRow}>
              <PaperTextInput
                label="First Name"
                mode="outlined"
                value={formData.firstName}
                onChangeText={(v) => handleFieldChange('firstName', v)}
                style={[styles.input, styles.halfInput]}
                autoCapitalize="words"
                // `autoComplete` replaces the removed `autoCompleteType` prop
                autoComplete="given-name"
                returnKeyType="next"
                disabled={isLoading}
              />
              <PaperTextInput
                label="Last Name"
                mode="outlined"
                value={formData.lastName}
                onChangeText={(v) => handleFieldChange('lastName', v)}
                style={[styles.input, styles.halfInput]}
                autoCapitalize="words"
                autoComplete="family-name"
                returnKeyType="next"
                disabled={isLoading}
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
              autoComplete="username"
              autoCorrect={false}
              returnKeyType="next"
              disabled={isLoading}
            />

            {/* Email */}
            <PaperTextInput
              label="Email"
              mode="outlined"
              value={formData.email}
              onChangeText={(v) => handleFieldChange('email', v)}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
              disabled={isLoading}
            />

            {/* Password */}
            <PaperTextInput
              label="Password"
              mode="outlined"
              value={formData.password}
              onChangeText={(v) => handleFieldChange('password', v)}
              style={styles.input}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              returnKeyType="next"
              disabled={isLoading}
              right={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
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
              autoComplete="new-password"
              returnKeyType="next"
              disabled={isLoading}
              right={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? 'Hide password confirmation'
                      : 'Show password confirmation'
                  }
                >
                  <Text style={styles.eyeText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
            />

            {/* Optional Fields */}
            <View style={styles.optionalRow}>
              <PaperTextInput
                label="Age (Optional)"
                mode="outlined"
                value={formData.age}
                onChangeText={(v) => handleFieldChange('age', v)}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                returnKeyType="next"
                disabled={isLoading}
              />
              <View style={[styles.halfInput, styles.genderSelector]}>
                <Text style={styles.genderLabel}>Gender</Text>
                <View style={styles.genderOptions}>
                  <TouchableOpacity
                    onPress={() => handleFieldChange('gender', 'male')}
                    disabled={isLoading}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: formData.gender === 'male' }}
                    style={[
                      styles.genderOption,
                      formData.gender === 'male' && styles.genderOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.gender === 'male' && styles.genderOptionTextSelected,
                      ]}
                    >
                      ♂ Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFieldChange('gender', 'female')}
                    disabled={isLoading}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: formData.gender === 'female' }}
                    style={[
                      styles.genderOption,
                      formData.gender === 'female' && styles.genderOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.gender === 'female' && styles.genderOptionTextSelected,
                      ]}
                    >
                      ♀ Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreedToTerms((prev) => !prev)}
                disabled={isLoading}
                style={styles.checkbox}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText}>Terms of Service</Text>{' '}
                and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Inline Error */}
            {displayError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonText}
            >
              Create Account
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={styles.link}
              >
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Student Guide */}
        <View style={styles.guideContainer}>
          <Text style={styles.guideTitle}>📝 Student Implementation Guide</Text>
          <Text style={styles.guideText}>
            Complete the handleRegister function to:{'\n'}
            1. Call authApi.register() with form data{'\n'}
            2. Auto-login or redirect to login{'\n'}
            3. Handle success/error states
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}