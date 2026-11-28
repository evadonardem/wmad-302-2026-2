/**
 * Login Screen - Complete, working implementation
 * Students can use as reference for building register screen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Divider } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import { styles as baseStyles } from './styles';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { getThemedStyles } from '@/utils/themeStyles';
import { Alert } from '@/utils/alert';

export default function LoginScreen() {
  const router = useRouter();
  const { colorMode, t } = useAppPreferences();
  const styles = getThemedStyles(baseStyles, colorMode === 'dark');
  const { login, isLoading, error, clearError } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      await login(username.trim(), password.trim());
      router.replace(redirect || '/(app)/(tabs)/home');
    } catch {
      // Error handled in context
    }
  };

  const handleDemoLogin = async () => {
    // DummyJSON test credentials: emilys / emilyspass
    setUsername('emilys');
    setPassword('emilyspass');
    try {
      await login('emilys', 'emilyspass');
      router.replace(redirect || '/(app)/(tabs)/home');
    } catch {
      // Error handled in context
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Google Sign-In',
      'Google authentication is not configured yet.',
      [{ text: 'OK' }]
    );
  };

  const handleFacebookSignIn = () => {
    Alert.alert(
      'Facebook Sign-In',
      'Facebook authentication is not configured yet.',
      [{ text: 'OK' }]
    );
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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

        {/* Login Card */}
        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>{t('Welcome Back')}</Text>
            <Text style={styles.subtitle}>{t('Sign in to continue shopping')}</Text>

            {/* Username Field */}
            <PaperTextInput
              label={t('Username or Email')}
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              disabled={isLoading}
            />

            {/* Password Field */}
            <PaperTextInput
              label={t('Password')}
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              disabled={isLoading}
              right={<TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>}
            />

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>{t('Sign In')}</Text>
              )}
            </Button>

            {/* Google Sign-In */}
            <View style={styles.dividerContainer}>
              <Divider style={styles.socialDivider} />
              <Text style={styles.dividerText}>{t('or')}</Text>
              <Divider style={styles.socialDivider} />
            </View>
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                style={styles.googleButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                <FontAwesome name="google" size={22} color="#4285F4" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFacebookSignIn}
                disabled={isLoading}
                style={styles.facebookButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Facebook"
              >
                <FontAwesome name="facebook" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Demo Login */}
            <View style={styles.demoContainer}>
              <Divider style={styles.divider} />
              <TouchableOpacity onPress={handleDemoLogin} disabled={isLoading} style={styles.demoButton}>
                <Text style={styles.demoButtonText}>{t('Try Demo Account (emilys / emilyspass)')}</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t("Don't have an account? ")}</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                style={styles.link}
              >
                <Text style={styles.linkText}>{t('Sign Up')}</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}