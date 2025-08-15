import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResetPasswordScreen from '../src/screens/ResetPasswordScreen';
import api from '../lib/api';
import Toast from 'react-native-toast-message';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { token: 'test-token' } }),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error for short password', async () => {
    (api as any).get.mockResolvedValueOnce({});
    const { getByPlaceholderText, getByText } = render(<ResetPasswordScreen />);

    await waitFor(() => {
      expect((api as any).get).toHaveBeenCalledWith(
        '/auth/validate-reset-token/test-token'
      );
    });

    fireEvent.changeText(
      getByPlaceholderText('Enter a new password'),
      '123'
    );
    fireEvent.press(getByText('Reset Password'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Password too short',
        text2: 'Use at least 6 characters',
      });
    });
    expect((api as any).post).not.toHaveBeenCalled();
  });

  it('resets password and navigates to login', async () => {
    (api as any).get.mockResolvedValueOnce({});
    (api as any).post.mockResolvedValueOnce({});
    jest.useFakeTimers();

    const { getByPlaceholderText, getByText } = render(<ResetPasswordScreen />);

    await waitFor(() => {
      expect((api as any).get).toHaveBeenCalled();
    });

    fireEvent.changeText(
      getByPlaceholderText('Enter a new password'),
      'Password1'
    );
    fireEvent.press(getByText('Reset Password'));

    await waitFor(() => {
      expect((api as any).post).toHaveBeenCalledWith(
        '/auth/reset-password/test-token',
        { password: 'Password1' }
      );
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Password reset successful',
      });
    });

    jest.advanceTimersByTime(1000);
    expect(mockNavigate).toHaveBeenCalledWith('Login');
    jest.useRealTimers();
  });

  it('handles invalid token and navigates back', async () => {
    (api as any).get.mockRejectedValueOnce(new Error('bad'));
    jest.useFakeTimers();

    render(<ResetPasswordScreen />);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Invalid or expired token',
      });
    });

    jest.advanceTimersByTime(2500);
    expect(mockGoBack).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
