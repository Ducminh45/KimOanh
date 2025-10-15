import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import api from '../../services/api/apiClient';

export default function OnboardingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('65');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [activityLevel, setActivityLevel] = useState<'sedentary'|'light'|'moderate'|'active'|'very_active'>('light');
  const [dietaryPreferences, setDietaryPreferences] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');

  const onNext = async () => {
    if (step < 4) return setStep(step + 1);
    try {
      await api.put('/user/me', { fullName });
      await api.put('/user/metrics', {
        gender,
        birthDate,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        goal,
        activityLevel,
        dietaryPreferences: dietaryPreferences ? dietaryPreferences.split(',').map(s => s.trim()) : [],
        allergies: allergies ? allergies.split(',').map(s => s.trim()) : []
      });
      navigation.replace('Home');
    } catch (e: any) {
      Alert.alert('Onboarding failed', e?.response?.data?.message || e.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Onboarding ({step}/4)</Text>
      {step === 1 && (
        <View>
          <Text>Full Name</Text>
          <TextInput value={fullName} onChangeText={setFullName} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
          <Text>Gender (male/female/other)</Text>
          <TextInput value={gender} onChangeText={(v) => setGender(v as any)} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
          <Text>Birth date (YYYY-MM-DD)</Text>
          <TextInput value={birthDate} onChangeText={setBirthDate} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
        </View>
      )}
      {step === 2 && (
        <View>
          <Text>Height (cm)</Text>
          <TextInput value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
          <Text>Weight (kg)</Text>
          <TextInput value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
        </View>
      )}
      {step === 3 && (
        <View>
          <Text>Goal (lose/maintain/gain)</Text>
          <TextInput value={goal} onChangeText={(v) => setGoal(v as any)} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
          <Text>Activity level (sedentary/light/moderate/active/very_active)</Text>
          <TextInput value={activityLevel} onChangeText={(v) => setActivityLevel(v as any)} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
        </View>
      )}
      {step === 4 && (
        <View>
          <Text>Dietary preferences (comma-separated)</Text>
          <TextInput value={dietaryPreferences} onChangeText={setDietaryPreferences} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
          <Text>Allergies (comma-separated)</Text>
          <TextInput value={allergies} onChangeText={setAllergies} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
        </View>
      )}

      <Button title={step < 4 ? 'Next' : 'Finish'} onPress={onNext} />
    </View>
  );
}
