export type Gender = 'male' | 'female' | 'other';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary'|'light'|'moderate'|'active'|'very_active';

export function calculateBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obesity';
  return { bmi: Number(bmi.toFixed(1)), category };
}

export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, ageYears: number) {
  // Mifflin-St Jeor
  if (gender === 'male') return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5);
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161);
}

export function activityMultiplier(level: ActivityLevel) {
  switch (level) {
    case 'sedentary': return 1.2;
    case 'light': return 1.375;
    case 'moderate': return 1.55;
    case 'active': return 1.725;
    case 'very_active': return 1.9;
    default: return 1.375;
  }
}

export function calculateTDEE(bmr: number, level: ActivityLevel) {
  return Math.round(bmr * activityMultiplier(level));
}

export function calorieTarget(tdee: number, goal: Goal) {
  if (goal === 'lose') return Math.max(1200, Math.round(tdee - 500));
  if (goal === 'gain') return Math.round(tdee + 300);
  return tdee;
}

export function macroDistribution(calories: number) {
  // 40/30/30 carbs/protein/fat
  const carbsCalories = Math.round(calories * 0.4);
  const proteinCalories = Math.round(calories * 0.3);
  const fatCalories = Math.round(calories * 0.3);
  return {
    carbsG: Math.round(carbsCalories / 4),
    proteinG: Math.round(proteinCalories / 4),
    fatG: Math.round(fatCalories / 9)
  };
}

export function waterRecommendation(weightKg: number) {
  // Simple: 35 ml per kg
  return Math.round(weightKg * 35);
}
