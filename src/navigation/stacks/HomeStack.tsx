import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from '../types';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';

// Import screens (we'll create these)
import HomeScreen from '@/screens/home/HomeScreen';
import DailyProgressScreen from '@/screens/home/DailyProgressScreen';
import NutritionSummaryScreen from '@/screens/home/NutritionSummaryScreen';
import QuickActionsScreen from '@/screens/home/QuickActionsScreen';
import AchievementsScreen from '@/screens/home/AchievementsScreen';
import GoalsScreen from '@/screens/home/GoalsScreen';
import StreaksScreen from '@/screens/home/StreaksScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
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
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'NutriScanVN',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="DailyProgress" 
        component={DailyProgressScreen}
        options={{ 
          title: 'Tiến trình hàng ngày',
        }}
      />
      
      <Stack.Screen 
        name="NutritionSummary" 
        component={NutritionSummaryScreen}
        options={{ 
          title: 'Tóm tắt dinh dưỡng',
        }}
      />
      
      <Stack.Screen 
        name="QuickActions" 
        component={QuickActionsScreen}
        options={{ 
          title: 'Thao tác nhanh',
        }}
      />
      
      <Stack.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ 
          title: 'Thành tựu',
        }}
      />
      
      <Stack.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{ 
          title: 'Mục tiêu',
        }}
      />
      
      <Stack.Screen 
        name="Streaks" 
        component={StreaksScreen}
        options={{ 
          title: 'Chuỗi ngày',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;