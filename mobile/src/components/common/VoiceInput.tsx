import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Toast from 'react-native-toast-message';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, placeholder }) => {
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = new Animated.Value(1);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      stopPulseAnimation();
      return;
    }

    // Start listening
    setIsListening(true);
    startPulseAnimation();

    // Simulate voice recognition (in real app, use expo-speech or react-native-voice)
    Toast.show({
      type: 'info',
      text1: 'Đang nghe...',
      text2: 'Nói tên thực phẩm bạn muốn tìm',
    });

    // Simulate recognition result after 2 seconds
    setTimeout(() => {
      setIsListening(false);
      stopPulseAnimation();
      
      // Demo result
      const demoResults = [
        'Phở bò',
        'Cơm rang',
        'Bánh mì',
        'Bún chả',
        'Gỏi cuốn',
      ];
      const randomResult = demoResults[Math.floor(Math.random() * demoResults.length)];
      
      onResult(randomResult);
      
      Toast.show({
        type: 'success',
        text1: 'Đã nhận diện',
        text2: randomResult,
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.micButton,
          isListening && styles.micButtonActive,
        ]}
        onPress={handleVoiceInput}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.micIcon,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={28}
            color={isListening ? Colors.white : Colors.primary}
          />
        </Animated.View>
      </TouchableOpacity>

      {isListening && (
        <View style={styles.listeningIndicator}>
          <View style={styles.wave} />
          <Text style={styles.listeningText}>Đang nghe...</Text>
        </View>
      )}

      {!isListening && placeholder && (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.md,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  micButtonActive: {
    backgroundColor: Colors.primary,
  },
  micIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningIndicator: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  wave: {
    width: 100,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  listeningText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: fontWeight.medium,
  },
  placeholder: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default VoiceInput;
