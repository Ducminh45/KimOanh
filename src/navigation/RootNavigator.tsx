import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { RootStackParamList } from './types';
import { AnalyticsService } from '@/services/analytics/analyticsService';

// Import navigators
import AuthStack from './AuthStack';
import MainStack from './MainStack';

// Import screens
import OnboardingScreen from '@/screens/auth/OnboardingScreen';
import FoodDetailScreen from '@/screens/food/FoodDetailScreen';
import RecipeDetailScreen from '@/screens/food/RecipeDetailScreen';
import ScanResultScreen from '@/screens/scanner/ScanResultScreen';
import MealPlanDetailScreen from '@/screens/meal-planner/MealPlanDetailScreen';
import UserProfileScreen from '@/screens/profile/UserProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import PremiumScreen from '@/screens/premium/PremiumScreen';
import CameraScannerScreen from '@/screens/scanner/CameraScannerScreen';
import ImagePickerScreen from '@/screens/scanner/ImagePickerScreen';
import FoodLoggerScreen from '@/screens/food/FoodLoggerScreen';
import WeightLoggerScreen from '@/screens/tracking/WeightLoggerScreen';
import WaterLoggerScreen from '@/screens/tracking/WaterLoggerScreen';
import ExerciseLoggerScreen from '@/screens/tracking/ExerciseLoggerScreen';
import GoalSetterScreen from '@/screens/goals/GoalSetterScreen';
import CreatePostScreen from '@/screens/community/CreatePostScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import ChangePasswordScreen from '@/screens/auth/ChangePasswordScreen';
import NotificationSettingsScreen from '@/screens/settings/NotificationSettingsScreen';
import PrivacySettingsScreen from '@/screens/settings/PrivacySettingsScreen';
import AboutAppScreen from '@/screens/settings/AboutAppScreen';
import HelpSupportScreen from '@/screens/settings/HelpSupportScreen';
import TermsOfServiceScreen from '@/screens/legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from '@/screens/legal/PrivacyPolicyScreen';

// Import loading component
import Loading from '@/components/common/Loading';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Track navigation state changes
  const handleNavigationStateChange = (state: any) => {
    // Get current route name
    const getCurrentRouteName = (navigationState: any): string => {
      if (!navigationState || typeof navigationState.index !== 'number') {
        return 'Unknown';
      }

      const route = navigationState.routes[navigationState.index];
      
      if (route.state) {
        return getCurrentRouteName(route.state);
      }

      return route.name;
    };

    const currentRouteName = getCurrentRouteName(state);
    
    // Track screen view
    AnalyticsService.trackScreenView(currentRouteName);
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <Loading 
        visible={true}
        message="Đang khởi tạo ứng dụng..."
        overlay={true}
      />
    );
  }

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.surface,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGray,
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.text,
    },
    headerTintColor: theme.colors.primary,
    headerBackTitleVisible: false,
    cardStyle: {
      backgroundColor: theme.colors.background,
    },
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.surface} />
      
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.lightGray,
            notification: theme.colors.error,
          },
        }}
        onStateChange={handleNavigationStateChange}
      >
        <Stack.Navigator
          screenOptions={screenOptions}
          initialRouteName={isAuthenticated ? 'MainStack' : 'AuthStack'}
        >
          {!isAuthenticated ? (
            // Auth Stack
            <>
              <Stack.Screen 
                name="AuthStack" 
                component={AuthStack}
                options={{ headerShown: false }}
              />
              
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen}
                options={{ 
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
            </>
          ) : (
            // Main App Stack
            <>
              <Stack.Screen 
                name="MainStack" 
                component={MainStack}
                options={{ headerShown: false }}
              />

              {/* Modal Screens */}
              <Stack.Group screenOptions={{ presentation: 'modal' }}>
                <Stack.Screen 
                  name="FoodDetail" 
                  component={FoodDetailScreen}
                  options={{ 
                    title: 'Chi tiết thực phẩm',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="RecipeDetail" 
                  component={RecipeDetailScreen}
                  options={{ 
                    title: 'Công thức nấu ăn',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="ScanResult" 
                  component={ScanResultScreen}
                  options={{ 
                    title: 'Kết quả quét',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="MealPlanDetail" 
                  component={MealPlanDetailScreen}
                  options={{ 
                    title: 'Kế hoạch bữa ăn',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="UserProfile" 
                  component={UserProfileScreen}
                  options={{ 
                    title: 'Hồ sơ người dùng',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{ 
                    title: 'Cài đặt',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="Premium" 
                  component={PremiumScreen}
                  options={{ 
                    title: 'NutriScan Premium',
                    headerShown: true,
                  }}
                />
              </Stack.Group>

              {/* Full Screen Modals */}
              <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
                <Stack.Screen 
                  name="CameraScanner" 
                  component={CameraScannerScreen}
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }}
                />
                
                <Stack.Screen 
                  name="ImagePicker" 
                  component={ImagePickerScreen}
                  options={{ 
                    title: 'Chọn hình ảnh',
                    headerShown: true,
                  }}
                />
              </Stack.Group>

              {/* Form Screens */}
              <Stack.Group>
                <Stack.Screen 
                  name="FoodLogger" 
                  component={FoodLoggerScreen}
                  options={{ 
                    title: 'Ghi nhận thực phẩm',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="WeightLogger" 
                  component={WeightLoggerScreen}
                  options={{ 
                    title: 'Ghi nhận cân nặng',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="WaterLogger" 
                  component={WaterLoggerScreen}
                  options={{ 
                    title: 'Ghi nhận nước uống',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="ExerciseLogger" 
                  component={ExerciseLoggerScreen}
                  options={{ 
                    title: 'Ghi nhận tập luyện',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="GoalSetter" 
                  component={GoalSetterScreen}
                  options={{ 
                    title: 'Đặt mục tiêu',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="CreatePost" 
                  component={CreatePostScreen}
                  options={{ 
                    title: 'Tạo bài viết',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="EditProfile" 
                  component={EditProfileScreen}
                  options={{ 
                    title: 'Chỉnh sửa hồ sơ',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="ChangePassword" 
                  component={ChangePasswordScreen}
                  options={{ 
                    title: 'Đổi mật khẩu',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="NotificationSettings" 
                  component={NotificationSettingsScreen}
                  options={{ 
                    title: 'Cài đặt thông báo',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="PrivacySettings" 
                  component={PrivacySettingsScreen}
                  options={{ 
                    title: 'Cài đặt riêng tư',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="AboutApp" 
                  component={AboutAppScreen}
                  options={{ 
                    title: 'Về ứng dụng',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="HelpSupport" 
                  component={HelpSupportScreen}
                  options={{ 
                    title: 'Trợ giúp & Hỗ trợ',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="TermsOfService" 
                  component={TermsOfServiceScreen}
                  options={{ 
                    title: 'Điều khoản sử dụng',
                    headerShown: true,
                  }}
                />
                
                <Stack.Screen 
                  name="PrivacyPolicy" 
                  component={PrivacyPolicyScreen}
                  options={{ 
                    title: 'Chính sách bảo mật',
                    headerShown: true,
                  }}
                />
              </Stack.Group>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default RootNavigator;