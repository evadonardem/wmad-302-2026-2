/**
 * Login Screen - Botanical Sage & Terracotta Theme
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, TextInput as PaperTextInput, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APP_COLORS } from '@/constants/theme';
import { styles } from './styles';

export default function LoginScreen() {
  const router = useRouter();
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
      router.replace((redirect as any) || '/(app)/(tabs)/home');
    } catch {
      // Handled in context
    }
  };

  const handleDemoLogin = async () => {
    setUsername('emilys');
    setPassword('emilyspass');
    try {
      await login('emilys', 'emilyspass');
      router.replace((redirect as any) || '/(app)/(tabs)/home');
    } catch {
      // Handled in context
    }
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
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={34} color="#FAF9F5" />
          </View>
          <Text style={styles.appName}>Atelier Cookbook</Text>
          <Text style={styles.tagline}>Curated Seasonal Recipes & Kitchen Craft</Text>
        </View>

        <Card style={styles.card} elevation={1}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to open your personal recipe book</Text>

            <PaperTextInput
              label="Username or Email"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              activeOutlineColor={APP_COLORS.primary}
              outlineColor={APP_COLORS.border}
              disabled={isLoading}
            />

            <PaperTextInput
              label="Password"
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              activeOutlineColor={APP_COLORS.primary}
              outlineColor={APP_COLORS.border}
              disabled={isLoading}
              right={
                <PaperTextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  color={APP_COLORS.primary}
                />
              }
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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

            <View style={styles.demoContainer}>
              <Divider style={styles.divider} />
              <TouchableOpacity onPress={handleDemoLogin} disabled={isLoading} style={styles.demoButton}>
                <Text style={styles.demoButtonText}>Try Demo Kitchen (emilys / emilyspass)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>New to Atelier? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}