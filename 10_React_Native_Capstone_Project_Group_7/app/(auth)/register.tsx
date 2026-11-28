/**
 * Register Screen
 */
import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Checkbox } from 'react-native-paper';
import { styles as baseStyles } from './styles';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { getThemedStyles } from '@/utils/themeStyles';
import { Alert } from '@/utils/alert';

export default function RegisterScreen() {
  const router = useRouter();
  const { colorMode, t } = useAppPreferences();
  const styles = getThemedStyles(baseStyles, colorMode === 'dark');
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

  // Validation helpers
  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.username.trim()) return 'Username is required';
    if (formData.username.trim().length < 3) return 'Username must be at least 3 characters';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return 'Invalid email format';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (formData.age) {
      const age = Number(formData.age);
      if (!Number.isInteger(age) || age < 13 || age > 120) return 'Age must be a whole number between 13 and 120';
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

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
      });
      router.replace('/(app)/(tabs)/home');
    } catch {
      // Registration errors are displayed from auth context state.
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [{ text: 'OK', onPress: clearError }]);
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
            source={require('../../assets/logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel={t('Marketplace')}
          />
        </View>

        {/* Register Card */}
        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>{t('Create Account')}</Text>
            <Text style={styles.subtitle}>{t('Start shopping smarter today')}</Text>

            {/* Name Fields Row */}
            <View style={styles.nameRow}>
              <PaperTextInput
                label={t('First Name')}
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
                label={t('Last Name')}
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
              label={t('Username')}
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
              label={t('Email')}
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
              label={t('Password')}
              mode="outlined"
              value={formData.password}
              onChangeText={(v) => handleFieldChange('password', v)}
              style={styles.input}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              returnKeyType="next"
              disabled={isLoading}
              right={
                <View style={styles.eyeIcon}>
                  <Text onPress={() => setShowPassword(!showPassword)} style={styles.eyeText}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </View>
              }
            />

            {/* Confirm Password */}
            <PaperTextInput
              label={t('Confirm Password')}
              mode="outlined"
              value={formData.confirmPassword}
              onChangeText={(v) => handleFieldChange('confirmPassword', v)}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              returnKeyType="next"
              disabled={isLoading}
              right={
                <View style={styles.eyeIcon}>
                  <Text onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeText}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </Text>
                </View>
              }
            />

            {/* Optional Fields */}
            <View style={styles.optionalRow}>
              <PaperTextInput
                label={t('Age (Optional)')}
                mode="outlined"
                value={formData.age}
                onChangeText={(v) => handleFieldChange('age', v)}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                returnKeyType="next"
                disabled={isLoading}
              />
              <View style={[styles.halfInput, styles.genderSelector]}>
                <Text style={styles.genderLabel}>{t('Gender')}</Text>
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
                    ]}>♂ {t('Male')}</Text>
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
                    ]}>♀ {t('Female')}</Text>
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
                {t('I agree to the')}{' '}
                <Text style={styles.linkText}>{t('Terms of Service')}</Text>{' '}
                and{' '}
                <Text style={styles.linkText}>{t('Privacy Policy')}</Text>
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
                <Text style={styles.buttonText}>{t('Create Account')}</Text>
              )}
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('Already have an account? ')}</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.link}>
                <Text style={styles.linkText}>{t('Sign In')}</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}