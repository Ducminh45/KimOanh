import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@constants/colors';
import { fontSize, fontWeight } from '@constants/themes';

interface MacroCircleProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

const MacroCircle: React.FC<MacroCircleProps> = ({
  label,
  value,
  goal,
  color,
  size = 120,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / goal, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      <View style={[styles.circleContainer, { width: size, height: size }]}>
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
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.textContainer}>
          <Text style={styles.value}>{Math.round(value)}g</Text>
          <Text style={styles.goal}>/ {goal}g</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
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
    marginTop: 8,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
  },
});

export default MacroCircle;
