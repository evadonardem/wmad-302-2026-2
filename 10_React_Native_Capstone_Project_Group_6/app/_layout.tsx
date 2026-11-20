/**
 * Root Layout - Entry point with providers
 */
import { Stack } from 'expo-router';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppTheme } from '@/context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

/** The navigator lives inside Providers so it can read the current theme. */
function ThemedStack() {
  const { colors } = useAppTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  // preventAutoHideAsync() above keeps the splash screen up until WE say so. Without this
  // call it never goes away and the phone shows a blank white screen.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <ErrorBoundary>
      <Providers>
        <ThemedStack />
      </Providers>
    </ErrorBoundary>
  );
}