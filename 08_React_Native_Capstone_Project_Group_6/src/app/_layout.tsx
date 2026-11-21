
import 'react-native-gesture-handler';

import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from 'react-native-paper';

import { PhotosProvider } from '@/photos';
import { SearchHistoryProvider } from '@/searchHistory';
import { ThemeModeProvider } from '@/themeMode';

export default function RootLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic light and dark themes
  const theme = isDarkMode
    ? MD3DarkTheme
    : MD3LightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeModeProvider
        value={{ isDarkMode, setIsDarkMode }}
      >
        <PhotosProvider>
          <SearchHistoryProvider>
            <PaperProvider theme={theme}>
              <StatusBar
                style={isDarkMode ? 'light' : 'dark'}
              />

              <Stack
                screenOptions={{
                  headerShown: false,

                  headerStyle: {
                    backgroundColor: theme.colors.surface,
                  },

                  headerTintColor: theme.colors.onSurface,

                  headerTitleStyle: {
                    color: theme.colors.onSurface,
                  },

                  headerShadowVisible: false,

                  contentStyle: {
                    backgroundColor: theme.colors.background,
                  },
                }}
              >
                <Stack.Screen name="(tabs)" />

                <Stack.Screen
                  name="photo/[id]"
                  options={{
                    headerShown: true,
                    presentation: 'modal',
                    title: 'Tourist Spot',
                  }}
                />

                <Stack.Screen
                  name="history"
                  options={{
                    headerShown: true,
                    title: 'Recent Searches',
                  }}
                />
              </Stack>
            </PaperProvider>
          </SearchHistoryProvider>
        </PhotosProvider>
      </ThemeModeProvider>
    </GestureHandlerRootView>
  );
}
