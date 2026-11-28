/**
 * App Layout - Protected routes with auth guard
 */
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import { MarketplaceMenu } from '@/components/MarketplaceMenu';
import { useAppPreferences } from '@/context/AppPreferencesContext';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colorMode } = useAppPreferences();
  const isDark = colorMode === 'dark';
  const [menuVisible, setMenuVisible] = useState(false);

  // Show loading while checking auth
  if (isLoading) {
    return null; // Or a loading screen
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            title: 'Marketplace',
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
            headerTintColor: isDark ? '#F5F5F5' : '#202124',
            headerTitleStyle: { color: isDark ? '#F5F5F5' : '#202124' },
            headerShadowVisible: false,
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => setMenuVisible(true)}
                accessibilityLabel="Open navigation menu"
              />
            ),
          }}
        />
        <Stack.Screen name="product/[id]" />
      </Stack>
      <MarketplaceMenu visible={menuVisible} onDismiss={() => setMenuVisible(false)} />
    </>
  );
}