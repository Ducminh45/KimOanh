import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { login } from '../../services/api/authApi';

export default function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const res = await login({ email, password });
      // naive token storage placeholder
      (globalThis as any).__ACCESS_TOKEN__ = res.accessToken;
      (globalThis as any).__REFRESH_TOKEN__ = res.refreshToken;
      navigation.replace('Onboarding');
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Login</Text>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 16 }} />
      <Button title={loading ? 'Loading...' : 'Login'} onPress={onLogin} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="Create account" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}
