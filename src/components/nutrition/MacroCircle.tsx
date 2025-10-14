import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { NumberFormatter } from '@/utils/formatters';

export interface MacroCircleProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  animated?: boolean;
  style?: any;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({
  label,
  value,
  goal,
  unit,
  color,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  animated = true,
  style,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const center = size / 2;

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
        />
        
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
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
        {showPercentage && (
          <Text style={[styles.percentage, { color }]}>
            {Math.round(percentage)}%
          </Text>
        )}
        <Text style={styles.goal}>
          / {NumberFormatter.formatMacro(goal, 'g')}
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
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  goal: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default MacroCircle;