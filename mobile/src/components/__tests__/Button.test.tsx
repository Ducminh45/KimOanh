import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../common/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    
    expect(getByTestId('button-loading')).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: '#ff0000' };
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} style={customStyle} />
    );
    
    const button = getByTestId('button-container');
    expect(button.props.style).toContainEqual(customStyle);
  });

  it('renders with icon', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} icon="add" />
    );
    
    expect(getByTestId('button-icon')).toBeTruthy();
  });

  it('renders as outline variant', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} variant="outline" />
    );
    
    const button = getByTestId('button-container');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({ borderWidth: expect.any(Number) })
    );
  });

  it('renders as text variant', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} variant="text" />
    );
    
    const button = getByTestId('button-container');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: 'transparent' })
    );
  });

  it('renders with different sizes', () => {
    const { getByTestId: getByTestIdSmall } = render(
      <Button title="Small" onPress={() => {}} size="small" />
    );
    
    const { getByTestId: getByTestIdLarge } = render(
      <Button title="Large" onPress={() => {}} size="large" />
    );
    
    expect(getByTestIdSmall('button-container')).toBeTruthy();
    expect(getByTestIdLarge('button-container')).toBeTruthy();
  });

  it('handles full width', () => {
    const { getByTestId } = render(
      <Button title="Full Width" onPress={() => {}} fullWidth />
    );
    
    const button = getByTestId('button-container');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({ width: '100%' })
    );
  });
});
