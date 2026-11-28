/**
 * Providers - All context providers wrapped here
 */
import { ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { AddressProvider } from '@/context/AddressContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { theme } from '@/constants/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PaperProvider theme={theme}>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <OrdersProvider>
              <AddressProvider>{children}</AddressProvider>
            </OrdersProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </PaperProvider>
  );
}
