import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../src/screens/ForgotPasswordScreen';
import api from '../lib/api';
import Toast from 'react-native-toast-message';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'invalid'
    );
    fireEvent.press(getByText('Send Reset Link'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Invalid email format',
      });
    });
    expect((api as any).post).not.toHaveBeenCalled();
  });

  it('submits email and navigates back on success', async () => {
    (api as any).post.mockResolvedValueOnce({});
    jest.useFakeTimers();

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen />
    );

    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'test@example.com'
    );
    fireEvent.press(getByText('Send Reset Link'));

    await waitFor(() => {
      expect((api as any).post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'test@example.com' }
      );
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Check your email for a reset link',
      });
    });

    jest.advanceTimersByTime(3000);
    expect(mockGoBack).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
