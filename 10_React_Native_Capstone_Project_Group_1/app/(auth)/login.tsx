/**
 * Login Screen
 * Errors are shown inline (Alert.alert buttons don't work on web).
 * After signing in the user goes to the page they originally asked for
 * (the `redirect` param) or the shop.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Divider } from 'react-native-paper';
import { AuthBrandHeader } from '@/components/AuthBrandHeader';
import { styles } from './styles';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setFormError('Please enter both username and password');
      return;
    }
    setFormError(null);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Brand */}
        <AuthBrandHeader tagline="Merry Christmas! Shop Smart, Save More" />

        {/* Login Card */}
        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue shopping</Text>

            {/* Username Field */}
            <PaperTextInput
              label="Username or Email"
              mode="outlined"
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                if (error) clearError();
              }}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              disabled={isLoading}
            />

            {/* Password Field */}
            <PaperTextInput
              label="Password"
              mode="outlined"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (error) clearError();
              }}
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
            {(formError || error) && (
              <View style={styles.errorContainer} accessibilityRole="alert">
                <Text style={styles.errorText}>{formError ?? error}</Text>
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
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </Button>

            {/* Demo Login */}
            <View style={styles.demoContainer}>
              <Divider style={styles.divider} />
              <TouchableOpacity onPress={handleDemoLogin} disabled={isLoading} style={styles.demoButton}>
                <Text style={styles.demoButtonText}>Try Demo Account (emilys / emilyspass)</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                style={styles.link}
              >
                <Text style={styles.linkText}>Sign Up</Text>
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