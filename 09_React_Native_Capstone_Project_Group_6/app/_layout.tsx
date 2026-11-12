/**
 * Root Layout - Entry point with providers
 * - Keeps the native splash screen up until the saved login has been checked
 * - Exports an ErrorBoundary (Expo Router uses it if a screen crashes)
 */
import React, { useEffect } from 'react';
import { Stack, ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Providers } from './providers';
import { useAuth } from '@/context/AuthContext';
import { ErrorFallback } from '@/components/CommonComponents';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} onRetry={retry} />;
}

// Lives inside the providers so it can read the auth state
function AppShell() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => undefined);
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
      <AppShell />
    </Providers>
  );
}