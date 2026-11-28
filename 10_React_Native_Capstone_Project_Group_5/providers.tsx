/**
 * Providers - All context providers wrapped here
 */
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { theme } from '@/constants/theme';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </PaperProvider>
  );
}