/**
 * Auth Layout - Public routes only (login, register)
 */
import { Stack } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';

export default function AuthLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}