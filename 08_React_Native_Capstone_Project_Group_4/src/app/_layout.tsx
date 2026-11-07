import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { PhotosProvider } from '@/photos';
import { SearchHistoryProvider } from '@/searchHistory';
import { ThemeModeProvider } from '@/themeMode';

export default function RootLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const baseTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: isDarkMode ? '#9CCFB0' : '#236B50',
      onPrimary: isDarkMode ? '#102218' : '#FFFFFF',
      primaryContainer: isDarkMode ? '#244B37' : '#DCEFE2',
      onPrimaryContainer: isDarkMode ? '#D8F1DF' : '#173D2B',
      secondary: isDarkMode ? '#E1A58C' : '#A7553B',
      onSecondary: isDarkMode ? '#35170D' : '#FFFFFF',
      background: isDarkMode ? '#111713' : '#F7F9F6',
      onBackground: isDarkMode ? '#E8EEE9' : '#1E2922',
      surface: isDarkMode ? '#171F1A' : '#FFFFFF',
      onSurface: isDarkMode ? '#E8EEE9' : '#1E2922',
      surfaceVariant: isDarkMode ? '#29332C' : '#EDF1EC',
      onSurfaceVariant: isDarkMode ? '#BEC9C0' : '#59675D',
      outline: isDarkMode ? '#87958B' : '#849187',
      outlineVariant: isDarkMode ? '#3A463E' : '#D9E1DA',
    },
  };

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
