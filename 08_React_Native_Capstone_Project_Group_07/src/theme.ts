import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Philippine flag palette from App.css
export const brand = {
    blue: '#0038a8',
    blueLight: '#2f6bff',
    red: '#ce1126',
    yellow: '#fcd116',
    sky: '#38bdf8',
};

export const lightTheme: MD3Theme = {
    ...MD3LightTheme,
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