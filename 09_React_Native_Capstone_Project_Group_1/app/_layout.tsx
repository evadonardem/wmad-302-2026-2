/**
 * Root Layout - Entry point with providers
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Needs to live inside Providers so it can read the auth state
function RootNavigator() {
  const { isLoading } = useAuth();

  // Hide the splash screen once the saved session has been checked
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {
        // Already hidden
      });
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <ErrorBoundary>
        <RootNavigator />
      </ErrorBoundary>
    </Providers>
  );
}