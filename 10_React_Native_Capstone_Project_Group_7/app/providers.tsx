/**
 * Providers - All context providers wrapped here
 */
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { PaperProvider } from 'react-native-paper';
import { darkTheme, theme } from '@/constants/theme';
import { AppPreferencesProvider, useAppPreferences } from '@/context/AppPreferencesContext';
import { StatusBar } from 'expo-status-bar';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppPreferencesProvider>
      <ThemedProviders>{children}</ThemedProviders>
    </AppPreferencesProvider>
  );
}

function ThemedProviders({ children }: { children: ReactNode }) {
  const { colorMode } = useAppPreferences();
  return (
    <PaperProvider theme={colorMode === 'dark' ? darkTheme : theme}>
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </PaperProvider>
  );
}