/**
 * Providers - All context providers wrapped here
 */
import { ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { darkTheme, theme } from '@/constants/theme';

function ThemedProvider({ children }: { children: ReactNode }) {
  const { darkMode } = useSettings();
  return <PaperProvider theme={darkMode ? darkTheme : theme}>{children}</PaperProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ThemedProvider>
        <AuthProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </AuthProvider>
      </ThemedProvider>
    </SettingsProvider>
  );
}

// Expo Router treats every file in app/ as a route; a default export keeps it warning-free.
export default Providers;
