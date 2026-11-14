/**
 * Providers - All context providers wrapped here
 */
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { PaperProvider } from 'react-native-paper';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { darkTheme, theme } from '@/constants/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemedProviders>
          <FavoritesProvider>{children}</FavoritesProvider>
        </ThemedProviders>
      </SettingsProvider>
    </AuthProvider>
  );
}

function ThemedProviders({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  return (
    <PaperProvider theme={settings.darkModeEnabled ? darkTheme : theme}>
      {children}
    </PaperProvider>
  );
}