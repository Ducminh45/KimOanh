import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { register } from '../../services/api/authApi';

export default function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      await register({ email, password, fullName });
      Alert.alert('Success', 'Registration successful. Please log in.');
      navigation.replace('Login');
    } catch (e: any) {
      Alert.alert('Register failed', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Register</Text>
      <Text>Full Name</Text>
      <TextInput value={fullName} onChangeText={setFullName} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 16 }} />
      <Button title={loading ? 'Loading...' : 'Create account'} onPress={onRegister} disabled={loading} />
    </View>
  );
}
