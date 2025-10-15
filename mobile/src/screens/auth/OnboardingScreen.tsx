import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight } from '@constants/themes';

const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Onboarding Step {step}</Text>
        <Text style={styles.subtitle}>Configure your profile and goals</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setStep(step < 4 ? step + 1 : 1)}
        >
          <Text style={styles.buttonText}>
            {step < 4 ? 'Next' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  subtitle: { fontSize: fontSize.md, color: Colors.textSecondary, marginBottom: spacing.xl },
  button: { backgroundColor: Colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 8 },
  buttonText: { color: Colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
});

export default OnboardingScreen;
