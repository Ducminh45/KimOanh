import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@constants/colors';
import { fontSize, fontWeight } from '@constants/themes';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedMacroRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  color: string;
  label: string;
  value: number;
  goal: number;
  unit?: string;
}

const AnimatedMacroRing: React.FC<AnimatedMacroRingProps> = ({
  size = 120,
  strokeWidth = 10,
  progress,
  color,
  label,
  value,
  goal,
  unit = 'g',
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - animatedProgress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.gray200}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center Text */}
      <View style={styles.centerContent}>
        <Text style={styles.value}>{Math.round(value)}{unit}</Text>
        <Text style={styles.goal}>/ {goal}{unit}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  goal: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: Colors.text,
    marginTop: 2,
  },
});

export default AnimatedMacroRing;
