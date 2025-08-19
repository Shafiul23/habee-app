import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import LoginScreen from '../src/screens/LoginScreen';
import Toast from 'react-native-toast-message';

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('../lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
jest.mock('../lib/requestNotificationPermissions', () => ({
  requestNotificationPermissions: jest.fn(),
}));
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));
jest.mock('@env', () => ({
  DEV_USER: '',
  DEV_PASSWORD: '',
  GOOGLE_CLIENT_ID: '',
}), { virtual: true });
jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationButton: () => null,
  AppleAuthenticationButtonType: { SIGN_IN: 'SIGN_IN' },
  AppleAuthenticationButtonStyle: { BLACK: 'BLACK' },
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  signInAsync: jest.fn(),
}));
jest.mock('expo-auth-session/providers/google', () => ({
  useIdTokenAuthRequest: () => [null, null, jest.fn()],
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

describe('LoginScreen', () => {
  it('shows error toast for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid');
    fireEvent.press(getByText('Log In'));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Enter a valid email address.',
      });
    });
  });

  it('renders Google sign-in button on Android', () => {
    (Platform as any).OS = 'android';
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign in with Google')).toBeTruthy();
  });
});
