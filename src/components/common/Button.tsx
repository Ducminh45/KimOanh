import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'small'}
            color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          />
          <Text style={[textStyleCombined, styles.loadingText]}>{title}</Text>
        </View>
      );
    }

    if (icon) {
      return (
        <View style={styles.iconContainer}>
          {iconPosition === 'left' && icon}
          <Text style={textStyleCombined}>{title}</Text>
          {iconPosition === 'right' && icon}
        </View>
      );
    }

    return <Text style={textStyleCombined}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled || loading}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: lightTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
    ...lightTheme.shadows.sm,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    ...lightTheme.shadows.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.error,
    ...lightTheme.shadows.sm,
  },

  // Sizes
  small: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: lightTheme.spacing.xl,
    paddingVertical: lightTheme.spacing.lg,
    minHeight: 52,
  },

  // Text styles
  text: {
    fontWeight: lightTheme.typography.button.fontWeight,
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.white,
    fontSize: lightTheme.typography.button.fontSize,
  },
  secondaryText: {
    color: Colors.white,
    fontSize: lightTheme.typography.button.fontSize,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: lightTheme.typography.button.fontSize,
  },
  ghostText: {
    color: Colors.primary,
    fontSize: lightTheme.typography.button.fontSize,
  },
  dangerText: {
    color: Colors.white,
    fontSize: lightTheme.typography.button.fontSize,
  },

  // Size-specific text styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: lightTheme.typography.button.fontSize,
  },
  largeText: {
    fontSize: 18,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },

  // Layout
  fullWidth: {
    width: '100%',
  },

  // Icon and loading
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  loadingText: {
    marginLeft: lightTheme.spacing.sm,
  },
});

export default Button;