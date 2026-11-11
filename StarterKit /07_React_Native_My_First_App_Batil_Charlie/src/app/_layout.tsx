
import { useState } from 'react';
import { Stack } from 'expo-router';
import { FavoritesProvider } from '@/favorites';
import {
  ThemeModeProvider,
  ThemeProvider,
  createTheme,
  type ThemeMode,
} from '@/theme';

// TODO 13: Dynamic Themes
const theme = (mode: ThemeMode = 'light') =>
  createTheme({
    palette: { mode },
  });

export default function RootLayout() {
  // TODO 14: State Management
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <FavoritesProvider>
      {/* TODO 16: Theme Binding Layout */}
      <ThemeModeProvider value={{ isDarkMode, setIsDarkMode }}>
        <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </ThemeModeProvider>
    </FavoritesProvider>
  );
}
