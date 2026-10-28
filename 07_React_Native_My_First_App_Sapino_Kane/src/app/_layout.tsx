import { useState } from 'react';
import { Stack } from 'expo-router';
import { FavoritesProvider } from '@/favorites';
import { ThemeModeProvider, ThemeProvider, createTheme, type ThemeMode } from '@/theme';

// TODO 13 [Dynamic Themes]: Complete the theme creation object map structure
const theme = (mode: ThemeMode = 'light') => createTheme({ palette: { mode } });

export default function RootLayout() {
  // TODO 14 [State Management]: Initialize a boolean React state hook variable
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  return (
    <FavoritesProvider>
      {/* TODO 16 [Theme Binding Layout]: Wrap the <Stack /> inside BOTH providers below */}
      <ThemeModeProvider value={{ isDarkMode, setIsDarkMode }}>
        <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </ThemeModeProvider>
    </FavoritesProvider>
  );
}
