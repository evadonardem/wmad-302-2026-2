/**
 * App Layout - Protected routes with auth guard
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
      <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
      <Stack.Screen name="orders" options={{ headerShown: true, title: 'My Orders' }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: true, title: 'Order details' }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: true, title: 'Edit profile' }} />
      <Stack.Screen name="addresses" options={{ headerShown: true, title: 'Addresses' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Product' }} />
    </Stack>
  );
}
