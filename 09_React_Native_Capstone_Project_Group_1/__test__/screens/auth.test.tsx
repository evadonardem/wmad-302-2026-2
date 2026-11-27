/**
 * Screen tests - Login and Register (branding, validation, submit)
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/app/(auth)/login';
import RegisterScreen from '@/app/(auth)/register';
import { useAuth } from '@/context/AuthContext';
import { showMessage } from '@/utils/alerts';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useLocalSearchParams: () => ({}),
}));
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/utils/alerts', () => ({ showMessage: jest.fn(), confirmAction: jest.fn() }));

const login = jest.fn();
const register = jest.fn();
const clearError = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  login.mockResolvedValue(undefined);
  register.mockResolvedValue(undefined);
  (useAuth as jest.Mock).mockReturnValue({
    login,
    register,
    clearError,
    isLoading: false,
    error: null,
  });
});

describe('LoginScreen', () => {
  it('shows the Croc Book name and logo', () => {
    const { getByText, getByLabelText, queryByText } = render(<LoginScreen />);
    expect(getByText('Croc Book')).toBeTruthy();
    expect(getByLabelText('Croc Book logo')).toBeTruthy();
    expect(queryByText('Cookbook')).toBeNull();
  });

  it('asks for both fields when they are empty', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Sign In'));
    expect(showMessage).toHaveBeenCalledWith('Error', 'Please enter both username and password');
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and goes to Home', async () => {
    const { getByText, getByLabelText } = render(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Username or Email'), ' emilys ');
    fireEvent.changeText(getByLabelText('Password'), 'emilyspass');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => expect(login).toHaveBeenCalledWith('emilys', 'emilyspass'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(app)/(tabs)/home'));
  });

  it('stays on the screen when the login fails', async () => {
    login.mockRejectedValue(new Error('Invalid credentials'));
    const { getByText, getByLabelText } = render(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Username or Email'), 'bad');
    fireEvent.changeText(getByLabelText('Password'), 'bad');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('demo account button logs in with the demo credentials', async () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Try Demo Account (emilys / emilyspass)'));
    await waitFor(() => expect(login).toHaveBeenCalledWith('emilys', 'emilyspass'));
  });

  it('links to the register screen', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Sign Up'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/register');
  });

  it('shows the error from the auth context', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login,
      register,
      clearError,
      isLoading: false,
      error: 'Invalid credentials',
    });
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Invalid credentials')).toBeTruthy();
    expect(showMessage).toHaveBeenCalledWith('Login Failed', 'Invalid credentials', clearError);
  });
});

describe('RegisterScreen', () => {
  it('shows the Croc Book name and logo', () => {
    const { getByText, getByLabelText } = render(<RegisterScreen />);
    expect(getByText('Croc Book')).toBeTruthy();
    expect(getByLabelText('Croc Book logo')).toBeTruthy();
    expect(getByText('Create Your Account')).toBeTruthy();
  });

  it('validates the form before sending anything', () => {
    const { getAllByText } = render(<RegisterScreen />);
    // "Create Account" is both the card title and the button label
    const matches = getAllByText('Create Account');
    fireEvent.press(matches[matches.length - 1]);
    expect(showMessage).toHaveBeenCalledWith('Validation Error', 'First name is required');
    expect(register).not.toHaveBeenCalled();
  });

  it('creates the account and goes to Home', async () => {
    const { getAllByText, getByLabelText, getByRole } = render(<RegisterScreen />);
    fireEvent.changeText(getByLabelText('First Name'), 'Ana');
    fireEvent.changeText(getByLabelText('Last Name'), 'Reyes');
    fireEvent.changeText(getByLabelText('Username'), 'ana');
    fireEvent.changeText(getByLabelText('Email'), 'ana@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'secret1');
    fireEvent.changeText(getByLabelText('Confirm Password'), 'secret1');
    fireEvent.press(getByRole('checkbox'));
    // "Create Account" is both the card title and the button label
    const matches = getAllByText('Create Account');
    fireEvent.press(matches[matches.length - 1]);

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        firstName: 'Ana',
        lastName: 'Reyes',
        username: 'ana',
        password: 'secret1',
        email: 'ana@example.com',
        age: undefined,
        gender: 'male',
      })
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(app)/(tabs)/home'));
  });

  it('rejects mismatching passwords', () => {
    const { getAllByText, getByLabelText } = render(<RegisterScreen />);
    fireEvent.changeText(getByLabelText('First Name'), 'Ana');
    fireEvent.changeText(getByLabelText('Last Name'), 'Reyes');
    fireEvent.changeText(getByLabelText('Username'), 'ana');
    fireEvent.changeText(getByLabelText('Email'), 'ana@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'secret1');
    fireEvent.changeText(getByLabelText('Confirm Password'), 'different');
    const matches = getAllByText('Create Account');
    fireEvent.press(matches[matches.length - 1]);

    expect(showMessage).toHaveBeenCalledWith('Validation Error', 'Passwords do not match');
    expect(register).not.toHaveBeenCalled();
  });

  it('shows a failed registration inline and stays on the screen', async () => {
    register.mockRejectedValue(new Error('Server error'));
    const { getAllByText, getByLabelText, getByRole, findByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByLabelText('First Name'), 'Ana');
    fireEvent.changeText(getByLabelText('Last Name'), 'Reyes');
    fireEvent.changeText(getByLabelText('Username'), 'ana');
    fireEvent.changeText(getByLabelText('Email'), 'ana@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'secret1');
    fireEvent.changeText(getByLabelText('Confirm Password'), 'secret1');
    fireEvent.press(getByRole('checkbox'));
    const matches = getAllByText('Create Account');
    fireEvent.press(matches[matches.length - 1]);

    expect(await findByText('Server error')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});