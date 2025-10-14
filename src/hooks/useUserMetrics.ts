import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserStore } from '@/store/userStore';
import { useAuth } from './useAuth';
import { 
  BMICalculator, 
  BMRCalculator, 
  TDEECalculator, 
  CalorieGoalCalculator, 
  MacroCalculator,
  WaterIntakeCalculator,
  UserMetrics 
} from '@/utils/calculations';
import { DateUtils } from '@/utils/dateUtils';
import { AnalyticsService } from '@/services/analytics/analyticsService';

export interface UseUserMetricsReturn {
  // Basic metrics
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: 'male' | 'female' | null;
  activityLevel: keyof typeof import('@/constants/config').Config.ACTIVITY_LEVELS | null;
  goal: keyof typeof import('@/constants/config').Config.GOALS | null;
  
  // Calculated metrics
  bmi: number | null;
  bmiCategory: string | null;
  bmiColor: string | null;
  bmr: number | null;
  tdee: number | null;
  calorieGoal: number | null;
  macroGoals: {
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  waterGoal: number | null;
  idealWeightRange: {
    min: number;
    max: number;
  } | null;
  
  // Progress tracking
  currentWeight: number | null;
  targetWeight: number | null;
  weightProgress: {
    lost: number;
    remaining: number;
    percentage: number;
  } | null;
  
  // Daily progress
  dailyProgress: any;
  todayCalories: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  todayWater: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  todayExercise: {
    minutes: number;
    goal: number;
    caloriesBurned: number;
  };
  
  // Actions
  updateMetrics: (metrics: Partial<UserMetrics>) => Promise<void>;
  logWeight: (weight: number, notes?: string) => Promise<void>;
  logWater: (amount: number) => Promise<void>;
  logExercise: (data: {
    type: string;
    name: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    notes?: string;
  }) => Promise<void>;
  
  // Utilities
  isMetricsComplete: boolean;
  getHealthStatus: () => string;
  getWeightTrend: () => 'gaining' | 'losing' | 'stable' | 'unknown';
  getMotivationalMessage: () => string;
  refreshData: () => Promise<void>;
}

export const useUserMetrics = (): UseUserMetricsReturn => {
  const { user, isPremium } = useAuth();
  const {
    profile,
    dailyProgress,
    weightLogs,
    waterLogs,
    exerciseLogs,
    fetchProfile,
    updateProfile,
    logWeight: storeLogWeight,
    logWater: storeLogWater,
    logExercise: storeLogExercise,
    fetchDailyProgress,
    fetchWeightLogs,
    fetchWaterLogs,
    fetchExerciseLogs,
  } = useUserStore();

  const [isLoading, setIsLoading] = useState(false);

  // Extract basic metrics from profile
  const weight = profile?.weight || null;
  const height = profile?.height || null;
  const age = profile?.dateOfBirth 
    ? DateUtils.getAge(new Date(profile.dateOfBirth))
    : null;
  const gender = profile?.gender || null;
  const activityLevel = profile?.activityLevel || null;
  const goal = profile?.goal || null;
  const targetWeight = profile?.targetWeight || null;

  // Calculate derived metrics
  const bmi = useMemo(() => {
    if (!weight || !height) return null;
    return BMICalculator.calculate(weight, height);
  }, [weight, height]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    return BMICalculator.getCategory(bmi);
  }, [bmi]);

  const bmiColor = useMemo(() => {
    if (!bmi) return null;
    return BMICalculator.getCategoryColor(bmi);
  }, [bmi]);

  const bmr = useMemo(() => {
    if (!weight || !height || !age || !gender) return null;
    return BMRCalculator.calculate({ weight, height, age, gender });
  }, [weight, height, age, gender]);

  const tdee = useMemo(() => {
    if (!weight || !height || !age || !gender || !activityLevel) return null;
    return TDEECalculator.calculate({ weight, height, age, gender, activityLevel, goal: goal || 'MAINTAIN_WEIGHT' });
  }, [weight, height, age, gender, activityLevel, goal]);

  const calorieGoal = useMemo(() => {
    if (!weight || !height || !age || !gender || !activityLevel || !goal) return null;
    return CalorieGoalCalculator.calculate({ weight, height, age, gender, activityLevel, goal });
  }, [weight, height, age, gender, activityLevel, goal]);

  const macroGoals = useMemo(() => {
    if (!calorieGoal) return null;
    return MacroCalculator.calculate(calorieGoal);
  }, [calorieGoal]);

  const waterGoal = useMemo(() => {
    if (!weight || !activityLevel) return null;
    return WaterIntakeCalculator.calculate(weight, activityLevel);
  }, [weight, activityLevel]);

  const idealWeightRange = useMemo(() => {
    if (!height) return null;
    return BMICalculator.getIdealWeightRange(height);
  }, [height]);

  // Current weight from latest weight log
  const currentWeight = useMemo(() => {
    if (weightLogs.length === 0) return weight;
    return weightLogs[0].weight;
  }, [weightLogs, weight]);

  // Weight progress calculation
  const weightProgress = useMemo(() => {
    if (!currentWeight || !targetWeight || !weight) return null;
    
    const totalToLose = Math.abs(weight - targetWeight);
    const lost = Math.abs(weight - currentWeight);
    const remaining = Math.abs(currentWeight - targetWeight);
    const percentage = totalToLose > 0 ? (lost / totalToLose) * 100 : 0;
    
    return {
      lost,
      remaining,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  }, [currentWeight, targetWeight, weight]);

  // Today's progress calculations
  const todayCalories = useMemo(() => {
    const consumed = dailyProgress?.calories.consumed || 0;
    const goal = dailyProgress?.calories.goal || calorieGoal || 2000;
    const remaining = Math.max(0, goal - consumed);
    const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
    
    return { consumed, goal, remaining, percentage };
  }, [dailyProgress, calorieGoal]);

  const todayWater = useMemo(() => {
    const consumed = dailyProgress?.water.consumed || 0;
    const goal = dailyProgress?.water.goal || waterGoal || 2000;
    const remaining = Math.max(0, goal - consumed);
    const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
    
    return { consumed, goal, remaining, percentage };
  }, [dailyProgress, waterGoal]);

  const todayExercise = useMemo(() => {
    const minutes = dailyProgress?.exercise.minutes || 0;
    const goal = 30; // Default 30 minutes
    const caloriesBurned = dailyProgress?.exercise.caloriesBurned || 0;
    
    return { minutes, goal, caloriesBurned };
  }, [dailyProgress]);

  // Check if metrics are complete
  const isMetricsComplete = useMemo(() => {
    return !!(weight && height && age && gender && activityLevel && goal);
  }, [weight, height, age, gender, activityLevel, goal]);

  // Update metrics
  const updateMetrics = useCallback(async (metrics: Partial<UserMetrics>) => {
    try {
      setIsLoading(true);
      
      const updateData: any = {};
      
      if (metrics.weight) updateData.weight = metrics.weight;
      if (metrics.height) updateData.height = metrics.height;
      if (metrics.gender) updateData.gender = metrics.gender;
      if (metrics.activityLevel) updateData.activityLevel = metrics.activityLevel;
      if (metrics.goal) updateData.goal = metrics.goal;
      
      await updateProfile(updateData);
      
      // Track analytics
      AnalyticsService.trackEvent('user_metrics_updated', {
        fields_updated: Object.keys(updateData),
        is_complete: isMetricsComplete,
      });
      
    } catch (error) {
      console.error('Failed to update metrics:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateProfile, isMetricsComplete]);

  // Log weight
  const logWeight = useCallback(async (weight: number, notes?: string) => {
    try {
      await storeLogWeight({ weight, notes });
      
      // Update profile weight if this is the latest entry
      if (!profile?.weight || weight !== profile.weight) {
        await updateProfile({ weight });
      }
      
      // Track analytics
      const newBMI = height ? BMICalculator.calculate(weight, height) : null;
      if (newBMI) {
        AnalyticsService.trackWeightLog(weight, newBMI);
      }
      
    } catch (error) {
      console.error('Failed to log weight:', error);
      throw error;
    }
  }, [storeLogWeight, updateProfile, profile, height]);

  // Log water
  const logWater = useCallback(async (amount: number) => {
    try {
      await storeLogWater(amount);
      
      // Calculate total for today
      const today = DateUtils.formatDateKey(new Date());
      const todayLogs = waterLogs.filter(log => 
        DateUtils.formatDateKey(new Date(log.loggedAt)) === today
      );
      const totalToday = todayLogs.reduce((sum, log) => sum + log.amount, 0) + amount;
      
      // Track analytics
      AnalyticsService.trackWaterIntake(amount, totalToday);
      
    } catch (error) {
      console.error('Failed to log water:', error);
      throw error;
    }
  }, [storeLogWater, waterLogs]);

  // Log exercise
  const logExercise = useCallback(async (data: {
    type: string;
    name: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    notes?: string;
  }) => {
    try {
      await storeLogExercise(data);
      
      // Track analytics
      AnalyticsService.trackExercise(
        data.type,
        data.duration,
        data.intensity,
        0 // calories will be calculated by the API
      );
      
    } catch (error) {
      console.error('Failed to log exercise:', error);
      throw error;
    }
  }, [storeLogExercise]);

  // Get health status
  const getHealthStatus = useCallback((): string => {
    if (!bmi) return 'Chưa có thông tin';
    
    const category = BMICalculator.getCategory(bmi);
    const statusMap = {
      UNDERWEIGHT: 'Thiếu cân',
      NORMAL: 'Bình thường',
      OVERWEIGHT: 'Thừa cân',
      OBESE: 'Béo phì',
    };
    
    return statusMap[category] || 'Không xác định';
  }, [bmi]);

  // Get weight trend
  const getWeightTrend = useCallback((): 'gaining' | 'losing' | 'stable' | 'unknown' => {
    if (weightLogs.length < 2) return 'unknown';
    
    const recent = weightLogs.slice(0, 3);
    const weights = recent.map(log => log.weight);
    
    const trend = weights[0] - weights[weights.length - 1];
    
    if (Math.abs(trend) < 0.5) return 'stable';
    return trend > 0 ? 'gaining' : 'losing';
  }, [weightLogs]);

  // Get motivational message
  const getMotivationalMessage = useCallback((): string => {
    if (!isMetricsComplete) {
      return 'Hãy hoàn thiện thông tin cá nhân để nhận được lời khuyên tốt nhất!';
    }
    
    const caloriePercentage = todayCalories.percentage;
    const waterPercentage = todayWater.percentage;
    const exerciseMinutes = todayExercise.minutes;
    
    if (caloriePercentage >= 90 && caloriePercentage <= 110 && waterPercentage >= 80 && exerciseMinutes >= 30) {
      return 'Tuyệt vời! Bạn đang có một ngày hoàn hảo! 🎉';
    } else if (caloriePercentage >= 80 && waterPercentage >= 60) {
      return 'Bạn đang làm rất tốt! Hãy tiếp tục duy trì! 💪';
    } else if (waterPercentage < 50) {
      return 'Đừng quên uống nước nhé! Cơ thể bạn cần được hydrat hóa. 💧';
    } else if (exerciseMinutes < 15) {
      return 'Hãy dành chút thời gian để vận động hôm nay! 🏃‍♂️';
    } else {
      return 'Mỗi bước nhỏ đều quan trọng. Hãy tiếp tục cố gắng! ✨';
    }
  }, [isMetricsComplete, todayCalories, todayWater, todayExercise]);

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const today = DateUtils.formatDateKey(new Date());
      
      await Promise.all([
        fetchProfile(),
        fetchDailyProgress(today),
        fetchWeightLogs({ limit: 10 }),
        fetchWaterLogs(today),
        fetchExerciseLogs({ date: today }),
      ]);
      
    } catch (error) {
      console.error('Failed to refresh user metrics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, fetchDailyProgress, fetchWeightLogs, fetchWaterLogs, fetchExerciseLogs]);

  // Initialize data on mount
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  return {
    // Basic metrics
    weight,
    height,
    age,
    gender,
    activityLevel,
    goal,
    
    // Calculated metrics
    bmi,
    bmiCategory,
    bmiColor,
    bmr,
    tdee,
    calorieGoal,
    macroGoals,
    waterGoal,
    idealWeightRange,
    
    // Progress tracking
    currentWeight,
    targetWeight,
    weightProgress,
    
    // Daily progress
    dailyProgress,
    todayCalories,
    todayWater,
    todayExercise,
    
    // Actions
    updateMetrics,
    logWeight,
    logWater,
    logExercise,
    
    // Utilities
    isMetricsComplete,
    getHealthStatus,
    getWeightTrend,
    getMotivationalMessage,
    refreshData,
  };
};

export default useUserMetrics;