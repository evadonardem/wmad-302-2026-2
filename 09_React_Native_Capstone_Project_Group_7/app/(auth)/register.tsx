/**
 * Register Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, TextInput as PaperTextInput, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APP_COLORS } from '@/constants/theme';
import { styles } from './styles';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    if (formData.age && (parseInt(formData.age, 10) < 13 || parseInt(formData.age, 10) > 120)) {
      return 'Age must be between 13 and 120';
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
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender,
      });

      router.replace('/(app)/(tabs)/home');
    } catch {
      // Handled in context
    }
  };

  const handleFieldChange = (field: string, value: string) => {
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
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="chef-hat" size={34} color="#FAF9F5" />
          </View>
          <Text style={styles.appName}>Atelier Cookbook</Text>
          <Text style={styles.tagline}>Start Your Culinary Collection</Text>
        </View>

        <Card style={styles.card} elevation={1}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Join the Kitchen</Text>
            <Text style={styles.subtitle}>Create your account to save & plan meals</Text>

            <View style={styles.nameRow}>
              <PaperTextInput
                label="First Name"
                mode="outlined"
                value={formData.firstName}
                onChangeText={(v) => handleFieldChange('firstName', v)}
                style={[styles.input, styles.halfInput]}
                disabled={isLoading}
                activeOutlineColor={APP_COLORS.primary}
                outlineColor={APP_COLORS.border}
              />
              <PaperTextInput
                label="Last Name"
                mode="outlined"
                value={formData.lastName}
                onChangeText={(v) => handleFieldChange('lastName', v)}
                style={[styles.input, styles.halfInput]}
                disabled={isLoading}
                activeOutlineColor={APP_COLORS.primary}
                outlineColor={APP_COLORS.border}
              />
            </View>

            <PaperTextInput
              label="Username"
              mode="outlined"
              value={formData.username}
              onChangeText={(v) => handleFieldChange('username', v)}
              style={styles.input}
              autoCapitalize="none"
              disabled={isLoading}
              activeOutlineColor={APP_COLORS.primary}
              outlineColor={APP_COLORS.border}
            />

            <PaperTextInput
              label="Email"
              mode="outlined"
              value={formData.email}
              onChangeText={(v) => handleFieldChange('email', v)}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={isLoading}
              activeOutlineColor={APP_COLORS.primary}
              outlineColor={APP_COLORS.border}
            />

            <PaperTextInput
              label="Password"
              mode="outlined"
              value={formData.password}
              onChangeText={(v) => handleFieldChange('password', v)}
              style={styles.input}
              secureTextEntry={!showPassword}
              disabled={isLoading}
              activeOutlineColor={APP_COLORS.primary}
              outlineColor={APP_COLORS.border}
              right={
                <PaperTextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  color={APP_COLORS.primary}
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
              disabled={isLoading}
              activeOutlineColor={APP_COLORS.primary}
              outlineColor={APP_COLORS.border}
              right={
                <PaperTextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color={APP_COLORS.primary}
                />
              }
            />

            <View style={styles.optionalRow}>
              <PaperTextInput
                label="Age (Optional)"
                mode="outlined"
                value={formData.age}
                onChangeText={(v) => handleFieldChange('age', v)}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                disabled={isLoading}
                activeOutlineColor={APP_COLORS.primary}
                outlineColor={APP_COLORS.border}
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
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.gender === 'male' && styles.genderOptionTextSelected,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFieldChange('gender', 'female')}
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
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.termsContainer}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                color={APP_COLORS.primary}
              />
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
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