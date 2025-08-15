import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../src/screens/RegisterScreen';
import Toast from 'react-native-toast-message';

const mockNavigate = jest.fn();
const mockRegister = jest.fn();

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

jest.mock('../lib/requestNotificationPermissions', () => ({
  requestNotificationPermissions: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error when passwords do not match', async () => {
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <RegisterScreen navigation={{ navigate: mockNavigate }} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password2');
    fireEvent.press(getAllByText('Register')[1]);

    await waitFor(() => {
      expect(queryByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('registers successfully and navigates to login', async () => {
    mockRegister.mockResolvedValueOnce({});
    const { getByPlaceholderText, getAllByText } = render(
      <RegisterScreen navigation={{ navigate: mockNavigate }} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password1');
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'Password1'
    );
    fireEvent.press(getAllByText('Register')[1]);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password1');
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Success',
        text2: 'Account created. You can now log in.',
      });
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });
});
