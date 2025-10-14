import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  hintStyle?: TextStyle;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
  disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      hintStyle,
      variant = 'outlined',
      size = 'medium',
      required = false,
      disabled = false,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      textInputProps.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      textInputProps.onBlur?.(e);
    };

    const inputContainerStyle = [
      styles.inputContainer,
      styles[variant],
      styles[size],
      isFocused && styles.focused,
      error && styles.error,
      disabled && styles.disabled,
    ];

    const textInputStyle = [
      styles.input,
      styles[`${size}Input`],
      leftIcon && styles.inputWithLeftIcon,
      rightIcon && styles.inputWithRightIcon,
      inputStyle,
    ];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        
        <View style={inputContainerStyle}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          
          <TextInput
            ref={ref}
            style={textInputStyle}
            placeholderTextColor={Colors.placeholder}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...textInputProps}
          />
          
          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        
        {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
        {hint && !error && <Text style={[styles.hintText, hintStyle]}>{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: lightTheme.spacing.md,
  },
  label: {
    fontSize: lightTheme.typography.body2.fontSize,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  required: {
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: lightTheme.borderRadius.md,
  },
  
  // Variants
  default: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingHorizontal: 0,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: lightTheme.spacing.md,
  },
  filled: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: lightTheme.spacing.md,
  },

  // Sizes
  small: {
    minHeight: 36,
  },
  medium: {
    minHeight: 44,
  },
  large: {
    minHeight: 52,
  },

  // States
  focused: {
    borderColor: Colors.primary,
  },
  error: {
    borderColor: Colors.error,
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: Colors.lightGray,
  },

  // Input
  input: {
    flex: 1,
    fontSize: lightTheme.typography.body1.fontSize,
    color: Colors.text,
    paddingVertical: 0,
  },
  smallInput: {
    fontSize: 14,
  },
  mediumInput: {
    fontSize: lightTheme.typography.body1.fontSize,
  },
  largeInput: {
    fontSize: 18,
  },
  inputWithLeftIcon: {
    marginLeft: lightTheme.spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: lightTheme.spacing.sm,
  },

  // Icons
  leftIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: lightTheme.spacing.xs,
  },

  // Helper text
  errorText: {
    fontSize: lightTheme.typography.caption.fontSize,
    color: Colors.error,
    marginTop: lightTheme.spacing.xs,
  },
  hintText: {
    fontSize: lightTheme.typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: lightTheme.spacing.xs,
  },
});

export default Input;