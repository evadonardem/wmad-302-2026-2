import { useState } from 'react';
import { Stack } from 'expo-router';
import { FavoritesProvider } from '@/favorites';
import { ThemeModeProvider, ThemeProvider, createTheme, type ThemeMode } from '@/theme';

// TODO 13 [Dynamic Themes]: Complete the theme creation arrow function.
const theme = (mode: ThemeMode = 'light') => createTheme(mode);

export default function RootLayout() {
  // TODO 14 [State Management]: Initialize a boolean React state hook variable named 'isDarkMode' defaulting to false.
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
