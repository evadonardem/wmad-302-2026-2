/**
 * Providers - All context providers wrapped here
 */
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { CookbookProvider } from '@/context/CookbookContext';
import { ThemeProvider } from '@/context/ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CookbookProvider>{children}</CookbookProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
