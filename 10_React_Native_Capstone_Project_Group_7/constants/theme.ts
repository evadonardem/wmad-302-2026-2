/**
 * React Native Paper Theme - Marketplace App
 * Clean, commerce-friendly color palette
 */
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

function createTheme(baseTheme: typeof MD3LightTheme | typeof MD3DarkTheme) {
  const isDark = baseTheme.dark;
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: isDark ? '#81C784' : '#66BB6A',
      primaryContainer: isDark ? '#244A2A' : '#E8F5E9',
      secondary: isDark ? '#A5D6A7' : '#81C784',
      secondaryContainer: isDark ? '#2E4C32' : '#E6F4EA',
      tertiary: isDark ? '#A5D6A7' : '#81C784',
      tertiaryContainer: isDark ? '#2E4C32' : '#E6F4EA',
      surface: isDark ? '#121212' : '#FFFFFF',
      surfaceVariant: isDark ? '#2A2A2A' : '#F8F9FA',
      background: isDark ? '#121212' : '#F8F9FA',
      error: '#EA4335',
      errorContainer: isDark ? '#5D2420' : '#FCE8E6',
      onPrimary: isDark ? '#17351A' : '#FFFFFF',
      onSecondary: isDark ? '#17351A' : '#FFFFFF',
      onTertiary: isDark ? '#17351A' : '#FFFFFF',
      onSurface: isDark ? '#F5F5F5' : '#202124',
      onSurfaceVariant: isDark ? '#C2C2C2' : '#5F6368',
      onBackground: isDark ? '#F5F5F5' : '#202124',
      outline: isDark ? '#5F6368' : '#DADCE0',
      outlineVariant: isDark ? '#424242' : '#E8EAED',
    },
    roundness: 8,
    fonts: {
      ...MD3LightTheme.fonts,
      displayLarge: { fontFamily: 'System', fontWeight: '700' as const, fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
      headlineLarge: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 32, lineHeight: 40 },
      headlineMedium: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 28, lineHeight: 36 },
      headlineSmall: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 24, lineHeight: 32 },
      titleLarge: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 22, lineHeight: 28 },
      titleMedium: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
      titleSmall: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
      bodyLarge: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
      bodyMedium: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
      bodySmall: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
      labelLarge: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
      labelMedium: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
      labelSmall: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },
    },
  };
}

export const theme = createTheme(MD3LightTheme);
export const darkTheme = createTheme(MD3DarkTheme);