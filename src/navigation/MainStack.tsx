import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { MainStackParamList } from './types';
import { useTheme } from '@/hooks/useTheme';

// Import stack navigators
import HomeStack from './stacks/HomeStack';
import ScannerStack from './stacks/ScannerStack';
import FoodStack from './stacks/FoodStack';
import ProgressStack from './stacks/ProgressStack';
import CommunityStack from './stacks/CommunityStack';
import ProfileStack from './stacks/ProfileStack';

// Import badge component
import Badge from '@/components/common/Badge';

const Tab = createBottomTabNavigator<MainStackParamList>();

export const MainStack: React.FC = () => {
  const { theme, isDark } = useTheme();

  const getTabBarIcon = (routeName: keyof MainStackParamList, focused: boolean, size: number) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (routeName) {
      case 'HomeTab':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'ScannerTab':
        iconName = focused ? 'scan' : 'scan-outline';
        break;
      case 'FoodTab':
        iconName = focused ? 'restaurant' : 'restaurant-outline';
        break;
      case 'ProgressTab':
        iconName = focused ? 'analytics' : 'analytics-outline';
        break;
      case 'CommunityTab':
        iconName = focused ? 'people' : 'people-outline';
        break;
      case 'ProfileTab':
        iconName = focused ? 'person' : 'person-outline';
        break;
      default:
        iconName = 'help-outline';
    }

    return (
      <Ionicons 
        name={iconName} 
        size={size} 
        color={focused ? Colors.primary : Colors.textSecondary} 
      />
    );
  };

  const getTabBarLabel = (routeName: keyof MainStackParamList) => {
    const labels = {
      HomeTab: 'Trang chủ',
      ScannerTab: 'Quét',
      FoodTab: 'Thực phẩm',
      ProgressTab: 'Tiến trình',
      CommunityTab: 'Cộng đồng',
      ProfileTab: 'Cá nhân',
    };
    return labels[routeName];
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => 
          getTabBarIcon(route.name, focused, size),
        tabBarLabel: getTabBarLabel(route.name),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.lightGray,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          ...theme.shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
      initialRouteName="HomeTab"
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{
          tabBarTestID: 'home-tab',
        }}
      />
      
      <Tab.Screen 
        name="ScannerTab" 
        component={ScannerStack}
        options={{
          tabBarTestID: 'scanner-tab',
          tabBarIcon: ({ focused, size }) => (
            <View style={{
              backgroundColor: focused ? Colors.primary : 'transparent',
              borderRadius: 25,
              padding: 8,
              marginTop: -5,
            }}>
              <Ionicons 
                name={focused ? 'scan' : 'scan-outline'} 
                size={size + 4} 
                color={focused ? Colors.white : Colors.textSecondary} 
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="FoodTab" 
        component={FoodStack}
        options={{
          tabBarTestID: 'food-tab',
        }}
      />
      
      <Tab.Screen 
        name="ProgressTab" 
        component={ProgressStack}
        options={{
          tabBarTestID: 'progress-tab',
        }}
      />
      
      <Tab.Screen 
        name="CommunityTab" 
        component={CommunityStack}
        options={{
          tabBarTestID: 'community-tab',
          tabBarBadge: undefined, // We can add notification badges here
        }}
      />
      
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{
          tabBarTestID: 'profile-tab',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainStack;