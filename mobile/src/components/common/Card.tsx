import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import Colors from '@constants/colors';
import { spacing, borderRadius, shadows } from '@constants/themes';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevated = true,
  padding = 'medium',
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: spacing.sm };
      case 'large':
        return { padding: spacing.xl };
      default:
        return { padding: spacing.md };
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    ...(elevated ? shadows.medium : {}),
    ...getPaddingStyle(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card;
