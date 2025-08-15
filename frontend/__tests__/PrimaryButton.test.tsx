import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../src/components/PrimaryButton';

describe('PrimaryButton', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Save" onPress={onPress} />
    );
    fireEvent.press(getByText('Save'));
    expect(onPress).toHaveBeenCalled();
  });
});
