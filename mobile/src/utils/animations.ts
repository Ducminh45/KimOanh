import { Animated, Easing } from 'react-native';

/**
 * Fade in animation
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

/**
 * Scale animation
 */
export const scale = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  });
};

/**
 * Slide in from bottom
 */
export const slideInFromBottom = (
  animatedValue: Animated.Value,
  duration: number = 400
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

/**
 * Slide out to bottom
 */
export const slideOutToBottom = (
  animatedValue: Animated.Value,
  distance: number,
  duration: number = 400
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: distance,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

/**
 * Bounce animation
 */
export const bounce = (animatedValue: Animated.Value): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.2,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Shake animation
 */
export const shake = (animatedValue: Animated.Value): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

/**
 * Pulse animation (continuous)
 */
export const pulse = (animatedValue: Animated.Value): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Rotate animation (continuous)
 */
export const rotate = (animatedValue: Animated.Value): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

/**
 * Get interpolated rotation
 */
export const getRotateInterpolation = (animatedValue: Animated.Value): Animated.AnimatedInterpolation<string | number> => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

/**
 * Sequential fade in animation for list items
 */
export const staggerAnimation = (
  items: Animated.Value[],
  duration: number = 100,
  delay: number = 50
): Animated.CompositeAnimation => {
  const animations = items.map((item, index) =>
    Animated.timing(item, {
      toValue: 1,
      duration,
      delay: index * delay,
      easing: Easing.ease,
      useNativeDriver: true,
    })
  );

  return Animated.parallel(animations);
};

/**
 * Progress animation
 */
export const animateProgress = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false, // Can't use native driver for width/height
  });
};

export default {
  fadeIn,
  fadeOut,
  scale,
  slideInFromBottom,
  slideOutToBottom,
  bounce,
  shake,
  pulse,
  rotate,
  getRotateInterpolation,
  staggerAnimation,
  animateProgress,
};
