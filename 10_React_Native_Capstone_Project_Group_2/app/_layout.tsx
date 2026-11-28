import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Providers } from './providers';
import { useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
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
      <RootNavigator />
    </Providers>
  );
}