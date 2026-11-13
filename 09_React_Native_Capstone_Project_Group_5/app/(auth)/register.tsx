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
import { styles } from './styles';

type RegistrationForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: 'male' | 'female';
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (
    values: RegistrationForm = formData,
    acceptedTerms: boolean = agreedToTerms
  ): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.firstName.trim()) errors.firstName = 'Enter your first name.';
    if (!values.lastName.trim()) errors.lastName = 'Enter your last name.';
    if (!/^[a-zA-Z0-9._-]{3,24}$/.test(values.username.trim())) {
      errors.username = 'Use 3-24 letters, numbers, dots, underscores, or hyphens.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (values.password.length < 8) errors.password = 'Use at least 8 characters.';
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (values.age.trim()) {
      const age = Number(values.age);
      if (!Number.isInteger(age) || age < 13 || age > 120) {
        errors.age = 'Age must be a whole number from 13 to 120.';
      }
    }
    if (!acceptedTerms) errors.terms = 'Please accept the terms to create an account.';

    return errors;
  };

  const handleRegister = async () => {
    setHasSubmitted(true);
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      // The auth context exposes the error inline.
    }
  };

  const handleFieldChange = (field: Exclude<keyof RegistrationForm, 'gender'>, value: string) => {
    const updatedForm = { ...formData, [field]: value } as RegistrationForm;
    setFormData(updatedForm);
    if (hasSubmitted) setFieldErrors(validateForm(updatedForm));
    if (error) clearError();
  };

  const passwordStrength = [
    formData.password.length >= 8,
    /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password),
    /\d/.test(formData.password),
    /[^a-zA-Z0-9]/.test(formData.password),
  ].filter(Boolean).length;
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleTermsChange = () => {
    const nextAgreedToTerms = !agreedToTerms;
    setAgreedToTerms(nextAgreedToTerms);
    if (hasSubmitted) setFieldErrors(validateForm(formData, nextAgreedToTerms));
  };

  const handleGenderChange = (gender: RegistrationForm['gender']) => {
    const updatedForm = { ...formData, gender };
    setFormData(updatedForm);
    if (hasSubmitted) setFieldErrors(validateForm(updatedForm));
  };

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

            <View style={styles.nameRow}>
              <View style={styles.halfInput}>
              <PaperTextInput
                label="First Name"
                mode="outlined"
                value={formData.firstName}
                onChangeText={(v) => handleFieldChange('firstName', v)}
                style={styles.input}
                error={Boolean(fieldErrors.firstName)}
                autoCapitalize="words"
                autoComplete="given-name"
                returnKeyType="next"
                disabled={isLoading}
              />
                {fieldErrors.firstName ? <Text style={styles.fieldError}>{fieldErrors.firstName}</Text> : null}
              </View>
              <View style={styles.halfInput}>
              <PaperTextInput
                label="Last Name"
                mode="outlined"
                value={formData.lastName}
                onChangeText={(v) => handleFieldChange('lastName', v)}
                style={styles.input}
                error={Boolean(fieldErrors.lastName)}
                autoCapitalize="words"
                autoComplete="family-name"
                returnKeyType="next"
                disabled={isLoading}
              />
                {fieldErrors.lastName ? <Text style={styles.fieldError}>{fieldErrors.lastName}</Text> : null}
              </View>
            </View>

            <PaperTextInput
              label="Username"
              mode="outlined"
              value={formData.username}
              onChangeText={(v) => handleFieldChange('username', v)}
              style={styles.input}
              error={Boolean(fieldErrors.username)}
              autoCapitalize="none"
              autoComplete="username"
              returnKeyType="next"
              disabled={isLoading}
            />
            {fieldErrors.username ? <Text style={styles.fieldError}>{fieldErrors.username}</Text> : null}

            <PaperTextInput
              label="Email"
              mode="outlined"
              value={formData.email}
              onChangeText={(v) => handleFieldChange('email', v)}
              style={styles.input}
              error={Boolean(fieldErrors.email)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              disabled={isLoading}
            />
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

            <PaperTextInput
              label="Password"
              mode="outlined"
              value={formData.password}
              onChangeText={(v) => handleFieldChange('password', v)}
              style={styles.input}
              error={Boolean(fieldErrors.password)}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              returnKeyType="next"
              disabled={isLoading}
              right={
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
            />
            <View style={styles.passwordStrength}>
              <View style={styles.strengthTrack}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${passwordStrength * 25}%`,
                      backgroundColor: ['#D7CCC8', '#C62828', '#EF6C00', '#7CB342', '#2E7D32'][passwordStrength],
                    },
                  ]}
                />
              </View>
              <Text style={styles.strengthLabel} accessibilityLiveRegion="polite">
                {formData.password ? `Password strength: ${strengthLabels[passwordStrength]}` : 'Use at least 8 characters'}
              </Text>
            </View>
            {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

            <PaperTextInput
              label="Confirm Password"
              mode="outlined"
              value={formData.confirmPassword}
              onChangeText={(v) => handleFieldChange('confirmPassword', v)}
              style={styles.input}
              error={Boolean(fieldErrors.confirmPassword)}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              returnKeyType="next"
              disabled={isLoading}
              right={
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              }
            />
            {fieldErrors.confirmPassword ? <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text> : null}

            <View style={styles.optionalRow}>
              <PaperTextInput
                label="Age (Optional)"
                mode="outlined"
                value={formData.age}
                onChangeText={(v) => handleFieldChange('age', v)}
                style={[styles.input, styles.halfInput]}
                error={Boolean(fieldErrors.age)}
                keyboardType="numeric"
                returnKeyType="next"
                disabled={isLoading}
              />
              {fieldErrors.age ? <Text style={styles.fieldError}>{fieldErrors.age}</Text> : null}

              <View style={[styles.halfInput, styles.genderSelector]}>
                <Text style={styles.genderLabel}>Gender</Text>
                <View style={styles.genderOptions}>
                  <TouchableOpacity
                    accessibilityRole="radio"
                    accessibilityState={{ selected: formData.gender === 'male' }}
                    disabled={isLoading}
                    onPress={() => handleGenderChange('male')}
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
                    accessibilityRole="radio"
                    accessibilityState={{ selected: formData.gender === 'female' }}
                    disabled={isLoading}
                    onPress={() => handleGenderChange('female')}
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

            <View style={styles.termsContainer}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={handleTermsChange}
                disabled={isLoading}
              />
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
            {fieldErrors.terms ? <Text style={styles.fieldError}>{fieldErrors.terms}</Text> : null}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </Button>

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
