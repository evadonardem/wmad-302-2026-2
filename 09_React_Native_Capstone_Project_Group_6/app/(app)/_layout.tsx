/**
 * App Layout - Protected routes with auth guard
 * Also exports an ErrorBoundary so a crash on one screen shows a friendly
 * message and a "Try again" button instead of a blank app.
 */
import React from 'react';
import { Redirect, Stack, ErrorBoundaryProps } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { ErrorFallback } from '@/components/CommonComponents';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} onRetry={retry} />;
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  // Wait while the saved login is being checked
  if (isLoading) {
    return null;
  }

  // Not logged in: go to the login screen
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
