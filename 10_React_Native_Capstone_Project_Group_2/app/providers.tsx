/**
 * Providers - All context providers wrapped here
 */
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { theme } from '@/constants/theme';

export default function Placeholder() {
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>{children}</AuthProvider>
    </PaperProvider>
  );
  
}