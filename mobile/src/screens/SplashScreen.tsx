import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@constants/colors';
import { fontSize, fontWeight } from '@constants/themes';

const { width } = Dimensions.get('window');

const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after splash
    const timer = setTimeout(() => {
      navigation.replace('Auth');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>🥗</Text>
        <Text style={styles.appName}>NutriScanVN</Text>
        <Text style={styles.tagline}>Quản lý dinh dưỡng thông minh</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by AI</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: Colors.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: fontSize.lg,
    color: Colors.white,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: Colors.white,
    opacity: 0.7,
  },
});

export default SplashScreen;
