/**
 * Register Screen
 * Validates the form, calls register() from AuthContext (creates the account and
 * signs the user in), then goes to the home tab. Errors are shown on the page
 * (Alert.alert does nothing in the browser).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Checkbox } from 'react-native-paper';
import { createStyles } from '@/styles/authStyles';
import { useAppTheme, useThemedStyles } from '@/context/ThemeContext';

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male' as 'male' | 'female',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // validation message

  // Validation helpers
  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.username.trim()) return 'Username is required';
    if (formData.username.length < 3) return 'Username must be at least 3 characters';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (formData.age && (parseInt(formData.age) < 13 || parseInt(formData.age) > 120)) {
      return 'Age must be between 13 and 120';
    }
    if (!agreedToTerms) return 'You must agree to the Terms of Service';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    setFormError(validationError);
    if (validationError) return;

    try {
      // The context creates the account AND signs the user in (auto-login).
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender,
      });
      router.replace('/(app)/(tabs)/home');
    } catch {
      // Error message is stored in the context and shown above the Register button
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
    if (error) clearError();
  };

  // Show the validation message, or the error from the server/storage
  const shownError = formError ?? error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🛒</Text>
          <Text style={styles.appName}>Marketplace</Text>
          <Text style={styles.tagline}>Create Your Account</Text>
        </View>

        {/* Register Card */}
        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start shopping smarter today</Text>

            {/* Name Fields Row */}
            <View style={styles.nameRow}>
              <PaperTextInput
                label="First Name"
                mode="outlined"
                value={formData.firstName}
                onChangeText={(v) => handleFieldChange('firstName', v)}
                style={[styles.input, styles.halfInput]}
                autoCapitalize="words"
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
                <PaperTextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
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
              autoComplete="new-password"
              returnKeyType="next"
              disabled={isLoading}
              right={
                <PaperTextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                />
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
                    style={[
                      styles.genderOption,
                      formData.gender === 'male' && styles.genderOptionSelected,
                    ]}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      formData.gender === 'male' && styles.genderOptionTextSelected,
                    ]}>♂ Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFieldChange('gender', 'female')}
                    style={[
                      styles.genderOption,
                      formData.gender === 'female' && styles.genderOptionSelected,
                    ]}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      formData.gender === 'female' && styles.genderOptionTextSelected,
                    ]}>♀ Female</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <View style={styles.checkbox}>
                <Checkbox
                  status={agreedToTerms ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setAgreedToTerms(!agreedToTerms);
                    setFormError(null);
                  }}
                />
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText}>Terms of Service</Text>{' '}
                and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Error Display */}
            {shownError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{shownError}</Text>
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
            >
              {isLoading ? <ActivityIndicator color={colors.onPrimary} size="small" /> : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.link}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}