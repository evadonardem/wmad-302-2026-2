import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Lakbay PH palette (from the redesign): teal brand, navy ink, amber accent.
export const lakbayLightTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0e7c86',
    onPrimary: '#ffffff',
    primaryContainer: '#dcecf2',
    onPrimaryContainer: '#0b2545',
    secondary: '#f59e0b',
    background: '#f4f7fa',
    onBackground: '#0b2545',
    surface: '#ffffff',
    onSurface: '#0b2545',
    surfaceVariant: '#eef2f6',
    onSurfaceVariant: '#5b6b7f',
    outline: '#c9d2dc',
    outlineVariant: '#e3e8ee',
    error: '#e11d48',
  },
};

export const lakbayDarkTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#14a3ad',
    onPrimary: '#ffffff',
    primaryContainer: '#0d2236',
    onPrimaryContainer: '#e8eef5',
    secondary: '#f59e0b',
    background: '#0a1624',
    onBackground: '#e8eef5',
    surface: '#112236',
    onSurface: '#e8eef5',
    surfaceVariant: '#16293f',
    onSurfaceVariant: '#9fb0c3',
    outline: '#2c415a',
    outlineVariant: '#213349',
    error: '#e11d48',
  },
};