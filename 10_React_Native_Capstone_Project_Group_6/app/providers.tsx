/**
 * Providers - All context providers wrapped here
 * ThemeProvider goes first: Paper (and every screen) needs to know light vs dark.
 */
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { PaperProvider } from 'react-native-paper';

/** Gives Paper the light or dark theme that matches the current scheme. */
function ThemedPaperProvider({ children }: { children: ReactNode }) {
  const { paperTheme } = useAppTheme();
  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedPaperProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemedPaperProvider>
    </ThemeProvider>
  );
}
