import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AppLayout from '@/app/(app)/_layout';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

jest.mock('expo-router', () => {
  const ReactLib = require('react');
  const { Text } = require('react-native');
  const Stack = ({ children }: { children?: React.ReactNode }) =>
    ReactLib.createElement(Text, { testID: 'protected-stack' }, children);
  Stack.Screen = () => null;
  const Redirect = ({ href }: { href: unknown }) =>
    ReactLib.createElement(Text, { testID: 'redirect' }, JSON.stringify(href));
  return { Stack, Redirect, usePathname: () => '/cart' };
});

const mockUseAuth = useAuth as jest.Mock;

describe('protected route guard', () => {
  it('shows a loading state while the session is being checked', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    render(<AppLayout />);
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('redirects unauthenticated users to login and remembers the page they wanted', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(<AppLayout />);
    const redirect = screen.getByTestId('redirect');
    expect(JSON.parse(String(redirect.props.children))).toEqual({
      pathname: '/(auth)/login',
      params: { redirect: '/cart' },
    });
  });

  it('renders the app stack for authenticated users', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(<AppLayout />);
    expect(screen.getByTestId('protected-stack')).toBeTruthy();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});
