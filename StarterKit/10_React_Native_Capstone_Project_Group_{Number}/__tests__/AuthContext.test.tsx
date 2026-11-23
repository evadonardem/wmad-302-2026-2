import React from 'react';
import { Pressable, Text } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/authApi';
import type { AuthUser, RegisterData, UserProfile } from '@/types/auth';

jest.mock('@/services/authApi', () => ({
  authApi: {
    hydrate: jest.fn(),
    setSessionExpiredHandler: jest.fn(),
    getMe: jest.fn(),
    getStoredUser: jest.fn(),
    setTokens: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateSession: jest.fn(),
  },
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

const testUser: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://example.com/user.png',
  token: 'test-access-token',
  refreshToken: 'test-refresh-token',
};

const testProfile: UserProfile = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://example.com/user.png',
};

const registerData: RegisterData = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  password: 'password123',
  email: 'john@example.com',
  gender: 'male',
};

function AuthProbe() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    updateUser,
  } = useAuth();

  return (
    <>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="authenticated">{String(isAuthenticated)}</Text>
      <Text testID="username">{user?.username ?? 'none'}</Text>
      <Text testID="firstName">{user?.firstName ?? 'none'}</Text>
      <Text testID="error">{error ?? 'none'}</Text>

      <Pressable
        testID="login"
        onPress={() => {
          void login('emilys', 'emilyspass').catch(() => undefined);
        }}
      >
        <Text>Login</Text>
      </Pressable>

      <Pressable
        testID="register"
        onPress={() => {
          void register(registerData).catch(() => undefined);
        }}
      >
        <Text>Register</Text>
      </Pressable>

      <Pressable testID="logout" onPress={logout}>
        <Text>Logout</Text>
      </Pressable>

      <Pressable testID="clearError" onPress={clearError}>
        <Text>Clear Error</Text>
      </Pressable>

      <Pressable
        testID="refreshUser"
        onPress={() => {
          void refreshUser();
        }}
      >
        <Text>Refresh User</Text>
      </Pressable>

      <Pressable
        testID="updateUser"
        onPress={() => updateUser({ firstName: 'Updated' })}
      >
        <Text>Update User</Text>
      </Pressable>
    </>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );
}

async function renderAuthenticated() {
  mockedAuthApi.hydrate.mockResolvedValue(testUser);
  mockedAuthApi.getMe.mockResolvedValue(testProfile);
  mockedAuthApi.getStoredUser.mockReturnValue(testUser);

  const screen = renderAuth();

  await waitFor(() => {
    expect(screen.getByTestId('authenticated').props.children).toBe('true');
  });

  return screen;
}

describe('AuthContext Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedAuthApi.hydrate.mockResolvedValue(null);
    mockedAuthApi.getMe.mockResolvedValue(testProfile);
    mockedAuthApi.getStoredUser.mockReturnValue(null);
    mockedAuthApi.login.mockResolvedValue(testUser);
    mockedAuthApi.register.mockResolvedValue(testUser);
    mockedAuthApi.updateSession.mockReturnValue(testUser);
  });

  it('finishes loading when there is no saved session', async () => {
    const screen = renderAuth();

    await waitFor(() => {
      expect(mockedAuthApi.hydrate).toHaveBeenCalled();
    });

    await act(async () => {
      await mockedAuthApi.hydrate.mock.results[0].value;
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });

    expect(screen.getByTestId('authenticated').props.children).toBe('false');
    expect(mockedAuthApi.getMe).not.toHaveBeenCalled();
  });

  it('restores an existing session during hydration', async () => {
    const screen = await renderAuthenticated();

    expect(screen.getByTestId('username').props.children).toBe('emilys');
    expect(mockedAuthApi.setTokens).toHaveBeenCalledWith({
      ...testUser,
      ...testProfile,
    });
  });

  it('logs in successfully', async () => {
    const screen = renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });

    fireEvent.press(screen.getByTestId('login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('true');
    });

    expect(mockedAuthApi.login).toHaveBeenCalledWith({
      username: 'emilys',
      password: 'emilyspass',
    });
    expect(screen.getByTestId('username').props.children).toBe('emilys');
  });

  it('stores an error when login fails', async () => {
    mockedAuthApi.login.mockRejectedValue(new Error('Invalid credentials'));

    const screen = renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });

    fireEvent.press(screen.getByTestId('login'));

    await waitFor(() => {
      expect(screen.getByTestId('error').props.children).toBe(
        'Invalid credentials'
      );
    });

    expect(screen.getByTestId('authenticated').props.children).toBe('false');
  });

  it('registers a user successfully', async () => {
    const screen = renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });

    fireEvent.press(screen.getByTestId('register'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('true');
    });

    expect(mockedAuthApi.register).toHaveBeenCalledWith(registerData);
  });

  it('stores an error when registration fails', async () => {
    mockedAuthApi.register.mockRejectedValue(new Error('Registration failed'));

    const screen = renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });

    fireEvent.press(screen.getByTestId('register'));

    await waitFor(() => {
      expect(screen.getByTestId('error').props.children).toBe(
        'Registration failed'
      );
    });
  });

  it('logs out the current user', async () => {
    const screen = await renderAuthenticated();

    fireEvent.press(screen.getByTestId('logout'));

    expect(mockedAuthApi.logout).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').props.children).toBe('false');
    expect(screen.getByTestId('username').props.children).toBe('none');
  });

  it('refreshes the authenticated user profile', async () => {
    const screen = await renderAuthenticated();

    const updatedProfile = {
      ...testProfile,
      firstName: 'Emily Updated',
    };

    mockedAuthApi.getMe.mockResolvedValue(updatedProfile);

    fireEvent.press(screen.getByTestId('refreshUser'));

    await waitFor(() => {
      expect(screen.getByTestId('firstName').props.children).toBe(
        'Emily Updated'
      );
    });

    expect(mockedAuthApi.setTokens).toHaveBeenLastCalledWith({
      ...testUser,
      ...updatedProfile,
    });
  });

  it('does not refresh when the user is not authenticated', async () => {
    const screen = renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });

    fireEvent.press(screen.getByTestId('refreshUser'));

    expect(mockedAuthApi.getMe).not.toHaveBeenCalled();
  });

  it('updates the current user information', async () => {
    const screen = await renderAuthenticated();

    fireEvent.press(screen.getByTestId('updateUser'));

    expect(mockedAuthApi.updateSession).toHaveBeenCalledWith({
      firstName: 'Updated',
    });
    expect(screen.getByTestId('firstName').props.children).toBe('Updated');
  });

  it('clears an existing error', async () => {
    mockedAuthApi.login.mockRejectedValue(new Error('Invalid credentials'));

    const screen = renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });

    fireEvent.press(screen.getByTestId('login'));

    await waitFor(() => {
      expect(screen.getByTestId('error').props.children).toBe(
        'Invalid credentials'
      );
    });

    fireEvent.press(screen.getByTestId('clearError'));

    expect(screen.getByTestId('error').props.children).toBe('none');
  });

  it('logs out when the session expires', async () => {
  const screen = await renderAuthenticated();

  const handler = mockedAuthApi.setSessionExpiredHandler.mock.calls[0][0];

  expect(handler).toBeDefined();

  await act(async () => {
    handler?.();
  });

  expect(screen.getByTestId('authenticated').props.children).toBe('false');
  expect(screen.getByTestId('username').props.children).toBe('none');
});
});
