import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FoodStackParamList } from '../types';
import { useTheme } from '@/hooks/useTheme';

// Import screens
import FoodDatabaseScreen from '@/screens/food/FoodDatabaseScreen';
import FoodSearchScreen from '@/screens/food/FoodSearchScreen';
import FoodCategoriesScreen from '@/screens/food/FoodCategoriesScreen';
import FavoriteFoodScreen from '@/screens/food/FavoriteFoodScreen';
import RecentFoodScreen from '@/screens/food/RecentFoodScreen';
import CustomFoodScreen from '@/screens/food/CustomFoodScreen';
import FoodLogsScreen from '@/screens/food/FoodLogsScreen';
import MealPlannerScreen from '@/screens/meal-planner/MealPlannerScreen';
import RecipesScreen from '@/screens/meal-planner/RecipesScreen';
import ShoppingListScreen from '@/screens/meal-planner/ShoppingListScreen';
import NutritionAnalysisScreen from '@/screens/food/NutritionAnalysisScreen';

const Stack = createStackNavigator<FoodStackParamList>();

export const FoodStack: React.FC = () => {
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
        name="FoodDatabase" 
        component={FoodDatabaseScreen}
        options={{ 
          title: 'Cơ sở dữ liệu thực phẩm',
        }}
      />
      
      <Stack.Screen 
        name="FoodSearch" 
        component={FoodSearchScreen}
        options={{ 
          title: 'Tìm kiếm thực phẩm',
        }}
      />
      
      <Stack.Screen 
        name="FoodCategories" 
        component={FoodCategoriesScreen}
        options={{ 
          title: 'Danh mục thực phẩm',
        }}
      />
      
      <Stack.Screen 
        name="FavoriteFood" 
        component={FavoriteFoodScreen}
        options={{ 
          title: 'Thực phẩm yêu thích',
        }}
      />
      
      <Stack.Screen 
        name="RecentFood" 
        component={RecentFoodScreen}
        options={{ 
          title: 'Thực phẩm gần đây',
        }}
      />
      
      <Stack.Screen 
        name="CustomFood" 
        component={CustomFoodScreen}
        options={{ 
          title: 'Tạo thực phẩm tùy chỉnh',
        }}
      />
      
      <Stack.Screen 
        name="FoodLogs" 
        component={FoodLogsScreen}
        options={{ 
          title: 'Nhật ký thực phẩm',
        }}
      />
      
      <Stack.Screen 
        name="MealPlanner" 
        component={MealPlannerScreen}
        options={{ 
          title: 'Lập kế hoạch bữa ăn',
        }}
      />
      
      <Stack.Screen 
        name="Recipes" 
        component={RecipesScreen}
        options={{ 
          title: 'Công thức nấu ăn',
        }}
      />
      
      <Stack.Screen 
        name="ShoppingList" 
        component={ShoppingListScreen}
        options={{ 
          title: 'Danh sách mua sắm',
        }}
      />
      
      <Stack.Screen 
        name="NutritionAnalysis" 
        component={NutritionAnalysisScreen}
        options={{ 
          title: 'Phân tích dinh dưỡng',
        }}
      />
    </Stack.Navigator>
  );
};

export default FoodStack;