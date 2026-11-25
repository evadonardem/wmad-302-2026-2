/**
 * Register Screen
 * - Full form validation (names, username, email, password + confirmation, age, terms)
 * - Calls AuthContext.register -> authApi.register (POST /users/add) and signs the user in
 * - Loading + error states, navigates to the app on success
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Checkbox } from 'react-native-paper';
import { styles } from '@/styles/authStyles';
import type { RegisterData } from '@/types/auth';
import { RegisterForm, validateRegisterForm } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFieldChange = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
    if (error) clearError();
  };

  const handleRegister = async () => {
    const validationError = validateRegisterForm(formData, agreedToTerms);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);

    const payload: RegisterData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      password: formData.password,
      email: formData.email.trim(),
      age: formData.age.trim() ? Number(formData.age) : undefined,
      gender: formData.gender,
    };

    try {
      await register(payload); // creates the account and auto-logs in
      router.replace('/(app)/(tabs)/home');
    } catch {
      // Error message is shown from context state
    }
  };

  const message = formError ?? error;

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
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍳</Text>
          <Text style={styles.appName}>Cookbook</Text>
          <Text style={styles.tagline}>Create Your Account</Text>
        </View>

        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start building your recipe collection</Text>

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
                testID="register-firstName"
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
                testID="register-lastName"
              />
            </View>

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
              disabled={isLoading}
              testID="register-username"
            />

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
              disabled={isLoading}
              testID="register-email"
            />

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
              testID="register-password"
              right={
                <PaperTextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <PaperTextInput
              label="Confirm Password"
              mode="outlined"
              value={formData.confirmPassword}
              onChangeText={(v) => handleFieldChange('confirmPassword', v)}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              returnKeyType="done"
              disabled={isLoading}
              testID="register-confirmPassword"
              right={
                <PaperTextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <View style={styles.optionalRow}>
              <PaperTextInput
                label="Age (Optional)"
                mode="outlined"
                value={formData.age}
                onChangeText={(v) => handleFieldChange('age', v.replace(/[^0-9]/g, ''))}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                disabled={isLoading}
                testID="register-age"
              />
              <View style={[styles.halfInput, styles.genderSelector]}>
                <Text style={styles.genderLabel}>Gender</Text>
                <View style={styles.genderOptions}>
                  {(['male', 'female'] as const).map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => handleFieldChange('gender', option)}
                      style={[
                        styles.genderOption,
                        formData.gender === option && styles.genderOptionSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: formData.gender === option }}
                    >
                      <Text
                        style={[
                          styles.genderOptionText,
                          formData.gender === option && styles.genderOptionTextSelected,
                        ]}
                      >
                        {option === 'male' ? '♂ Male' : '♀ Female'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.termsContainer}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={() => {
                  setAgreedToTerms(!agreedToTerms);
                  if (formError) setFormError(null);
                }}
              />
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            {message ? (
              <View style={styles.errorContainer} testID="register-error">
                <Text style={styles.errorText}>{message}</Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonText}
              testID="register-submit"
            >
              Create Account
            </Button>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  clearError();
                  router.replace('/(auth)/login');
                }}
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
