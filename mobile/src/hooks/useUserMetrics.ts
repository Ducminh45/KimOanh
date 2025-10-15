import { useMemo } from 'react';
import { useAuthStore } from '@store/authStore';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateAge,
  calculateCalorieGoal,
  calculateMacros,
  calculateIdealWeightRange,
  calculateWaterGoal,
  getBMICategory,
} from '@utils/calculations';

/**
 * Hook to calculate user metrics (BMI, BMR, TDEE, etc.)
 */
export const useUserMetrics = () => {
  const { user } = useAuthStore();

  const metrics = useMemo(() => {
    if (!user || !user.height || !user.weight || !user.dateOfBirth) {
      return null;
    }

    const age = calculateAge(user.dateOfBirth);
    const bmi = calculateBMI(user.weight, user.height);
    const bmiCategory = getBMICategory(bmi);
    const bmr = calculateBMR(user.weight, user.height, age, user.gender || 'male');
    const tdee = calculateTDEE(bmr, user.activityLevel || 'moderately_active');
    const calorieGoal = calculateCalorieGoal(tdee, user.goal || 'maintain_weight');
    const macros = calculateMacros(calorieGoal, user.goal || 'maintain_weight');
    const idealWeightRange = calculateIdealWeightRange(user.height);
    const waterGoal = calculateWaterGoal(user.weight, user.activityLevel || 'moderately_active');

    return {
      age,
      bmi,
      bmiCategory: bmiCategory.categoryVi,
      bmiColor: bmiCategory.color,
      bmr,
      tdee,
      calorieGoal,
      proteinGoal: macros.protein,
      carbsGoal: macros.carbs,
      fatsGoal: macros.fats,
      idealWeightMin: idealWeightRange.min,
      idealWeightMax: idealWeightRange.max,
      waterGoal,
    };
  }, [user]);

  return metrics;
};

export default useUserMetrics;
