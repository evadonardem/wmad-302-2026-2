/**
 * React Native Paper Themes - Cookbook App
 * Warm, food-friendly color palette (light + dark)
 */
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#E85D04', // Warm orange
    primaryContainer: '#FFF3E0',
    secondary: '#6D4C41', // Brown
    secondaryContainer: '#EFEBE9',
    tertiary: '#2E7D32', // Green (fresh ingredients)
    tertiaryContainer: '#E8F5E9',
    surface: '#FFFFFF',
    surfaceVariant: '#FFF8F0',
    background: '#FFFDF8',
    error: '#C62828',
    errorContainer: '#FDEDED',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#3E2723',
    onSurfaceVariant: '#5D4037',
    onBackground: '#3E2723',
    outline: '#BCAAA4',
    outlineVariant: '#D7CCC8',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF8A3D',
    primaryContainer: '#4A2A10',
    secondary: '#D7B8A8',
    secondaryContainer: '#3E2F29',
    tertiary: '#81C784',
    tertiaryContainer: '#1F3A22',
    surface: '#241C19',
    surfaceVariant: '#2F2521',
    background: '#171210',
    error: '#EF9A9A',
    errorContainer: '#4A1F1F',
    onPrimary: '#2B1200',
    onSurface: '#F5E9E2',
    onSurfaceVariant: '#D7C2B8',
    onBackground: '#F5E9E2',
    outline: '#8D7468',
    outlineVariant: '#4E3F38',
  },
  roundness: 12,
};

/** Semantic colors for recipe difficulty badges. */
export const difficultyColors = {
  Easy: { bg: '#E8F5E9', fg: '#2E7D32' },
  Medium: { bg: '#FFF3E0', fg: '#E65100' },
  Hard: { bg: '#FDEDED', fg: '#C62828' },
} as const;

/** Keeps content readable (and images un-cropped) on wide web screens. */
export const contentWidth = { width: '100%', maxWidth: 720, alignSelf: 'center' } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;