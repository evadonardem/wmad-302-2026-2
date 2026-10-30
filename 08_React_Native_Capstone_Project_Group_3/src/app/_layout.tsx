import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { PhotosProvider } from '@/photos';
import { SearchHistoryProvider } from '@/searchHistory';
import { ThemeModeProvider } from '@/themeMode';
import { darkTheme, lightTheme } from '@/theme';

export default function RootLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic Paper theme configuration (custom ocean-teal MD3 palettes, app-wide)
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeModeProvider value={{ isDarkMode, setIsDarkMode }}>
      <PhotosProvider>
        <SearchHistoryProvider>
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
            </Stack>
          </PaperProvider>
        </SearchHistoryProvider>
      </PhotosProvider>
    </ThemeModeProvider>
  );
}