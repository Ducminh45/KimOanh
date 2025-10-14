export const Colors = {
  // Primary Colors
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Secondary Colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',
  
  // Accent Colors
  accent: '#2196F3',
  accentDark: '#1976D2',
  accentLight: '#64B5F6',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#F5F5F5',
  darkGray: '#424242',
  
  // Background Colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  placeholder: '#BDBDBD',
  
  // Nutrition Colors
  calories: '#FF6B6B',
  protein: '#4ECDC4',
  carbs: '#45B7D1',
  fat: '#FFA07A',
  fiber: '#98D8C8',
  
  // BMI Colors
  underweight: '#3498DB',
  normal: '#2ECC71',
  overweight: '#F39C12',
  obese: '#E74C3C',
  
  // Water Tracker
  water: '#3498DB',
  waterLight: '#AED6F1',
  
  // Premium Colors
  premium: '#FFD700',
  premiumDark: '#FFA500',
  
  // Social Colors
  like: '#E91E63',
  comment: '#607D8B',
  share: '#795548',
  
  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Gradients
  gradients: {
    primary: ['#4CAF50', '#81C784'],
    secondary: ['#FF9800', '#FFB74D'],
    accent: ['#2196F3', '#64B5F6'],
    sunset: ['#FF6B6B', '#FFA07A'],
    ocean: ['#3498DB', '#AED6F1'],
    forest: ['#2ECC71', '#98D8C8'],
  },
} as const;

export const DarkColors = {
  ...Colors,
  
  // Background Colors (Dark Mode)
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2D2D2D',
  
  // Text Colors (Dark Mode)
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  placeholder: '#666666',
  
  // Neutral Colors (Dark Mode)
  lightGray: '#2D2D2D',
  darkGray: '#B0B0B0',
} as const;