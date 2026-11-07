import type { TextStyle, ViewStyle } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';

// Philippine flag palette from App.css
export const brand = {
  blue: '#0038a8',
  blueLight: '#2f6bff',
  red: '#ce1126',
  yellow: '#fcd116',
  sky: '#38bdf8',
};

// Poppins family names (loaded with useFonts in src/app/_layout.tsx)
export const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
};

// --radius / pill / panel values from App.css
export const radius = {
  card: 20,
  panel: 30,
  pill: 999,
};

// Neutral grey tints that work in both light and dark mode (rgba(128,128,128,x) in App.css)
export const glass = {
  fill: 'rgba(128,128,128,0.14)',
  fillStrong: 'rgba(128,128,128,0.18)',
  border: 'rgba(128,128,128,0.28)',
  borderDashed: 'rgba(128,128,128,0.5)',
};

// --shadow-soft / --shadow-lift and the blue glow under the Search button
export const shadow: Record<'soft' | 'lift' | 'blue', ViewStyle> = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  lift: {
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 24 },
    elevation: 12,
  },
  blue: {
    shadowColor: brand.blue,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

// Gradient color stops (used with expo-linear-gradient)
export const gradients = {
  // Glossy Search button: blue -> light blue -> sky
  primary: [brand.blue, brand.blueLight, brand.sky],
  // "Lakbay PH" title text
  title: [brand.blueLight, brand.red, '#f59e0b'],
} as const;

// Shared look of the big gradient title (h1.MuiTypography-h3 in App.css)
export const titleTextStyle: TextStyle = {
  fontFamily: fontFamily.extraBold,
  fontSize: 52,
  letterSpacing: -1,
  textAlign: 'center',
};

// Poppins for every Paper text variant
const fonts = configureFonts({ config: { fontFamily: fontFamily.regular } });

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.blue,
    onPrimary: '#ffffff',
    primaryContainer: '#d9e4ff',
    onPrimaryContainer: '#001a4d',
    secondary: brand.yellow,
    onSecondary: '#000000',
    tertiary: brand.red,
    onTertiary: '#ffffff',
    error: brand.red,
    onError: '#ffffff',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.blueLight,
    onPrimary: '#001a4d',
    primaryContainer: '#00308a',
    onPrimaryContainer: '#d9e4ff',
    secondary: brand.yellow,
    onSecondary: '#000000',
    tertiary: '#ff5a6e',
    onTertiary: '#000000',
    error: '#ff5a6e',
    onError: '#000000',
  },
};
