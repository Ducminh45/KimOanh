import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Colors from '@constants/colors';
import { fontSize, fontWeight } from '@constants/themes';

interface AnimatedWaterGlassProps {
  current: number;
  goal: number;
  size?: number;
}

const AnimatedWaterGlass: React.FC<AnimatedWaterGlassProps> = ({
  current,
  goal,
  size = 200,
}) => {
  const progress = Math.min(current / goal, 1);
  const waterHeight = useSharedValue(0);

  useEffect(() => {
    waterHeight.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [current, goal]);

  const animatedWaterStyle = useAnimatedStyle(() => {
    return {
      height: `${waterHeight.value * 100}%`,
    };
  });

  const percentage = Math.round(progress * 100);
  const currentLiters = (current / 1000).toFixed(1);
  const goalLiters = (goal / 1000).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Glass Container */}
      <View style={[styles.glassContainer, { width: size, height: size * 1.5 }]}>
        {/* Glass Outline */}
        <Svg width={size} height={size * 1.5} viewBox="0 0 200 300">
          <Defs>
            <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={Colors.accent} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.9" />
            </LinearGradient>
          </Defs>
          
          {/* Glass shape */}
          <Path
            d="M 40 10 L 60 280 L 140 280 L 160 10 Z"
            fill="none"
            stroke={Colors.gray300}
            strokeWidth="4"
          />
          
          {/* Glass base */}
          <Rect
            x="50"
            y="280"
            width="100"
            height="10"
            fill={Colors.gray300}
          />
        </Svg>

        {/* Animated Water */}
        <Animated.View
          style={[
            styles.water,
            animatedWaterStyle,
            { width: size - 40 },
          ]}
        >
          <View style={styles.waterSurface} />
        </Animated.View>

        {/* Percentage Text */}
        <View style={styles.textContainer}>
          <Text style={styles.percentage}>{percentage}%</Text>
          <Text style={styles.amount}>{currentLiters}L / {goalLiters}L</Text>
        </View>
      </View>

      {/* Measurement Lines */}
      <View style={[styles.measurements, { height: size * 1.5 }]}>
        {[25, 50, 75, 100].map((mark) => (
          <View key={mark} style={styles.measurementLine}>
            <View style={styles.line} />
            <Text style={styles.measurementText}>{mark}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassContainer: {
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  water: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: Colors.accent,
    opacity: 0.7,
    borderRadius: 10,
  },
  waterSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: Colors.accent,
    borderRadius: 10,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentage: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
    textShadowColor: Colors.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  amount: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: fontWeight.medium,
  },
  measurements: {
    position: 'absolute',
    right: -50,
    top: 0,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  measurementLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: Colors.gray300,
    marginRight: 4,
  },
  measurementText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
});

export default AnimatedWaterGlass;
