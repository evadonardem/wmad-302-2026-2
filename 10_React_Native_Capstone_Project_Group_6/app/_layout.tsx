/**
 * Root Layout - Entry point with providers
 */
import { Stack } from 'expo-router';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppTheme } from '@/context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

/** The navigator lives inside Providers so it can read the current theme. */
function ThemedStack() {
  const { colors } = useAppTheme();
  // Phones draw apps edge to edge, so without this the top of every screen sits UNDER the
  // clock and status icons. insets.top is the height of that strip (0 on web).
  const insets = useSafeAreaInsets();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background, paddingTop: insets.top },
      }}
    >
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