import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Modal,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';

export interface LoadingProps {
  visible?: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  visible = true,
  message,
  size = 'large',
  color = Colors.primary,
  overlay = false,
  style,
  textStyle,
  testID,
}) => {
  const content = (
    <View style={[styles.container, overlay && styles.overlay, style]} testID={testID}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text style={[styles.message, textStyle]}>{message}</Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  return visible ? content : null;
};

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color = Colors.primary,
  style,
  testID,
}) => (
  <ActivityIndicator
    size={size}
    color={color}
    style={style}
    testID={testID}
  />
);

export interface LoadingDotsProps {
  color?: string;
  size?: number;
  style?: ViewStyle;
  testID?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  color = Colors.primary,
  size = 8,
  style,
  testID,
}) => {
  return (
    <View style={[styles.dotsContainer, style]} testID={testID}>
      <View style={[styles.dot, { backgroundColor: color, width: size, height: size }]} />
      <View style={[styles.dot, styles.dotDelay1, { backgroundColor: color, width: size, height: size }]} />
      <View style={[styles.dot, styles.dotDelay2, { backgroundColor: color, width: size, height: size }]} />
    </View>
  );
};

export interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  testID,
}) => (
  <View
    style={[
      styles.skeleton,
      {
        width,
        height,
        borderRadius,
      },
      style,
    ]}
    testID={testID}
  />
);

export interface LoadingPlaceholderProps {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  style?: ViewStyle;
  testID?: string;
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  lines = 3,
  lineHeight = 20,
  spacing = 8,
  style,
  testID,
}) => (
  <View style={[styles.placeholder, style]} testID={testID}>
    {Array.from({ length: lines }).map((_, index) => (
      <LoadingSkeleton
        key={index}
        height={lineHeight}
        width={index === lines - 1 ? '70%' : '100%'}
        style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
      />
    ))}
  </View>
);

export interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  loadingText,
  size = 'small',
  color = Colors.white,
  style,
  testID,
}) => {
  if (loading) {
    return (
      <View style={[styles.loadingButton, style]} testID={testID}>
        <ActivityIndicator size={size} color={color} />
        {loadingText && (
          <Text style={[styles.loadingButtonText, { color }]}>
            {loadingText}
          </Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    zIndex: 1000,
  },
  content: {
    backgroundColor: Colors.surface,
    padding: lightTheme.spacing.xl,
    borderRadius: lightTheme.borderRadius.lg,
    alignItems: 'center',
    ...lightTheme.shadows.md,
  },
  message: {
    marginTop: lightTheme.spacing.md,
    fontSize: lightTheme.typography.body1.fontSize,
    color: Colors.text,
    textAlign: 'center',
  },
  
  // Loading Dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    marginHorizontal: 2,
    borderRadius: 50,
    opacity: 0.4,
  },
  dotDelay1: {
    // Animation delay would be handled by animation library
  },
  dotDelay2: {
    // Animation delay would be handled by animation library
  },

  // Loading Skeleton
  skeleton: {
    backgroundColor: Colors.lightGray,
    opacity: 0.7,
  },

  // Loading Placeholder
  placeholder: {
    // Container for multiple skeleton lines
  },

  // Loading Button
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingButtonText: {
    marginLeft: lightTheme.spacing.sm,
    fontSize: lightTheme.typography.button.fontSize,
    fontWeight: lightTheme.typography.button.fontWeight,
  },
});

export default Loading;