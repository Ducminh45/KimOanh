import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { AuthStackParamList } from './types';

// Import screens (we'll create these later)
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import VerifyEmailScreen from '@/screens/auth/VerifyEmailScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.lightGray,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: Colors.text,
        },
        headerTintColor: Colors.primary,
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: Colors.background,
        },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Đăng nhập',
          headerShown: false, // Hide header for login screen
        }}
      />
      
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Đăng ký',
          headerShown: false, // Hide header for register screen
        }}
      />
      
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Quên mật khẩu',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          title: 'Đặt lại mật khẩu',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="VerifyEmail" 
        component={VerifyEmailScreen}
        options={{
          title: 'Xác thực email',
          headerShown: true,
          headerLeft: () => null, // Prevent going back
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;