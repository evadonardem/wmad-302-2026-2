/** Marketplace account registration screen. */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Checkbox } from 'react-native-paper';
import { styles } from '@/styles/authStyles';
import { showAlert } from '@/utils/platformAlert';

export default function RegisterScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
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
  const isSubmittingRef = useRef(false);

  // Validation helpers
  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.username.trim()) return 'Username is required';
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(formData.username.trim())) {
      return 'Username must be 3-30 characters and use only letters, numbers, dots, underscores, or hyphens';
    }
    if (!formData.email.trim()) return 'Email is required';
    if (formData.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Enter a valid email address';
    }
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (formData.age) {
      const age = Number(formData.age);
      if (!Number.isInteger(age) || age < 13 || age > 120) {
        return 'Age must be a whole number between 13 and 120';
      }
    }
    if (!agreedToTerms) return 'You must agree to the Terms of Service';
    return null;
  };

  const handleRegister = async () => {
    if (isSubmittingRef.current) return;

    const validationError = validateForm();
    if (validationError) {
      showAlert('Validation Error', validationError);
      return;
    }

    isSubmittingRef.current = true;
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim().toLowerCase(),
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
      });

      showAlert('Success', 'Account created successfully!', [
        {
          text: 'Continue',
          onPress: () => router.replace(redirect || '/(app)/(tabs)/home'),
        },
      ]);
    } catch (err) {
      console.error('Registration error:', err);
      isSubmittingRef.current = false;
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  React.useEffect(() => {
    if (error) {
      showAlert('Registration Failed', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/kartora-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Kartora logo"
          />
          <Text style={styles.appName}>Kartora</Text>
          <Text style={styles.tagline}>You Shop. We Deliver.</Text>
        </View>

        {/* Register Card */}
        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start shopping smarter today. Your account is stored on this device.</Text>

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
              autoCapitalize="none"
              returnKeyType="next"
              disabled={isLoading}
              right={<PaperTextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((visible) => !visible)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              />}
            />

            <Text style={styles.passwordHint}>
              Password must be at least 6 characters.
            </Text>

            {/* Confirm Password */}
            <PaperTextInput
              label="Confirm Password"
              mode="outlined"
              value={formData.confirmPassword}
              onChangeText={(v) => handleFieldChange('confirmPassword', v)}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              autoCapitalize="none"
              returnKeyType="next"
              disabled={isLoading}
              right={<PaperTextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword((visible) => !visible)}
                accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              />}
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
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                />
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText}>Terms of Service</Text>{' '}
                and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? <ActivityIndicator color="white" size="small" /> : (
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