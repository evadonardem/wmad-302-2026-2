/**
 * App Layout - Protected routes with auth guard
 */
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useAppTheme();

  // Show loading while checking auth
  if (isLoading) {
    return null; // Or a loading screen
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      {/* Add other protected screens here */}
    </Stack>
  );
}