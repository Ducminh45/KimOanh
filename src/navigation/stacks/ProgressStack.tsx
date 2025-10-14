import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProgressStackParamList } from '../types';
import { useTheme } from '@/hooks/useTheme';

// Import screens
import ProgressScreen from '@/screens/progress/ProgressScreen';
import WeightProgressScreen from '@/screens/progress/WeightProgressScreen';
import CalorieProgressScreen from '@/screens/progress/CalorieProgressScreen';
import WaterProgressScreen from '@/screens/progress/WaterProgressScreen';
import ExerciseProgressScreen from '@/screens/progress/ExerciseProgressScreen';
import ProgressChartsScreen from '@/screens/progress/ProgressChartsScreen';
import ProgressReportsScreen from '@/screens/progress/ProgressReportsScreen';
import GoalTrackingScreen from '@/screens/progress/GoalTrackingScreen';
import MeasurementsScreen from '@/screens/progress/MeasurementsScreen';

const Stack = createStackNavigator<ProgressStackParamList>();

export const ProgressStack: React.FC = () => {
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
        name="Progress" 
        component={ProgressScreen}
        options={{ 
          title: 'Tiến trình',
        }}
      />
      
      <Stack.Screen 
        name="WeightProgress" 
        component={WeightProgressScreen}
        options={{ 
          title: 'Tiến trình cân nặng',
        }}
      />
      
      <Stack.Screen 
        name="CalorieProgress" 
        component={CalorieProgressScreen}
        options={{ 
          title: 'Tiến trình calo',
        }}
      />
      
      <Stack.Screen 
        name="WaterProgress" 
        component={WaterProgressScreen}
        options={{ 
          title: 'Tiến trình uống nước',
        }}
      />
      
      <Stack.Screen 
        name="ExerciseProgress" 
        component={ExerciseProgressScreen}
        options={{ 
          title: 'Tiến trình tập luyện',
        }}
      />
      
      <Stack.Screen 
        name="ProgressCharts" 
        component={ProgressChartsScreen}
        options={{ 
          title: 'Biểu đồ tiến trình',
        }}
      />
      
      <Stack.Screen 
        name="ProgressReports" 
        component={ProgressReportsScreen}
        options={{ 
          title: 'Báo cáo tiến trình',
        }}
      />
      
      <Stack.Screen 
        name="GoalTracking" 
        component={GoalTrackingScreen}
        options={{ 
          title: 'Theo dõi mục tiêu',
        }}
      />
      
      <Stack.Screen 
        name="Measurements" 
        component={MeasurementsScreen}
        options={{ 
          title: 'Số đo cơ thể',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProgressStack;