import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import { useTheme } from '@/hooks/useTheme';

// Import screens
import ProfileScreen from '@/screens/profile/ProfileScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import AccountSettingsScreen from '@/screens/profile/AccountSettingsScreen';
import NotificationSettingsScreen from '@/screens/settings/NotificationSettingsScreen';
import PrivacySettingsScreen from '@/screens/settings/PrivacySettingsScreen';
import SubscriptionScreen from '@/screens/profile/SubscriptionScreen';
import DataExportScreen from '@/screens/profile/DataExportScreen';
import HelpCenterScreen from '@/screens/profile/HelpCenterScreen';
import ContactSupportScreen from '@/screens/profile/ContactSupportScreen';
import AboutScreen from '@/screens/profile/AboutScreen';
import LegalScreen from '@/screens/profile/LegalScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => {
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
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Hồ sơ cá nhân',
        }}
      />
      
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          title: 'Chỉnh sửa hồ sơ',
        }}
      />
      
      <Stack.Screen 
        name="AccountSettings" 
        component={AccountSettingsScreen}
        options={{ 
          title: 'Cài đặt tài khoản',
        }}
      />
      
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ 
          title: 'Cài đặt thông báo',
        }}
      />
      
      <Stack.Screen 
        name="PrivacySettings" 
        component={PrivacySettingsScreen}
        options={{ 
          title: 'Cài đặt riêng tư',
        }}
      />
      
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ 
          title: 'Gói đăng ký',
        }}
      />
      
      <Stack.Screen 
        name="DataExport" 
        component={DataExportScreen}
        options={{ 
          title: 'Xuất dữ liệu',
        }}
      />
      
      <Stack.Screen 
        name="HelpCenter" 
        component={HelpCenterScreen}
        options={{ 
          title: 'Trung tâm trợ giúp',
        }}
      />
      
      <Stack.Screen 
        name="ContactSupport" 
        component={ContactSupportScreen}
        options={{ 
          title: 'Liên hệ hỗ trợ',
        }}
      />
      
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ 
          title: 'Về NutriScanVN',
        }}
      />
      
      <Stack.Screen 
        name="Legal" 
        component={LegalScreen}
        options={{ 
          title: 'Pháp lý',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;