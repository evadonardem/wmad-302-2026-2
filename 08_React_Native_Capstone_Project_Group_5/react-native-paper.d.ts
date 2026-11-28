declare module 'react-native-paper' {
  import type * as React from 'react';
  import type { ColorValue, TextProps, ViewProps } from 'react-native';

  export const MD3LightTheme: any;
  export const MD3DarkTheme: any;
  export const PaperProvider: React.ComponentType<any>;

  export type Theme = {
    colors: Record<string, string>;
  };

  export function useTheme(): Theme;

  export const Button: React.ComponentType<any>;
  export const Chip: React.ComponentType<any>;
  export const Menu: {
    Item: React.ComponentType<any>;
  } & React.ComponentType<any>;
  export const IconButton: React.ComponentType<any>;
  export const Divider: React.ComponentType<any>;
  export const Text: React.ComponentType<TextProps & { children?: React.ReactNode; variant?: string }>;
  export const ActivityIndicator: React.ComponentType<any>;
  export const Card: {
    Cover: React.ComponentType<any>;
    Content: React.ComponentType<any>;
  } & React.ComponentType<any>;
  export const Surface: React.ComponentType<ViewProps>;
}
