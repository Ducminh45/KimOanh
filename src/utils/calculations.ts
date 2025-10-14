import { Config } from '@/constants/config';

export interface UserMetrics {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: keyof typeof Config.ACTIVITY_LEVELS;
  goal: keyof typeof Config.GOALS;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
  sugar?: number; // g
  sodium?: number; // mg
}

export class BMICalculator {
  static calculate(weight: number, height: number): number {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  static getCategory(bmi: number): keyof typeof Config.BMI_CATEGORIES {
    if (bmi < 18.5) return 'UNDERWEIGHT';
    if (bmi < 25) return 'NORMAL';
    if (bmi < 30) return 'OVERWEIGHT';
    return 'OBESE';
  }

  static getCategoryColor(bmi: number): string {
    const category = this.getCategory(bmi);
    return Config.BMI_CATEGORIES[category].color;
  }

  static getIdealWeightRange(height: number): { min: number; max: number } {
    const heightInMeters = height / 100;
    const minBMI = 18.5;
    const maxBMI = 24.9;
    
    return {
      min: Math.round(minBMI * heightInMeters * heightInMeters),
      max: Math.round(maxBMI * heightInMeters * heightInMeters),
    };
  }
}

export class BMRCalculator {
  // Mifflin-St Jeor Equation
  static calculate(metrics: Pick<UserMetrics, 'weight' | 'height' | 'age' | 'gender'>): number {
    const { weight, height, age, gender } = metrics;
    
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    
    return Math.round(bmr);
  }
}

export class TDEECalculator {
  static calculate(metrics: UserMetrics): number {
    const bmr = BMRCalculator.calculate(metrics);
    const activityMultiplier = Config.ACTIVITY_LEVELS[metrics.activityLevel].multiplier;
    return Math.round(bmr * activityMultiplier);
  }
}

export class CalorieGoalCalculator {
  static calculate(metrics: UserMetrics): number {
    const tdee = TDEECalculator.calculate(metrics);
    const goalAdjustment = Config.GOALS[metrics.goal].calorieAdjustment;
    return Math.round(tdee + goalAdjustment);
  }
}

export class MacroCalculator {
  static calculate(calorieGoal: number): { protein: number; carbs: number; fat: number } {
    const proteinCalories = calorieGoal * Config.MACRO_DISTRIBUTION.PROTEIN;
    const carbsCalories = calorieGoal * Config.MACRO_DISTRIBUTION.CARBS;
    const fatCalories = calorieGoal * Config.MACRO_DISTRIBUTION.FAT;
    
    return {
      protein: Math.round(proteinCalories / 4), // 4 calories per gram
      carbs: Math.round(carbsCalories / 4), // 4 calories per gram
      fat: Math.round(fatCalories / 9), // 9 calories per gram
    };
  }
}

export class WaterIntakeCalculator {
  static calculate(weight: number, activityLevel: keyof typeof Config.ACTIVITY_LEVELS): number {
    // Base calculation: 35ml per kg of body weight
    let waterNeeded = weight * 35;
    
    // Adjust for activity level
    const activityMultiplier = Config.ACTIVITY_LEVELS[activityLevel].multiplier;
    if (activityMultiplier > 1.5) {
      waterNeeded *= 1.2; // 20% more for active people
    } else if (activityMultiplier > 1.7) {
      waterNeeded *= 1.4; // 40% more for very active people
    }
    
    return Math.round(waterNeeded);
  }
}

export class ExerciseCalculator {
  static calculateCaloriesBurned(
    exerciseType: string,
    duration: number, // minutes
    intensity: 'low' | 'medium' | 'high',
    weight: number // kg
  ): number {
    const exercise = Config.EXERCISE_TYPES.find(e => e.id === exerciseType);
    if (!exercise) return 0;
    
    const baseCaloriesPerMinute = exercise.caloriesPerMinute[intensity];
    
    // Adjust for body weight (heavier people burn more calories)
    const weightFactor = weight / 70; // 70kg as reference weight
    
    return Math.round(baseCaloriesPerMinute * duration * weightFactor);
  }
}

export class NutritionCalculator {
  static adjustForServingSize(nutrition: NutritionInfo, servingSize: number): NutritionInfo {
    const factor = servingSize / Config.DEFAULT_SERVING_SIZE;
    
    return {
      calories: Math.round(nutrition.calories * factor),
      protein: Math.round(nutrition.protein * factor * 10) / 10,
      carbs: Math.round(nutrition.carbs * factor * 10) / 10,
      fat: Math.round(nutrition.fat * factor * 10) / 10,
      fiber: nutrition.fiber ? Math.round(nutrition.fiber * factor * 10) / 10 : undefined,
      sugar: nutrition.sugar ? Math.round(nutrition.sugar * factor * 10) / 10 : undefined,
      sodium: nutrition.sodium ? Math.round(nutrition.sodium * factor) : undefined,
    };
  }

  static calculateMacroPercentages(nutrition: NutritionInfo): { protein: number; carbs: number; fat: number } {
    const totalCalories = nutrition.calories;
    if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    const proteinCalories = nutrition.protein * 4;
    const carbsCalories = nutrition.carbs * 4;
    const fatCalories = nutrition.fat * 9;
    
    return {
      protein: Math.round((proteinCalories / totalCalories) * 100),
      carbs: Math.round((carbsCalories / totalCalories) * 100),
      fat: Math.round((fatCalories / totalCalories) * 100),
    };
  }

  static sumNutrition(nutritionArray: NutritionInfo[]): NutritionInfo {
    return nutritionArray.reduce(
      (sum, nutrition) => ({
        calories: sum.calories + nutrition.calories,
        protein: sum.protein + nutrition.protein,
        carbs: sum.carbs + nutrition.carbs,
        fat: sum.fat + nutrition.fat,
        fiber: (sum.fiber || 0) + (nutrition.fiber || 0),
        sugar: (sum.sugar || 0) + (nutrition.sugar || 0),
        sodium: (sum.sodium || 0) + (nutrition.sodium || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  }
}

export class ProgressCalculator {
  static calculateWeightLossRate(
    currentWeight: number,
    goalWeight: number,
    calorieDeficit: number
  ): { weeksToGoal: number; expectedLossPerWeek: number } {
    const weightDifference = Math.abs(currentWeight - goalWeight);
    const caloriesPerKg = 7700; // Approximate calories in 1kg of fat
    
    const expectedLossPerWeek = (calorieDeficit * 7) / caloriesPerKg;
    const weeksToGoal = Math.ceil(weightDifference / expectedLossPerWeek);
    
    return {
      weeksToGoal,
      expectedLossPerWeek: Math.round(expectedLossPerWeek * 100) / 100,
    };
  }

  static calculateStreakDays(dates: Date[]): number {
    if (dates.length === 0) return 0;
    
    const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const date of sortedDates) {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }
}

export class ScoreCalculator {
  static calculateDailyScore(data: {
    caloriesConsumed: number;
    calorieGoal: number;
    waterConsumed: number;
    waterGoal: number;
    exerciseMinutes: number;
    mealsLogged: number;
  }): number {
    let score = 0;
    
    // Calorie goal adherence (40 points max)
    const calorieRatio = data.caloriesConsumed / data.calorieGoal;
    if (calorieRatio >= 0.9 && calorieRatio <= 1.1) {
      score += 40;
    } else if (calorieRatio >= 0.8 && calorieRatio <= 1.2) {
      score += 30;
    } else if (calorieRatio >= 0.7 && calorieRatio <= 1.3) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Water intake (20 points max)
    const waterRatio = data.waterConsumed / data.waterGoal;
    score += Math.min(20, Math.round(waterRatio * 20));
    
    // Exercise (20 points max)
    score += Math.min(20, Math.round((data.exerciseMinutes / 30) * 20));
    
    // Meal logging (20 points max)
    score += Math.min(20, data.mealsLogged * 5);
    
    return Math.min(100, score);
  }
}

export class AchievementCalculator {
  static checkAchievements(userStats: {
    totalScans: number;
    streakDays: number;
    totalExerciseMinutes: number;
    totalWaterConsumed: number;
    daysActive: number;
  }): string[] {
    const achievements: string[] = [];
    
    // Scanning achievements
    if (userStats.totalScans >= 1) achievements.push('first_scan');
    if (userStats.totalScans >= 10) achievements.push('scanner_novice');
    if (userStats.totalScans >= 50) achievements.push('scanner_expert');
    if (userStats.totalScans >= 100) achievements.push('scanner_master');
    
    // Streak achievements
    if (userStats.streakDays >= 3) achievements.push('three_day_streak');
    if (userStats.streakDays >= 7) achievements.push('week_warrior');
    if (userStats.streakDays >= 30) achievements.push('month_master');
    if (userStats.streakDays >= 100) achievements.push('century_streak');
    
    // Exercise achievements
    if (userStats.totalExerciseMinutes >= 30) achievements.push('first_workout');
    if (userStats.totalExerciseMinutes >= 300) achievements.push('fitness_enthusiast');
    if (userStats.totalExerciseMinutes >= 1000) achievements.push('fitness_champion');
    
    // Water achievements
    if (userStats.totalWaterConsumed >= 2000) achievements.push('hydration_hero');
    if (userStats.totalWaterConsumed >= 50000) achievements.push('water_warrior');
    
    // Activity achievements
    if (userStats.daysActive >= 7) achievements.push('week_active');
    if (userStats.daysActive >= 30) achievements.push('month_active');
    if (userStats.daysActive >= 100) achievements.push('dedication_master');
    
    return achievements;
  }
}