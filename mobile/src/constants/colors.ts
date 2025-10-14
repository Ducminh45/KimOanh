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
  
  // Semantic Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Background Colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  
  // Nutrition Colors
  protein: '#E91E63',
  carbs: '#2196F3',
  fats: '#FF9800',
  fiber: '#9C27B0',
  calories: '#4CAF50',
  
  // Meal Type Colors
  breakfast: '#FFA726',
  lunch: '#66BB6A',
  dinner: '#5C6BC0',
  snack: '#EF5350',
  
  // Chart Colors
  chart1: '#4CAF50',
  chart2: '#2196F3',
  chart3: '#FF9800',
  chart4: '#9C27B0',
  chart5: '#F44336',
  
  // Status Colors
  online: '#4CAF50',
  offline: '#9E9E9E',
  pending: '#FF9800',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Shadows
  shadow: '#000000',
};

export const DarkColors = {
  ...Colors,
  
  // Background Colors (Dark Mode)
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  
  // Text Colors (Dark Mode)
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  
  // Adjust overlays
  overlay: 'rgba(255, 255, 255, 0.1)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  overlayDark: 'rgba(255, 255, 255, 0.2)',
};

export default Colors;
