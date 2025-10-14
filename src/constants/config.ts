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
  API_BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://nutriscanvn-api.herokuapp.com/api',
  
  // Gemini AI Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta',
  
  // FatSecret API Configuration
  FATSECRET_API_KEY: process.env.FATSECRET_API_KEY || 'your-fatsecret-api-key',
  FATSECRET_API_SECRET: process.env.FATSECRET_API_SECRET || 'your-fatsecret-api-secret',
  FATSECRET_API_URL: 'https://platform.fatsecret.com/rest/server.api',
  
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
  APP_BUILD: '1',
  
  // Subscription Configuration
  SUBSCRIPTION_PLANS: {
    FREE: {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'VND',
      scansPerDay: 3,
      features: ['Basic scanning', 'Food database', 'Progress tracking'],
    },
    PREMIUM_MONTHLY: {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: 99000,
      currency: 'VND',
      scansPerDay: -1, // Unlimited
      features: ['Unlimited scanning', 'AI meal planning', 'Recipe system', 'Social features'],
    },
    PREMIUM_YEARLY: {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      price: 990000,
      currency: 'VND',
      scansPerDay: -1, // Unlimited
      features: ['Unlimited scanning', 'AI meal planning', 'Recipe system', 'Social features'],
    },
  },
  
  // Nutrition Configuration
  NUTRITION: {
    MACRO_RATIOS: {
      PROTEIN: 0.3,
      CARBS: 0.4,
      FAT: 0.3,
    },
    WATER_GOAL_ML: 2000,
    FIBER_GOAL_G: 25,
    SODIUM_LIMIT_MG: 2300,
  },
  
  // Exercise Configuration
  EXERCISE_TYPES: [
    { id: 'walking', name: 'Đi bộ', caloriesPerMinute: 4 },
    { id: 'running', name: 'Chạy bộ', caloriesPerMinute: 10 },
    { id: 'cycling', name: 'Đạp xe', caloriesPerMinute: 8 },
    { id: 'swimming', name: 'Bơi lội', caloriesPerMinute: 12 },
    { id: 'yoga', name: 'Yoga', caloriesPerMinute: 3 },
    { id: 'weightlifting', name: 'Tập tạ', caloriesPerMinute: 6 },
  ],
  
  // Vietnamese Food Database
  VIETNAMESE_FOODS: [
    {
      id: 'pho_bo',
      name: 'Phở bò',
      category: 'main_dish',
      calories: 350,
      protein: 20,
      carbs: 35,
      fat: 8,
      fiber: 2,
      serving: '1 tô',
    },
    {
      id: 'banh_mi',
      name: 'Bánh mì',
      category: 'main_dish',
      calories: 280,
      protein: 12,
      carbs: 45,
      fat: 6,
      fiber: 3,
      serving: '1 ổ',
    },
    {
      id: 'com_tam',
      name: 'Cơm tấm',
      category: 'main_dish',
      calories: 420,
      protein: 25,
      carbs: 50,
      fat: 12,
      fiber: 2,
      serving: '1 đĩa',
    },
    {
      id: 'bun_bo_hue',
      name: 'Bún bò Huế',
      category: 'main_dish',
      calories: 380,
      protein: 22,
      carbs: 40,
      fat: 10,
      fiber: 3,
      serving: '1 tô',
    },
    {
      id: 'goi_cuon',
      name: 'Gỏi cuốn',
      category: 'appetizer',
      calories: 120,
      protein: 8,
      carbs: 15,
      fat: 2,
      fiber: 2,
      serving: '2 cuốn',
    },
    {
      id: 'cha_gio',
      name: 'Chả giò',
      category: 'appetizer',
      calories: 180,
      protein: 6,
      carbs: 12,
      fat: 12,
      fiber: 1,
      serving: '3 cái',
    },
    {
      id: 'ca_phe_sua_da',
      name: 'Cà phê sữa đá',
      category: 'beverage',
      calories: 80,
      protein: 2,
      carbs: 12,
      fat: 2,
      fiber: 0,
      serving: '1 ly',
    },
    {
      id: 'tra_da',
      name: 'Trà đá',
      category: 'beverage',
      calories: 5,
      protein: 0,
      carbs: 1,
      fat: 0,
      fiber: 0,
      serving: '1 ly',
    },
    {
      id: 'che_bau',
      name: 'Chè bàu',
      category: 'dessert',
      calories: 200,
      protein: 3,
      carbs: 45,
      fat: 2,
      fiber: 2,
      serving: '1 ly',
    },
    {
      id: 'banh_flan',
      name: 'Bánh flan',
      category: 'dessert',
      calories: 150,
      protein: 6,
      carbs: 20,
      fat: 5,
      fiber: 0,
      serving: '1 miếng',
    },
    {
      id: 'rau_muong_xao',
      name: 'Rau muống xào',
      category: 'vegetable',
      calories: 60,
      protein: 3,
      carbs: 8,
      fat: 2,
      fiber: 3,
      serving: '1 đĩa',
    },
    {
      id: 'canh_chua_ca',
      name: 'Canh chua cá',
      category: 'soup',
      calories: 120,
      protein: 15,
      carbs: 8,
      fat: 3,
      fiber: 2,
      serving: '1 tô',
    },
    {
      id: 'thit_kho_tau',
      name: 'Thịt kho tàu',
      category: 'main_dish',
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      fiber: 1,
      serving: '1 đĩa',
    },
    {
      id: 'ca_kho_to',
      name: 'Cá kho tộ',
      category: 'main_dish',
      calories: 280,
      protein: 25,
      carbs: 10,
      fat: 15,
      fiber: 1,
      serving: '1 đĩa',
    },
    {
      id: 'bun_cha',
      name: 'Bún chả',
      category: 'main_dish',
      calories: 400,
      protein: 30,
      carbs: 45,
      fat: 12,
      fiber: 3,
      serving: '1 tô',
    },
  ],
  
  // Chart Configuration
  CHART_COLORS: [
    '#4CAF50',
    '#2196F3',
    '#FF9800',
    '#9C27B0',
    '#F44336',
    '#00BCD4',
    '#FFC107',
    '#795548',
  ],
  
  // Animation Configuration
  ANIMATION: {
    DURATION_SHORT: 200,
    DURATION_MEDIUM: 300,
    DURATION_LONG: 500,
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
    ONBOARDING_COMPLETED: 'onboarding_completed',
    THEME_MODE: 'theme_mode',
    LANGUAGE: 'language',
    NOTIFICATION_SETTINGS: 'notification_settings',
  },
};
