/**
 * Login Screen - Marketplace Auth
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput as PaperTextInput, Button, Title, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleLogin = async () => {
    setValidationError('');
    clearError();

    if (!username.trim()) {
      setValidationError('Please enter your username');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password');
      return;
    }

    try {
      await login(username.trim(), password);
      router.replace('/(app)/(tabs)/home');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign in. Please check your credentials.';
      if (Platform.OS === 'web') {
        window.alert(`Login Failed: ${message}`);
      } else {
        Alert.alert('Login Failed', message);
      }
    }
  };

  const handleDemoFill = () => {
    setUsername('emilys');
    setPassword('emilyspass');
    setValidationError('');
    clearError();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Title style={styles.title}>Marketplace</Title>
          <Text style={styles.subtitle}>Sign in to discover great deals</Text>
        </View>

        <View style={styles.form}>
          <PaperTextInput
            mode="outlined"
            label="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (validationError) setValidationError('');
              if (error) clearError();
            }}
            autoCapitalize="none"
            autoCorrect={false}
            left={<PaperTextInput.Icon icon="account" />}
            style={styles.input}
            disabled={isLoading}
          />

          <PaperTextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (validationError) setValidationError('');
              if (error) clearError();
            }}
            secureTextEntry={!showPassword}
            left={<PaperTextInput.Icon icon="lock" />}
            right={
              <PaperTextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            disabled={isLoading}
          />

          {(validationError || error) && (
            <HelperText type="error" visible={!!(validationError || error)}>
              {validationError || error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <Button
            mode="text"
            onPress={handleDemoFill}
            disabled={isLoading}
            style={styles.demoButton}
          >
            Use Demo Account (emilys)
          </Button>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={styles.link}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Don&apos;t have an account?{' '}
              <Text style={styles.linkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A73E8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F6368',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  demoButton: {
    marginTop: 8,
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#5F6368',
  },
  linkBold: {
    color: '#1A73E8',
    fontWeight: '700',
  },
});