export const API_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://api.nutriscanvn.com/api';

export const APP_NAME = 'NutriScanVN';
export const APP_VERSION = '1.0.0';

export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Should be from env in production

export const FREE_SCAN_LIMIT = 3;
export const PREMIUM_MONTHLY_PRICE = 99000; // VND
export const PREMIUM_YEARLY_PRICE = 990000; // VND

export const DEFAULT_WATER_GOAL = 2000; // ml
export const DEFAULT_FIBER_GOAL = 25; // g

export const ACTIVITY_LEVELS = {
  sedentary: {
    label: 'Sedentary',
    labelVi: 'Ít vận động',
    multiplier: 1.2,
    description: 'Little or no exercise',
  },
  lightly_active: {
    label: 'Lightly Active',
    labelVi: 'Vận động nhẹ',
    multiplier: 1.375,
    description: 'Exercise 1-3 days/week',
  },
  moderately_active: {
    label: 'Moderately Active',
    labelVi: 'Vận động vừa',
    multiplier: 1.55,
    description: 'Exercise 3-5 days/week',
  },
  very_active: {
    label: 'Very Active',
    labelVi: 'Vận động nhiều',
    multiplier: 1.725,
    description: 'Exercise 6-7 days/week',
  },
  extremely_active: {
    label: 'Extremely Active',
    labelVi: 'Vận động rất nhiều',
    multiplier: 1.9,
    description: 'Very hard exercise daily',
  },
};

export const GOALS = {
  lose_weight: {
    label: 'Lose Weight',
    labelVi: 'Giảm cân',
    icon: '📉',
    calorieAdjustment: -500,
  },
  maintain_weight: {
    label: 'Maintain Weight',
    labelVi: 'Duy trì cân nặng',
    icon: '⚖️',
    calorieAdjustment: 0,
  },
  gain_weight: {
    label: 'Gain Weight',
    labelVi: 'Tăng cân',
    icon: '📈',
    calorieAdjustment: 500,
  },
  build_muscle: {
    label: 'Build Muscle',
    labelVi: 'Tăng cơ',
    icon: '💪',
    calorieAdjustment: 300,
  },
};

export const MEAL_TYPES = {
  breakfast: { label: 'Breakfast', labelVi: 'Bữa sáng', icon: '🌅', color: '#FFA726' },
  lunch: { label: 'Lunch', labelVi: 'Bữa trưa', icon: '☀️', color: '#66BB6A' },
  dinner: { label: 'Dinner', labelVi: 'Bữa tối', icon: '🌙', color: '#5C6BC0' },
  snack: { label: 'Snack', labelVi: 'Bữa phụ', icon: '🍎', color: '#EF5350' },
};

export const EXERCISE_TYPES = [
  { value: 'running', label: 'Running', labelVi: 'Chạy bộ', icon: '🏃' },
  { value: 'walking', label: 'Walking', labelVi: 'Đi bộ', icon: '🚶' },
  { value: 'cycling', label: 'Cycling', labelVi: 'Đạp xe', icon: '🚴' },
  { value: 'swimming', label: 'Swimming', labelVi: 'Bơi lội', icon: '🏊' },
  { value: 'yoga', label: 'Yoga', labelVi: 'Yoga', icon: '🧘' },
  { value: 'gym', label: 'Gym', labelVi: 'Tập gym', icon: '🏋️' },
  { value: 'sports', label: 'Sports', labelVi: 'Thể thao', icon: '⚽' },
  { value: 'other', label: 'Other', labelVi: 'Khác', icon: '💪' },
];

export const DIETARY_PREFERENCES = [
  { value: 'vegetarian', label: 'Vegetarian', labelVi: 'Ăn chay' },
  { value: 'vegan', label: 'Vegan', labelVi: 'Thuần chay' },
  { value: 'keto', label: 'Keto', labelVi: 'Keto' },
  { value: 'paleo', label: 'Paleo', labelVi: 'Paleo' },
  { value: 'low_carb', label: 'Low Carb', labelVi: 'Ít carb' },
  { value: 'high_protein', label: 'High Protein', labelVi: 'Nhiều protein' },
  { value: 'gluten_free', label: 'Gluten Free', labelVi: 'Không gluten' },
  { value: 'dairy_free', label: 'Dairy Free', labelVi: 'Không sữa' },
];

export const COMMON_ALLERGIES = [
  { value: 'peanuts', label: 'Peanuts', labelVi: 'Đậu phộng' },
  { value: 'tree_nuts', label: 'Tree Nuts', labelVi: 'Hạt cây' },
  { value: 'milk', label: 'Milk', labelVi: 'Sữa' },
  { value: 'eggs', label: 'Eggs', labelVi: 'Trứng' },
  { value: 'shellfish', label: 'Shellfish', labelVi: 'Hải sản có vỏ' },
  { value: 'fish', label: 'Fish', labelVi: 'Cá' },
  { value: 'soy', label: 'Soy', labelVi: 'Đậu nành' },
  { value: 'wheat', label: 'Wheat', labelVi: 'Lúa mì' },
  { value: 'gluten', label: 'Gluten', labelVi: 'Gluten' },
];

export const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: 'Underweight', labelVi: 'Thiếu cân', color: '#2196F3' },
  { min: 18.5, max: 24.9, label: 'Normal', labelVi: 'Bình thường', color: '#4CAF50' },
  { min: 25, max: 29.9, label: 'Overweight', labelVi: 'Thừa cân', color: '#FF9800' },
  { min: 30, max: 100, label: 'Obese', labelVi: 'Béo phì', color: '#F44336' },
];

export default {
  API_URL,
  APP_NAME,
  APP_VERSION,
  GEMINI_API_KEY,
  FREE_SCAN_LIMIT,
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_YEARLY_PRICE,
  DEFAULT_WATER_GOAL,
  DEFAULT_FIBER_GOAL,
  ACTIVITY_LEVELS,
  GOALS,
  MEAL_TYPES,
  EXERCISE_TYPES,
  DIETARY_PREFERENCES,
  COMMON_ALLERGIES,
  BMI_CATEGORIES,
};
