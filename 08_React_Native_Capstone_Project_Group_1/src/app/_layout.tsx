import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { FavoritesProvider } from '@/favorites';
import { PhotosProvider } from '@/photos';
import { SearchHistoryProvider } from '@/searchHistory';
import { ThemeModeProvider } from '@/themeMode';

// Yellow accent palettes: the standard MD3 themes with the primary colors swapped to yellow.
// Light mode uses a deeper amber so text on buttons stays readable on a white background.
const YellowLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#9a6f00',
    onPrimary: '#ffffff',
    primaryContainer: '#ffe08a',
    onPrimaryContainer: '#2b1f00',
    secondaryContainer: '#ffefc2',
    onSecondaryContainer: '#2b1f00',
  },
};

const YellowDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ffd54f',
    onPrimary: '#3a2a00',
    primaryContainer: '#574200',
    onPrimaryContainer: '#ffe08a',
    secondaryContainer: '#4a3b10',
    onSecondaryContainer: '#ffefc2',
  },
};

export default function RootLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic Paper theme configuration (MD3 light/dark palettes, app-wide)
  const theme = isDarkMode ? YellowDarkTheme : YellowLightTheme;

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