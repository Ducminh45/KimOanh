// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  goal?: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle';
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  dailyCalorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
  fiberGoal?: number;
  waterGoal?: number;
  isPremium: boolean;
  premiumExpiresAt?: string;
  scanCountToday: number;
  scanLimit: number;
  streakCount: number;
  profileImageUrl?: string;
  language: string;
  unitSystem: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  createdAt: string;
}

// Food Types
export interface Food {
  id: string;
  name: string;
  nameEn?: string;
  nameVi?: string;
  category: string;
  cuisine?: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  servingUnit: string;
  imageUrl?: string;
  barcode?: string;
  isVerified: boolean;
  popularityScore?: number;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodId?: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  imageUrl?: string;
  scanned: boolean;
  confidenceScore?: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface ScannedFood {
  name: string;
  nameVi?: string;
  confidence: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  servingSize: string;
  category: string;
  cuisine?: string;
  foodId?: string;
  fromDatabase?: boolean;
  verified?: boolean;
}

// Nutrition Types
export interface DailyNutrition {
  date: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  mealCount: number;
}

// Water Types
export interface WaterLog {
  id: string;
  userId: string;
  amountMl: number;
  loggedAt: string;
}

export interface WaterSummary {
  date: string;
  totalMl: number;
  goalMl: number;
  progress: number;
  logCount: number;
}

// Exercise Types
export interface ExerciseLog {
  id: string;
  userId: string;
  exerciseType: string;
  durationMinutes: number;
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  notes?: string;
  loggedAt: string;
}

// Weight Types
export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  bmi?: number;
  notes?: string;
  loggedAt: string;
}

// Recipe Types
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  imageUrl?: string;
  instructions: string[];
  tags: string[];
  isFeatured: boolean;
  ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  foodId?: string;
  ingredientName: string;
  amount: number;
  unit: string;
  notes?: string;
}

// Meal Plan Types
export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  targetCalories: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanDay {
  day: number;
  dayName: string;
  meals: {
    breakfast: MealPlanMeal;
    lunch: MealPlanMeal;
    dinner: MealPlanMeal;
    snacks: MealPlanMeal[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface MealPlanMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Shopping List Types
export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  itemName: string;
  category?: string;
  quantity?: number;
  unit?: string;
  isChecked: boolean;
  notes?: string;
  createdAt: string;
}

// Community Types
export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  postType: 'general' | 'meal' | 'progress' | 'achievement';
  likesCount: number;
  commentsCount: number;
  authorName: string;
  authorImage?: string;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  authorName: string;
  authorImage?: string;
  createdAt: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  fullName: string;
  profileImageUrl?: string;
  score: number;
  rank: number;
  period: 'weekly' | 'monthly' | 'all_time';
}

// Chat Types
export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response?: string;
  isAiResponse: boolean;
  createdAt: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement: number;
  earned?: boolean;
  earnedAt?: string;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: undefined;
  Home: undefined;
  Scanner: undefined;
  ScanResult: { scannedFoods: ScannedFood[]; imageUri: string };
  FoodDatabase: undefined;
  FoodDetail: { foodId: string };
  Progress: undefined;
  Profile: undefined;
  Settings: undefined;
  WaterTracker: undefined;
  ExerciseTracker: undefined;
  Chat: undefined;
  Community: undefined;
  CreatePost: undefined;
  Leaderboard: undefined;
  MealPlanner: undefined;
  RecipeDetail: { recipeId: string };
  ShoppingList: undefined;
  Subscription: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Scanner: undefined;
  Progress: undefined;
  Community: undefined;
  Profile: undefined;
};
