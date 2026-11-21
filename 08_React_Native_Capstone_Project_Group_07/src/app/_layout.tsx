import { PhotosProvider } from '@/photos';
import { SearchHistoryProvider } from '@/searchHistory';
import { darkTheme, fontFamily, lightTheme } from '@/theme';
import { ThemeModeProvider } from '@/themeMode';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // Dynamic Paper theme configuration (brand MD3 light/dark palettes from theme.ts, app-wide)
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Wait for Poppins (or a load error, then fall back to system fonts)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeModeProvider value={{ isDarkMode, setIsDarkMode }}>
      <PhotosProvider>
        <SearchHistoryProvider>
          <PaperProvider theme={theme}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                // Native headers (photo modal, history) follow the Paper palette in light/dark
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.onSurface,
                headerTitleStyle: { fontFamily: fontFamily.bold, color: theme.colors.onSurface },
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            >
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
