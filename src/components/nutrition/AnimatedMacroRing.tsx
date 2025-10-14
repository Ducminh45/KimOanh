import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { NumberFormatter } from '@/utils/formatters';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface AnimatedMacroRingProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  style?: any;
}

export const AnimatedMacroRing: React.FC<AnimatedMacroRingProps> = ({
  label,
  value,
  goal,
  unit,
  color,
  size = 140,
  strokeWidth = 12,
  duration = 1500,
  delay = 0,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedPercentage = useRef(new Animated.Value(0)).current;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const center = size / 2;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration,
        delay,
        useNativeDriver: false,
      }),
      Animated.timing(animatedPercentage, {
        toValue: percentage,
        duration,
        delay,
        useNativeDriver: false,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [percentage, duration, delay]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const displayPercentage = animatedPercentage.interpolate({
    inputRange: [0, 100],
    outputRange: [0, percentage],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.lightGray}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />
        
        {/* Animated progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>
          {NumberFormatter.formatMacro(value, 'g')}
        </Text>
        <Text style={styles.label}>{label}</Text>
        <Animated.Text style={[styles.percentage, { color }]}>
          {displayPercentage.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', `${Math.round(percentage)}%`],
          })}
        </Animated.Text>
        <Text style={styles.goal}>
          mục tiêu: {NumberFormatter.formatMacro(goal, 'g')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  goal: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default AnimatedMacroRing;