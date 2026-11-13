/**
 * Providers - All context providers wrapped here
 * ThemeProvider is outermost: it also provides Paper's theme.
 */
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ThemeProvider } from '@/context/ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
