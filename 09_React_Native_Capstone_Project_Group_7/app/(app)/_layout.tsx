/**
 * App Layout - Protected routes handling session validation
 */
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}