import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { FavoritesProvider } from '@/favorites';
import { PhotosProvider } from '@/photos';
import { SearchHistoryProvider } from '@/searchHistory';
import { ThemeModeProvider } from '@/themeMode';

// Halloween Philippines palettes: the standard MD3 themes recolored.
// Night = deep violet-black with pumpkin orange and candle yellow (the sun on the Philippine flag).
// Dusk = candle-lit cream with burnt pumpkin and purple.
const HalloweenNightTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#120a1e',
    surface: '#1d1230',
    surfaceVariant: '#2a1b45',
    primary: '#ff7a1a',
    onPrimary: '#1a0900',
    primaryContainer: '#5c2a00',
    onPrimaryContainer: '#ffd8b8',
    secondary: '#f5c518',
    onSecondary: '#2b2200',
    secondaryContainer: '#4a2f75',
    onSecondaryContainer: '#f0e1ff',
    outline: '#7a5fa3',
    outlineVariant: '#3b2a5c',
    onBackground: '#f6ecff',
    onSurface: '#f6ecff',
    onSurfaceVariant: '#c7b3e6',
    elevation: {
      level0: 'transparent',
      level1: '#221538',
      level2: '#271a40',
      level3: '#2c1d48',
      level4: '#2e1f4c',
      level5: '#312250',
    },
  },
};

const HalloweenDuskTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#fff3e0',
    surface: '#fffaf2',
    surfaceVariant: '#ffe2bf',
    primary: '#d9560b',
    onPrimary: '#ffffff',
    primaryContainer: '#ffd9b8',
    onPrimaryContainer: '#3b1500',
    secondary: '#5b3a8c',
    onSecondary: '#ffffff',
    secondaryContainer: '#e9d9ff',
    onSecondaryContainer: '#2a0f52',
    outline: '#8a6a4a',
    outlineVariant: '#e0c4a0',
    onBackground: '#2b1608',
    onSurface: '#2b1608',
    onSurfaceVariant: '#6b4a2e',
    elevation: {
      level0: 'transparent',
      level1: '#fff0dc',
      level2: '#ffe9cf',
      level3: '#ffe2c2',
      level4: '#ffdfbc',
      level5: '#ffdab5',
    },
  },
};

export default function RootLayout() {
  // Starts on the dark Halloween night look; the sun/moon button switches to the cream dusk look.
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Dynamic Paper theme configuration (MD3 light/dark palettes, app-wide)
  const theme = isDarkMode ? HalloweenNightTheme : HalloweenDuskTheme;

  return (
    <ThemeModeProvider value={{ isDarkMode, setIsDarkMode }}>
      <PhotosProvider>
        <SearchHistoryProvider>
          <FavoritesProvider>
            <PaperProvider theme={theme}>
              <StatusBar style={isDarkMode ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                {/* The photo detail route opens as a modal with the native header providing Back */}
                <Stack.Screen
                  name="photo/[id]"
                  options={{ headerShown: true, presentation: 'modal', title: 'Tourist Spot' }}
                />
                {/* Recent searches screen pushes over the tabs with its own native header */}
                <Stack.Screen name="history" options={{ headerShown: true, title: 'Recent Searches' }} />
                {/* Saved photos screen, opened from the heart button on the Search tab */}
                <Stack.Screen name="favorites" options={{ headerShown: true, title: 'Favorites' }} />
              </Stack>
            </PaperProvider>
          </FavoritesProvider>
        </SearchHistoryProvider>
      </PhotosProvider>
    </ThemeModeProvider>
  );
}