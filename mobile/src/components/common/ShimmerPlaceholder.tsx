import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@constants/colors';

interface ShimmerPlaceholderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.gray200, Colors.gray300, Colors.gray200]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray200,
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: 300,
    height: '100%',
  },
});

export default ShimmerPlaceholder;

/**
 * Pre-built shimmer layouts
 */
export const ShimmerLayouts = {
  FoodCard: () => (
    <View style={{ padding: spacing.md }}>
      <View style={{ flexDirection: 'row' }}>
        <ShimmerPlaceholder width={80} height={80} borderRadius={8} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <ShimmerPlaceholder width="70%" height={20} style={{ marginBottom: spacing.sm }} />
          <ShimmerPlaceholder width="50%" height={16} style={{ marginBottom: spacing.sm }} />
          <ShimmerPlaceholder width="90%" height={14} />
        </View>
      </View>
    </View>
  ),

  PostCard: () => (
    <View style={{ padding: spacing.md }}>
      <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
        <ShimmerPlaceholder width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <ShimmerPlaceholder width="40%" height={16} style={{ marginBottom: spacing.xs }} />
          <ShimmerPlaceholder width="30%" height={12} />
        </View>
      </View>
      <ShimmerPlaceholder width="100%" height={14} style={{ marginBottom: spacing.xs }} />
      <ShimmerPlaceholder width="80%" height={14} style={{ marginBottom: spacing.md }} />
      <ShimmerPlaceholder width="100%" height={200} borderRadius={8} />
    </View>
  ),

  ListItem: () => (
    <View style={{ flexDirection: 'row', padding: spacing.md, alignItems: 'center' }}>
      <ShimmerPlaceholder width={50} height={50} borderRadius={25} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <ShimmerPlaceholder width="60%" height={16} style={{ marginBottom: spacing.xs }} />
        <ShimmerPlaceholder width="40%" height={14} />
      </View>
    </View>
  ),
};

const { spacing } = require('@constants/themes');
