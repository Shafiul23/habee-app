import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateHabitScreen from '../src/screens/CreateHabitScreen';
import { createHabit } from '../lib/api';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('../lib/api', () => ({
  createHabit: jest.fn(),
  unarchiveHabit: jest.fn(),
}));

describe('CreateHabitScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error when habit name is empty', async () => {
    const { getByText, queryByText } = render(<CreateHabitScreen />);
    fireEvent.press(getByText('Create habit'));
    await waitFor(() => {
      expect(queryByText('Habit name is required')).toBeTruthy();
    });
  });

  it('requires selecting days when weekly frequency', async () => {
    const {
      getByText,
      getByPlaceholderText,
      queryByText,
    } = render(<CreateHabitScreen />);
    fireEvent.changeText(
      getByPlaceholderText('e.g. Read 30 mins, Track calories'),
      'Read'
    );
    fireEvent.press(getByText('Weekly'));
    fireEvent.press(getByText('Create habit'));
    await waitFor(() => {
      expect(queryByText('Select at least one day')).toBeTruthy();
    });
  });

  it('creates habit and navigates back on success', async () => {
    (createHabit as jest.Mock).mockResolvedValueOnce({});
    const { getByText, getByPlaceholderText } = render(
      <CreateHabitScreen />
    );
    fireEvent.changeText(
      getByPlaceholderText('e.g. Read 30 mins, Track calories'),
      'Read'
    );
    fireEvent.press(getByText('Create habit'));
    await waitFor(() => {
      expect(createHabit).toHaveBeenCalledWith(
        'Read',
        expect.any(String),
        'DAILY',
        []
      );
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
