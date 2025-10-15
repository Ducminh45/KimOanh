import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Card from '../common/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Test Content</Text>
      </Card>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: '#f0f0f0' };
    const { getByTestId } = render(
      <Card style={customStyle}>
        <Text>Content</Text>
      </Card>
    );
    
    const card = getByTestId('card-container');
    expect(card.props.style).toContainEqual(customStyle);
  });

  it('renders with onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Card onPress={onPress}>
        <Text>Pressable Card</Text>
      </Card>
    );
    
    const card = getByTestId('card-container');
    expect(card.props.onPress).toBe(onPress);
  });

  it('renders with shadow', () => {
    const { getByTestId } = render(
      <Card shadow>
        <Text>Shadow Card</Text>
      </Card>
    );
    
    const card = getByTestId('card-container');
    expect(card.props.style).toContainEqual(
      expect.objectContaining({ elevation: expect.any(Number) })
    );
  });

  it('renders with different padding', () => {
    const { getByTestId: getNone } = render(
      <Card padding="none">
        <Text>No Padding</Text>
      </Card>
    );
    
    const { getByTestId: getLarge } = render(
      <Card padding="large">
        <Text>Large Padding</Text>
      </Card>
    );
    
    expect(getNone('card-container')).toBeTruthy();
    expect(getLarge('card-container')).toBeTruthy();
  });
});
