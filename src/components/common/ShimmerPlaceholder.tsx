import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';

const { width: screenWidth } = Dimensions.get('window');

export interface ShimmerPlaceholderProps {
  visible?: boolean;
  children?: React.ReactNode;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  shimmerColors?: string[];
  duration?: number;
  style?: ViewStyle;
  testID?: string;
}

export const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  visible = false,
  children,
  width = '100%',
  height = 20,
  borderRadius = 4,
  shimmerColors = [Colors.lightGray, '#E0E0E0', Colors.lightGray],
  duration = 1000,
  style,
  testID,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [visible, animatedValue, duration]);

  if (visible && children) {
    return <>{children}</>;
  }

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: shimmerColors[0],
        },
        style,
      ]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View
          style={[
            styles.shimmerGradient,
            {
              backgroundColor: shimmerColors[1],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

export interface ShimmerCardProps {
  visible?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const ShimmerCard: React.FC<ShimmerCardProps> = ({
  visible = false,
  children,
  style,
  testID,
}) => {
  if (visible && children) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.card, style]} testID={testID}>
      <ShimmerPlaceholder width="60%" height={20} />
      <ShimmerPlaceholder width="100%" height={16} style={{ marginTop: 8 }} />
      <ShimmerPlaceholder width="80%" height={16} style={{ marginTop: 4 }} />
      <View style={styles.cardFooter}>
        <ShimmerPlaceholder width={60} height={30} borderRadius={15} />
        <ShimmerPlaceholder width={80} height={30} borderRadius={15} />
      </View>
    </View>
  );
};

export interface ShimmerListProps {
  visible?: boolean;
  children?: React.ReactNode;
  itemCount?: number;
  itemHeight?: number;
  spacing?: number;
  style?: ViewStyle;
  testID?: string;
}

export const ShimmerList: React.FC<ShimmerListProps> = ({
  visible = false,
  children,
  itemCount = 5,
  itemHeight = 80,
  spacing = 16,
  style,
  testID,
}) => {
  if (visible && children) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.list, style]} testID={testID}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            {
              height: itemHeight,
              marginBottom: index < itemCount - 1 ? spacing : 0,
            },
          ]}
        >
          <View style={styles.listItemLeft}>
            <ShimmerPlaceholder width={50} height={50} borderRadius={25} />
          </View>
          <View style={styles.listItemRight}>
            <ShimmerPlaceholder width="70%" height={16} />
            <ShimmerPlaceholder width="100%" height={14} style={{ marginTop: 8 }} />
            <ShimmerPlaceholder width="50%" height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

export interface ShimmerImageProps {
  visible?: boolean;
  children?: React.ReactNode;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export const ShimmerImage: React.FC<ShimmerImageProps> = ({
  visible = false,
  children,
  width = 100,
  height = 100,
  borderRadius = 8,
  style,
  testID,
}) => {
  if (visible && children) {
    return <>{children}</>;
  }

  return (
    <ShimmerPlaceholder
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
      testID={testID}
    />
  );
};

export interface ShimmerTextProps {
  visible?: boolean;
  children?: React.ReactNode;
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string;
  style?: ViewStyle;
  testID?: string;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({
  visible = false,
  children,
  lines = 3,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '70%',
  style,
  testID,
}) => {
  if (visible && children) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.textContainer, style]} testID={testID}>
      {Array.from({ length: lines }).map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </View>
  );
};

export interface ShimmerButtonProps {
  visible?: boolean;
  children?: React.ReactNode;
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  testID?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  visible = false,
  children,
  width = 120,
  height = 44,
  style,
  testID,
}) => {
  if (visible && children) {
    return <>{children}</>;
  }

  return (
    <ShimmerPlaceholder
      width={width}
      height={height}
      borderRadius={lightTheme.borderRadius.md}
      style={style}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.lightGray,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  shimmerGradient: {
    flex: 1,
    opacity: 0.5,
  },

  // Card styles
  card: {
    padding: lightTheme.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    ...lightTheme.shadows.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: lightTheme.spacing.md,
  },

  // List styles
  list: {
    // Container for shimmer list items
  },
  listItem: {
    flexDirection: 'row',
    padding: lightTheme.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    ...lightTheme.shadows.sm,
  },
  listItemLeft: {
    marginRight: lightTheme.spacing.md,
  },
  listItemRight: {
    flex: 1,
    justifyContent: 'center',
  },

  // Text styles
  textContainer: {
    // Container for shimmer text lines
  },
});

export default ShimmerPlaceholder;