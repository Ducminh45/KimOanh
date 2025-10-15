import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Colors from '@constants/colors';
import { spacing, fontSize } from '@constants/themes';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  text,
  size = 'large',
  color = Colors.primary,
  overlay = false,
}) => {
  const containerStyle = overlay ? styles.overlayContainer : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.overlay,
    zIndex: 9999,
  },
  text: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
});

export default Loading;
