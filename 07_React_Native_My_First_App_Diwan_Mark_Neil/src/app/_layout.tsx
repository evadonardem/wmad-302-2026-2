import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from '@/favorites';
import { PaletteProvider, type PaletteKey } from '@/palette';
import { ThemeModeProvider, ThemeProvider, createTheme, type ThemeMode } from '@/theme';

// TODO 13: build a theme object for the given mode
const theme = (mode: ThemeMode = 'light') =>
  createTheme({
    palette: { mode },
  });

export default function RootLayout() {
  // TODO 14: dark mode flag
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('aurora');

  return (
    // TODO 16: bind the theme + mode setter to the whole app
    <FavoritesProvider>
      <PaletteProvider value={{ paletteKey, setPaletteKey }}>
        <ThemeModeProvider value={{ isDarkMode, setIsDarkMode }}>
          <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }} />
          </ThemeProvider>
        </ThemeModeProvider>
      </PaletteProvider>
    </FavoritesProvider>
  );
}
