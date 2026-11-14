/**
 * Root Layout - Entry point with providers
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from 'react-native-paper';
import { Providers } from './providers';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { isLoading } = useAuth();
  const { darkMode } = useSettings();
  const theme = useTheme();

  // Hide the splash screen once the stored session has been checked
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isLoading]);

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Providers>
        <RootNavigator />
      </Providers>
    </ErrorBoundary>
  );
}
