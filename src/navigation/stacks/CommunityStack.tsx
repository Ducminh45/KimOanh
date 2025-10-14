import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CommunityStackParamList } from '../types';
import { useTheme } from '@/hooks/useTheme';

// Import screens
import CommunityScreen from '@/screens/community/CommunityScreen';
import CommunityFeedScreen from '@/screens/community/CommunityFeedScreen';
import MyPostsScreen from '@/screens/community/MyPostsScreen';
import ChallengesScreen from '@/screens/community/ChallengesScreen';
import ChallengeDetailScreen from '@/screens/community/ChallengeDetailScreen';
import LeaderboardScreen from '@/screens/community/LeaderboardScreen';
import FriendsScreen from '@/screens/community/FriendsScreen';
import MessagesScreen from '@/screens/community/MessagesScreen';
import NotificationsScreen from '@/screens/community/NotificationsScreen';
import PostDetailScreen from '@/screens/community/PostDetailScreen';

const Stack = createStackNavigator<CommunityStackParamList>();

export const CommunityStack: React.FC = () => {
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
        name="Community" 
        component={CommunityScreen}
        options={{ 
          title: 'Cộng đồng',
        }}
      />
      
      <Stack.Screen 
        name="CommunityFeed" 
        component={CommunityFeedScreen}
        options={{ 
          title: 'Bảng tin',
        }}
      />
      
      <Stack.Screen 
        name="MyPosts" 
        component={MyPostsScreen}
        options={{ 
          title: 'Bài viết của tôi',
        }}
      />
      
      <Stack.Screen 
        name="Challenges" 
        component={ChallengesScreen}
        options={{ 
          title: 'Thử thách',
        }}
      />
      
      <Stack.Screen 
        name="ChallengeDetail" 
        component={ChallengeDetailScreen}
        options={{ 
          title: 'Chi tiết thử thách',
        }}
      />
      
      <Stack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ 
          title: 'Bảng xếp hạng',
        }}
      />
      
      <Stack.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{ 
          title: 'Bạn bè',
        }}
      />
      
      <Stack.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ 
          title: 'Tin nhắn',
        }}
      />
      
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          title: 'Thông báo',
        }}
      />
      
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{ 
          title: 'Chi tiết bài viết',
        }}
      />
    </Stack.Navigator>
  );
};

export default CommunityStack;