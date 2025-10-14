import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof lightTheme.spacing;
  margin?: keyof typeof lightTheme.spacing;
  shadow?: keyof typeof lightTheme.shadows;
  borderRadius?: keyof typeof lightTheme.borderRadius;
  backgroundColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  margin,
  shadow = 'sm',
  borderRadius = 'md',
  backgroundColor = Colors.surface,
  onPress,
  disabled = false,
  testID,
}) => {
  const cardStyle = [
    styles.card,
    {
      padding: lightTheme.spacing[padding],
      borderRadius: lightTheme.borderRadius[borderRadius],
      backgroundColor,
      ...(shadow && lightTheme.shadows[shadow]),
    },
    margin && { margin: lightTheme.spacing[margin] },
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => (
  <View style={[styles.header, style]}>{children}</View>
);

export interface CardBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, style }) => (
  <View style={[styles.body, style]}>{children}</View>
);

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    ...lightTheme.shadows.sm,
  },
  header: {
    marginBottom: lightTheme.spacing.md,
  },
  body: {
    flex: 1,
  },
  footer: {
    marginTop: lightTheme.spacing.md,
    paddingTop: lightTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Card;