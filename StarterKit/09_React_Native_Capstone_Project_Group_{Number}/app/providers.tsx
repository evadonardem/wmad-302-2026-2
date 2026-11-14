
/**
 * Providers - Global App Providers
 * Handles Authentication and Light/Dark Theme
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import { useColorScheme, View } from 'react-native';

import {
  PaperProvider,
  ActivityIndicator,
} from 'react-native-paper';

import { AuthProvider } from '@/context/AuthContext';

import {
  lightTheme,
  darkTheme,
} from '@/constants/theme';

import {
  getStorageItem,
  setStorageItem,
} from '@/utils/storage';

export type AppearanceMode = 'light' | 'dark' | 'system';

interface AppSettings {
  recipeNotifications: boolean;
  mealReminders: boolean;
  weeklyUpdates: boolean;
  appearance: AppearanceMode;
}

interface ThemeContextType {
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useAppTheme must be used inside Providers'
    );
  }

  return context;
}

export function Providers({
  children,
}: {
  children: ReactNode;
}) {
  const systemColorScheme = useColorScheme();

  const [appearance, setAppearanceState] =
    useState<AppearanceMode>('light');

  const [loadingTheme, setLoadingTheme] = useState(true);

  // Load saved appearance preference
  useEffect(() => {
    let mounted = true;

    const loadAppearance = async () => {
      try {
        const savedSettings =
          await getStorageItem<AppSettings>('user_settings');

        if (mounted && savedSettings?.appearance) {
          setAppearanceState(savedSettings.appearance);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        if (mounted) {
          setLoadingTheme(false);
        }
      }
    };

    loadAppearance();

    return () => {
      mounted = false;
    };
  }, []);

  // Update appearance and save it
  const setAppearance = useCallback(
    async (mode: AppearanceMode) => {
      setAppearanceState(mode);

      try {
        const existingSettings =
          await getStorageItem<AppSettings>('user_settings');

        const updatedSettings: AppSettings = {
          recipeNotifications:
            existingSettings?.recipeNotifications ?? true,
          mealReminders:
            existingSettings?.mealReminders ?? false,
          weeklyUpdates:
            existingSettings?.weeklyUpdates ?? true,
          appearance: mode,
        };

        await setStorageItem(
          'user_settings',
          updatedSettings
        );
      } catch (error) {
        console.error('Failed to save appearance:', error);
        throw error;
      }
    },
    []
  );

  // Resolve selected theme
  const isDark =
    appearance === 'system'
      ? systemColorScheme === 'dark'
      : appearance === 'dark';

  const currentTheme = isDark
    ? darkTheme
    : lightTheme;

  const themeContextValue = useMemo(
    () => ({
      appearance,
      setAppearance,
    }),
    [appearance, setAppearance]
  );

  if (loadingTheme) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFDF8',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#E85D04"
        />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <PaperProvider theme={currentTheme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}
