/**
 * Nutrition and fitness calculations utility
 */

/**
 * Calculate BMI (Body Mass Index)
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (!weightKg || !heightCm || heightCm === 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi: number): {
  category: string;
  categoryVi: string;
  color: string;
} => {
  if (bmi < 18.5) {
    return { category: 'Underweight', categoryVi: 'Thiếu cân', color: '#2196F3' };
  } else if (bmi < 25) {
    return { category: 'Normal', categoryVi: 'Bình thường', color: '#4CAF50' };
  } else if (bmi < 30) {
    return { category: 'Overweight', categoryVi: 'Thừa cân', color: '#FF9800' };
  } else {
    return { category: 'Obese', categoryVi: 'Béo phì', color: '#F44336' };
  }
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 */
export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number => {
  if (!weightKg || !heightCm || !age) return 0;
  
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  return Math.round(bmr);
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const multipliers: { [key: string]: number } = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };
  
  const multiplier = multipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate daily calorie goal based on TDEE and goal
 */
export const calculateCalorieGoal = (
  tdee: number,
  goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle'
): number => {
  const adjustments: { [key: string]: number } = {
    lose_weight: -500,
    gain_weight: 500,
    maintain_weight: 0,
    build_muscle: 300,
  };
  
  return Math.round(tdee + (adjustments[goal] || 0));
};

/**
 * Calculate macro goals (protein, carbs, fats) in grams
 */
export const calculateMacros = (
  dailyCalories: number,
  goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle'
): { protein: number; carbs: number; fats: number } => {
  let proteinPercent: number, carbsPercent: number, fatsPercent: number;
  
  switch (goal) {
    case 'lose_weight':
      proteinPercent = 0.40; // 40% protein
      carbsPercent = 0.30;   // 30% carbs
      fatsPercent = 0.30;    // 30% fats
      break;
    case 'build_muscle':
      proteinPercent = 0.35; // 35% protein
      carbsPercent = 0.45;   // 45% carbs
      fatsPercent = 0.20;    // 20% fats
      break;
    case 'gain_weight':
      proteinPercent = 0.25; // 25% protein
      carbsPercent = 0.50;   // 50% carbs
      fatsPercent = 0.25;    // 25% fats
      break;
    default: // maintain_weight
      proteinPercent = 0.30; // 30% protein
      carbsPercent = 0.40;   // 40% carbs
      fatsPercent = 0.30;    // 30% fats
  }
  
  const proteinCalories = dailyCalories * proteinPercent;
  const carbsCalories = dailyCalories * carbsPercent;
  const fatsCalories = dailyCalories * fatsPercent;
  
  return {
    protein: Math.round(proteinCalories / 4), // 4 cal/g
    carbs: Math.round(carbsCalories / 4),     // 4 cal/g
    fats: Math.round(fatsCalories / 9),       // 9 cal/g
  };
};

/**
 * Calculate ideal weight range based on height
 */
export const calculateIdealWeightRange = (
  heightCm: number
): { min: number; max: number } => {
  const heightM = heightCm / 100;
  const min = Math.round(18.5 * heightM * heightM);
  const max = Math.round(24.9 * heightM * heightM);
  
  return { min, max };
};

/**
 * Calculate water intake recommendation (ml)
 */
export const calculateWaterGoal = (weightKg: number, activityLevel: string): number => {
  // Base: 30-35ml per kg body weight
  let baseWater = weightKg * 33;
  
  // Adjust for activity level
  const activityAdjustments: { [key: string]: number } = {
    sedentary: 0,
    lightly_active: 250,
    moderately_active: 500,
    very_active: 750,
    extremely_active: 1000,
  };
  
  const adjustment = activityAdjustments[activityLevel] || 0;
  return Math.round(baseWater + adjustment);
};

/**
 * Calculate estimated time to reach goal weight
 */
export const calculateTimeToGoal = (
  currentWeight: number,
  goalWeight: number,
  weeklyWeightChange: number = 0.5 // kg per week
): number => {
  const difference = Math.abs(currentWeight - goalWeight);
  const weeks = Math.ceil(difference / weeklyWeightChange);
  return weeks;
};

/**
 * Calculate calories burned during exercise
 */
export const calculateCaloriesBurned = (
  exerciseType: string,
  durationMinutes: number,
  weightKg: number,
  intensity: 'low' | 'medium' | 'high'
): number => {
  // MET (Metabolic Equivalent of Task) values
  const metValues: { [key: string]: { [key: string]: number } } = {
    running: { low: 6, medium: 9, high: 12 },
    walking: { low: 2.5, medium: 3.5, high: 4.5 },
    cycling: { low: 4, medium: 8, high: 12 },
    swimming: { low: 6, medium: 8, high: 11 },
    yoga: { low: 2, medium: 3, high: 4 },
    gym: { low: 3, medium: 5, high: 8 },
    sports: { low: 4, medium: 6, high: 10 },
    other: { low: 3, medium: 5, high: 8 },
  };
  
  const met = metValues[exerciseType]?.[intensity] || 5;
  // Calories = MET * weight(kg) * duration(hours)
  const caloriesBurned = met * weightKg * (durationMinutes / 60);
  
  return Math.round(caloriesBurned);
};

/**
 * Calculate percentage progress towards goal
 */
export const calculateProgress = (current: number, goal: number): number => {
  if (!goal || goal === 0) return 0;
  const progress = (current / goal) * 100;
  return Math.min(Math.round(progress), 100);
};

/**
 * Calculate macro calories
 */
export const macroToCalories = (macroName: string, grams: number): number => {
  const caloriesPerGram: { [key: string]: number } = {
    protein: 4,
    carbohydrates: 4,
    carbs: 4,
    fats: 9,
    fiber: 0, // Fiber has calories but often not counted
  };
  
  return Math.round((caloriesPerGram[macroName] || 0) * grams);
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate body fat percentage (Navy Method estimation)
 */
export const estimateBodyFatPercentage = (
  gender: 'male' | 'female',
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipCm?: number
): number => {
  if (gender === 'male') {
    const bfp = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    return Math.round(bfp * 10) / 10;
  } else {
    if (!hipCm) return 0;
    const bfp = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    return Math.round(bfp * 10) / 10;
  }
};

export default {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  calculateMacros,
  calculateIdealWeightRange,
  calculateWaterGoal,
  calculateTimeToGoal,
  calculateCaloriesBurned,
  calculateProgress,
  macroToCalories,
  calculateAge,
  estimateBodyFatPercentage,
};
