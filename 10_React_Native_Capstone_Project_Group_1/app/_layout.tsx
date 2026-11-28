/**
 * Root Layout - Entry point with providers
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Providers } from './providers';

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </Providers>
  );
}
