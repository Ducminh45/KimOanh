export const Config = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.nutriscanvn.com',
  API_TIMEOUT: 30000,
  
  // Gemini AI Configuration
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  GEMINI_MODEL: 'gemini-pro-vision',
  
  // FatSecret API Configuration
  FATSECRET_CLIENT_ID: process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID || '',
  FATSECRET_CLIENT_SECRET: process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET || '',
  
  // App Configuration
  APP_NAME: 'NutriScanVN',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  FEATURES: {
    PREMIUM_SUBSCRIPTION: true,
    AI_CHATBOT: true,
    SOCIAL_FEATURES: true,
    MEAL_PLANNER: true,
    EXERCISE_TRACKING: true,
    WATER_TRACKING: true,
    CHALLENGES: true,
    LEADERBOARD: true,
  },
  
  // Limits
  FREE_SCANS_PER_DAY: 3,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_CHAT_HISTORY: 100,
  
  // Nutrition Defaults
  DEFAULT_SERVING_SIZE: 100, // grams
  MACRO_DISTRIBUTION: {
    PROTEIN: 0.3, // 30%
    CARBS: 0.4,   // 40%
    FAT: 0.3,     // 30%
  },
  
  // BMI Categories
  BMI_CATEGORIES: {
    UNDERWEIGHT: { min: 0, max: 18.5, color: '#3498DB' },
    NORMAL: { min: 18.5, max: 25, color: '#2ECC71' },
    OVERWEIGHT: { min: 25, max: 30, color: '#F39C12' },
    OBESE: { min: 30, max: 100, color: '#E74C3C' },
  },
  
  // Activity Levels
  ACTIVITY_LEVELS: {
    SEDENTARY: { multiplier: 1.2, label: 'Sedentary (little/no exercise)' },
    LIGHTLY_ACTIVE: { multiplier: 1.375, label: 'Lightly active (light exercise/sports 1-3 days/week)' },
    MODERATELY_ACTIVE: { multiplier: 1.55, label: 'Moderately active (moderate exercise/sports 3-5 days/week)' },
    VERY_ACTIVE: { multiplier: 1.725, label: 'Very active (hard exercise/sports 6-7 days a week)' },
    EXTREMELY_ACTIVE: { multiplier: 1.9, label: 'Extremely active (very hard exercise/sports & physical job)' },
  },
  
  // Goals
  GOALS: {
    LOSE_WEIGHT: { calorieAdjustment: -500, label: 'Lose Weight' },
    MAINTAIN_WEIGHT: { calorieAdjustment: 0, label: 'Maintain Weight' },
    GAIN_WEIGHT: { calorieAdjustment: 500, label: 'Gain Weight' },
  },
  
  // Water Intake
  WATER_INTAKE: {
    DEFAULT_GOAL: 2000, // ml
    QUICK_ADD_AMOUNTS: [250, 500, 750, 1000], // ml
  },
  
  // Exercise Types
  EXERCISE_TYPES: [
    { id: 'cardio', name: 'Cardio', caloriesPerMinute: { low: 5, medium: 8, high: 12 } },
    { id: 'strength', name: 'Strength Training', caloriesPerMinute: { low: 3, medium: 5, high: 8 } },
    { id: 'yoga', name: 'Yoga', caloriesPerMinute: { low: 2, medium: 3, high: 4 } },
    { id: 'running', name: 'Running', caloriesPerMinute: { low: 8, medium: 12, high: 16 } },
    { id: 'cycling', name: 'Cycling', caloriesPerMinute: { low: 6, medium: 10, high: 14 } },
    { id: 'swimming', name: 'Swimming', caloriesPerMinute: { low: 7, medium: 11, high: 15 } },
    { id: 'walking', name: 'Walking', caloriesPerMinute: { low: 3, medium: 4, high: 5 } },
  ],
  
  // Meal Types
  MEAL_TYPES: [
    { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: '☀️' },
    { id: 'dinner', name: 'Dinner', icon: '🌙' },
    { id: 'snack', name: 'Snack', icon: '🍎' },
  ],
  
  // Food Categories
  FOOD_CATEGORIES: [
    { id: 'vietnamese', name: 'Vietnamese Food', icon: '🇻🇳' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'grains', name: 'Grains', icon: '🌾' },
    { id: 'protein', name: 'Protein', icon: '🥩' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
  ],
  
  // Notification Settings
  NOTIFICATIONS: {
    MEAL_REMINDERS: {
      BREAKFAST: { hour: 8, minute: 0 },
      LUNCH: { hour: 12, minute: 0 },
      DINNER: { hour: 18, minute: 0 },
    },
    WATER_REMINDERS: {
      INTERVAL: 2, // hours
      START_HOUR: 8,
      END_HOUR: 22,
    },
  },
  
  // Chart Configuration
  CHARTS: {
    COLORS: ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'],
    ANIMATION_DURATION: 1000,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    USER_TOKEN: 'user_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    LANGUAGE: 'language',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    PREMIUM_STATUS: 'premium_status',
    SETTINGS: 'settings',
  },
} as const;