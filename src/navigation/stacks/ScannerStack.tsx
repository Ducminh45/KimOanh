import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ScannerStackParamList } from '../types';
import { useTheme } from '@/hooks/useTheme';

// Import screens
import ScannerScreen from '@/screens/scanner/ScannerScreen';
import CameraViewScreen from '@/screens/scanner/CameraViewScreen';
import ScanHistoryScreen from '@/screens/scanner/ScanHistoryScreen';
import ScanTipsScreen from '@/screens/scanner/ScanTipsScreen';
import ManualEntryScreen from '@/screens/scanner/ManualEntryScreen';

const Stack = createStackNavigator<ScannerStackParamList>();

export const ScannerStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.lightGray,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.primary,
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{ 
          title: 'Quét thực phẩm',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="CameraView" 
        component={CameraViewScreen}
        options={{ 
          title: 'Camera',
          headerShown: false, // Full screen camera
        }}
      />
      
      <Stack.Screen 
        name="ScanHistory" 
        component={ScanHistoryScreen}
        options={{ 
          title: 'Lịch sử quét',
        }}
      />
      
      <Stack.Screen 
        name="ScanTips" 
        component={ScanTipsScreen}
        options={{ 
          title: 'Mẹo quét hiệu quả',
        }}
      />
      
      <Stack.Screen 
        name="ManualEntry" 
        component={ManualEntryScreen}
        options={{ 
          title: 'Nhập thủ công',
        }}
      />
    </Stack.Navigator>
  );
};

export default ScannerStack;