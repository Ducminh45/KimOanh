import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack Navigator
export type RootStackParamList = {
  // Auth Stack
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  
  // Main App Stack
  MainStack: NavigatorScreenParams<MainStackParamList>;
  
  // Onboarding
  Onboarding: undefined;
  
  // Modal screens
  FoodDetail: { foodId: string };
  RecipeDetail: { recipeId: string };
  ScanResult: { scanResult: any };
  MealPlanDetail: { planId: string };
  UserProfile: { userId: string };
  Settings: undefined;
  Premium: undefined;
  CameraScanner: undefined;
  ImagePicker: undefined;
  FoodLogger: { 
    foodId?: string; 
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    scanResult?: any;
  };
  WeightLogger: undefined;
  WaterLogger: undefined;
  ExerciseLogger: undefined;
  GoalSetter: { goalType?: string };
  CreatePost: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  AboutApp: undefined;
  HelpSupport: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
};

// Main Stack Navigator (Bottom Tabs)
export type MainStackParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ScannerTab: NavigatorScreenParams<ScannerStackParamList>;
  FoodTab: NavigatorScreenParams<FoodStackParamList>;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList>;
  CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack Navigator
export type HomeStackParamList = {
  Home: undefined;
  DailyProgress: { date?: string };
  NutritionSummary: { date?: string };
  QuickActions: undefined;
  Achievements: undefined;
  Goals: undefined;
  Streaks: undefined;
};

// Scanner Stack Navigator
export type ScannerStackParamList = {
  Scanner: undefined;
  CameraView: undefined;
  ScanHistory: undefined;
  ScanTips: undefined;
  ManualEntry: undefined;
};

// Food Stack Navigator
export type FoodStackParamList = {
  FoodDatabase: undefined;
  FoodSearch: { query?: string; category?: string };
  FoodCategories: undefined;
  FavoriteFood: undefined;
  RecentFood: undefined;
  CustomFood: undefined;
  FoodLogs: { date?: string };
  MealPlanner: undefined;
  Recipes: undefined;
  ShoppingList: undefined;
  NutritionAnalysis: undefined;
};

// Progress Stack Navigator
export type ProgressStackParamList = {
  Progress: undefined;
  WeightProgress: undefined;
  CalorieProgress: undefined;
  WaterProgress: undefined;
  ExerciseProgress: undefined;
  ProgressCharts: undefined;
  ProgressReports: undefined;
  GoalTracking: undefined;
  Measurements: undefined;
};

// Community Stack Navigator
export type CommunityStackParamList = {
  Community: undefined;
  CommunityFeed: undefined;
  MyPosts: undefined;
  Challenges: undefined;
  ChallengeDetail: { challengeId: string };
  Leaderboard: undefined;
  Friends: undefined;
  Messages: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
};

// Profile Stack Navigator
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  Subscription: undefined;
  DataExport: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  About: undefined;
  Legal: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  StackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  BottomTabScreenProps<MainStackParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  StackScreenProps<HomeStackParamList, T>;

export type ScannerStackScreenProps<T extends keyof ScannerStackParamList> = 
  StackScreenProps<ScannerStackParamList, T>;

export type FoodStackScreenProps<T extends keyof FoodStackParamList> = 
  StackScreenProps<FoodStackParamList, T>;

export type ProgressStackScreenProps<T extends keyof ProgressStackParamList> = 
  StackScreenProps<ProgressStackParamList, T>;

export type CommunityStackScreenProps<T extends keyof CommunityStackParamList> = 
  StackScreenProps<CommunityStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = 
  StackScreenProps<ProfileStackParamList, T>;

// Navigation Props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}