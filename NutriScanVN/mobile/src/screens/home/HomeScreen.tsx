import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { getDailySummary } from '../../services/api/userApi';

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const [summary, setSummary] = useState<{ calories: number; waterMl: number; caloriesBurned: number; macros: any } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await getDailySummary();
        setSummary(s);
      } catch {
        // ignore for now
      }
    })();
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Dashboard</Text>
      {summary ? (
        <View>
          <Text>Calories: {summary.calories} kcal</Text>
          <Text>Water: {summary.waterMl} ml</Text>
          <Text>Exercise: {summary.caloriesBurned} kcal</Text>
          <Text>Macros - P: {summary.macros.proteinG}g, C: {summary.macros.carbsG}g, F: {summary.macros.fatG}g</Text>
        </View>
      ) : (
        <Text>Loading summary...</Text>
      )}
      <View style={{ height: 16 }} />
      <Button title="Logout" onPress={() => navigation.replace('Login')} />
    </View>
  );
}
