import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format number with comma separators
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format calories
 */
export const formatCalories = (calories: number): string => {
  return `${Math.round(calories)} kcal`;
};

/**
 * Format macro nutrients (protein, carbs, fats)
 */
export const formatMacro = (grams: number, unit: string = 'g'): string => {
  return `${Math.round(grams)}${unit}`;
};

/**
 * Format weight
 */
export const formatWeight = (kg: number, unit: 'kg' | 'lb' = 'kg'): string => {
  if (unit === 'lb') {
    const lbs = kg * 2.20462;
    return `${Math.round(lbs * 10) / 10} lb`;
  }
  return `${Math.round(kg * 10) / 10} kg`;
};

/**
 * Format height
 */
export const formatHeight = (cm: number, unit: 'cm' | 'ft' = 'cm'): string => {
  if (unit === 'ft') {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(cm)} cm`;
};

/**
 * Format water amount
 */
export const formatWater = (ml: number, unit: 'ml' | 'oz' = 'ml'): string => {
  if (unit === 'oz') {
    const oz = ml / 29.5735;
    return `${Math.round(oz)} oz`;
  }
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)} L`;
  }
  return `${Math.round(ml)} ml`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount: number, currency: 'VND' | 'USD' = 'VND'): string => {
  if (currency === 'VND') {
    return `${formatNumber(amount, 0)}₫`;
  }
  return `$${formatNumber(amount, 2)}`;
};

/**
 * Format date
 */
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    return format(new Date(date), formatStr);
  } catch {
    return '';
  }
};

/**
 * Format date with Vietnamese locale
 */
export const formatDateVi = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    return format(new Date(date), formatStr, { locale: vi });
  } catch {
    return '';
  }
};

/**
 * Format time
 */
export const formatTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'HH:mm');
  } catch {
    return '';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date, useVietnamese: boolean = false): string => {
  try {
    const dateObj = new Date(date);
    
    if (isToday(dateObj)) {
      return useVietnamese ? `Hôm nay ${format(dateObj, 'HH:mm')}` : `Today at ${format(dateObj, 'HH:mm')}`;
    }
    
    if (isYesterday(dateObj)) {
      return useVietnamese ? `Hôm qua ${format(dateObj, 'HH:mm')}` : `Yesterday at ${format(dateObj, 'HH:mm')}`;
    }
    
    if (isThisWeek(dateObj)) {
      return format(dateObj, 'EEEE HH:mm', { locale: useVietnamese ? vi : undefined });
    }
    
    return formatDistanceToNow(dateObj, { 
      addSuffix: true,
      locale: useVietnamese ? vi : undefined,
    });
  } catch {
    return '';
  }
};

/**
 * Format duration in minutes to hours and minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} giờ`;
  }
  return `${hours} giờ ${mins} phút`;
};

/**
 * Format meal type label
 */
export const formatMealType = (mealType: string, vietnamese: boolean = true): string => {
  const labels: { [key: string]: { en: string; vi: string } } = {
    breakfast: { en: 'Breakfast', vi: 'Bữa sáng' },
    lunch: { en: 'Lunch', vi: 'Bữa trưa' },
    dinner: { en: 'Dinner', vi: 'Bữa tối' },
    snack: { en: 'Snack', vi: 'Bữa phụ' },
  };
  
  return vietnamese ? labels[mealType]?.vi || mealType : labels[mealType]?.en || mealType;
};

/**
 * Format goal label
 */
export const formatGoal = (goal: string, vietnamese: boolean = true): string => {
  const labels: { [key: string]: { en: string; vi: string } } = {
    lose_weight: { en: 'Lose Weight', vi: 'Giảm cân' },
    gain_weight: { en: 'Gain Weight', vi: 'Tăng cân' },
    maintain_weight: { en: 'Maintain Weight', vi: 'Duy trì cân nặng' },
    build_muscle: { en: 'Build Muscle', vi: 'Tăng cơ' },
  };
  
  return vietnamese ? labels[goal]?.vi || goal : labels[goal]?.en || goal;
};

/**
 * Format activity level label
 */
export const formatActivityLevel = (level: string, vietnamese: boolean = true): string => {
  const labels: { [key: string]: { en: string; vi: string } } = {
    sedentary: { en: 'Sedentary', vi: 'Ít vận động' },
    lightly_active: { en: 'Lightly Active', vi: 'Vận động nhẹ' },
    moderately_active: { en: 'Moderately Active', vi: 'Vận động vừa' },
    very_active: { en: 'Very Active', vi: 'Vận động nhiều' },
    extremely_active: { en: 'Extremely Active', vi: 'Vận động rất nhiều' },
  };
  
  return vietnamese ? labels[level]?.vi || level : labels[level]?.en || level;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Format Vietnamese phone number: 0xxx xxx xxx
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  return phone;
};

/**
 * Format serving size
 */
export const formatServingSize = (size: number, unit: string): string => {
  if (size === 1 && !unit.includes('g') && !unit.includes('ml')) {
    return `1 ${unit}`;
  }
  return `${size} ${unit}`;
};

/**
 * Format confidence score
 */
export const formatConfidence = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};

/**
 * Format BMI category with color
 */
export const formatBMICategory = (bmi: number): {
  label: string;
  labelVi: string;
  color: string;
} => {
  if (bmi < 18.5) {
    return { label: 'Underweight', labelVi: 'Thiếu cân', color: '#2196F3' };
  } else if (bmi < 25) {
    return { label: 'Normal', labelVi: 'Bình thường', color: '#4CAF50' };
  } else if (bmi < 30) {
    return { label: 'Overweight', labelVi: 'Thừa cân', color: '#FF9800' };
  } else {
    return { label: 'Obese', labelVi: 'Béo phì', color: '#F44336' };
  }
};

export default {
  formatNumber,
  formatCalories,
  formatMacro,
  formatWeight,
  formatHeight,
  formatWater,
  formatPercentage,
  formatCurrency,
  formatDate,
  formatDateVi,
  formatTime,
  formatRelativeTime,
  formatDuration,
  formatMealType,
  formatGoal,
  formatActivityLevel,
  truncateText,
  formatPhoneNumber,
  formatServingSize,
  formatConfidence,
  formatBMICategory,
};
