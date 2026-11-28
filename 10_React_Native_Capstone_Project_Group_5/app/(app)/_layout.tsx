/**
 * App layout; checkout enforces authentication while browsing remains public.
 */
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

export default function AppLayout() {
  const { isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search-results" />
      {/* Add other protected screens here */}
    </Stack>
  );
}