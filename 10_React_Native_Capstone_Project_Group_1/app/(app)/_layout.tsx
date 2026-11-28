/**
 * App Layout - Protected routes with auth guard
 * Unauthenticated users are redirected to the login screen and sent back to the
 * page they asked for (deep link) after signing in.
 */
import React from 'react';
import { Redirect, Stack, usePathname } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { LoadingView } from '@/components/CommonComponents';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const theme = useTheme();

  // Wait for the stored session to be checked before deciding
  if (isLoading) {
    return <LoadingView message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href={{ pathname: '/(auth)/login', params: { redirect: pathname } }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: '700', color: theme.colors.onSurface },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="orders/index" options={{ title: 'My Orders' }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Order Details' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="addresses" options={{ title: 'My Addresses' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
