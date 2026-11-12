/**
 * App Layout - Protected routes with auth guard
 */
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Redirect } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return null; // Or a loading screen
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <FavoritesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            headerShown: true,
            title: 'Recipe',
            headerTintColor: '#E85D04',
            headerStyle: { backgroundColor: '#FFFDF8' },
            headerShadowVisible: false,
          }}
        />
        {/* Add other protected screens here */}
      </Stack>
    </FavoritesProvider>
  );
}