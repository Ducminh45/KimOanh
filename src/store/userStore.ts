import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserApi, 
  UserProfile, 
  UserStats, 
  WeightLog, 
  WaterLog, 
  ExerciseLog, 
  Goal, 
  Achievement, 
  DailyProgress 
} from '@/services/api/userApi';
import { ErrorHandler, AppError } from '@/utils/errorHandler';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { DateUtils } from '@/utils/dateUtils';

export interface UserState {
  // Profile
  profile: UserProfile | null;
  stats: UserStats | null;
  achievements: Achievement[];
  goals: Goal[];
  
  // Daily tracking
  dailyProgress: DailyProgress | null;
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  exerciseLogs: ExerciseLog[];
  
  // Progress data
  progressTrends: {
    dates: string[];
    weight: number[];
    calories: number[];
    water: number[];
    exercise: number[];
    streakDays: number[];
  } | null;
  
  // State
  isLoading: boolean;
  error: AppError | null;
  lastSyncDate: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: { uri: string; name: string; type: string }) => Promise<void>;
  
  // Stats & Achievements
  fetchStats: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  
  // Goals
  fetchGoals: () => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'userId' | 'currentValue' | 'isCompleted' | 'completedAt' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Weight tracking
  logWeight: (data: { weight: number; bodyFatPercentage?: number; muscleMass?: number; notes?: string }) => Promise<void>;
  fetchWeightLogs: (params?: { startDate?: string; endDate?: string; limit?: number }) => Promise<void>;
  updateWeightLog: (id: string, data: Partial<WeightLog>) => Promise<void>;
  deleteWeightLog: (id: string) => Promise<void>;
  
  // Water tracking
  logWater: (amount: number) => Promise<void>;
  fetchWaterLogs: (date: string) => Promise<void>;
  updateWaterLog: (id: string, data: Partial<WaterLog>) => Promise<void>;
  deleteWaterLog: (id: string) => Promise<void>;
  
  // Exercise tracking
  logExercise: (data: {
    type: string;
    name: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    caloriesBurned?: number;
    notes?: string;
  }) => Promise<void>;
  fetchExerciseLogs: (params?: { date?: string; startDate?: string; endDate?: string; type?: string }) => Promise<void>;
  updateExerciseLog: (id: string, data: Partial<ExerciseLog>) => Promise<void>;
  deleteExerciseLog: (id: string) => Promise<void>;
  
  // Progress
  fetchDailyProgress: (date: string) => Promise<void>;
  fetchProgressTrends: (period: 'week' | 'month' | '3months') => Promise<void>;
  
  // Settings
  updateNotificationSettings: (settings: UserProfile['notifications']) => Promise<void>;
  updatePrivacySettings: (settings: UserProfile['privacy']) => Promise<void>;
  updateUnits: (units: UserProfile['units']) => Promise<void>;
  
  // Subscription
  getSubscriptionStatus: () => Promise<{ isPremium: boolean; plan?: string; expiresAt?: string; autoRenew: boolean; features: string[] }>;
  updateSubscription: (plan: 'monthly' | 'yearly') => Promise<{ paymentUrl: string; subscriptionId: string }>;
  cancelSubscription: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  syncData: () => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      stats: null,
      achievements: [],
      goals: [],
      dailyProgress: null,
      weightLogs: [],
      waterLogs: [],
      exerciseLogs: [],
      progressTrends: null,
      isLoading: false,
      error: null,
      lastSyncDate: null,

      // Profile actions
      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const profile = await UserApi.getProfile();
          
          set({ 
            profile, 
            isLoading: false,
            lastSyncDate: new Date().toISOString(),
          });

          // Update analytics user properties
          AnalyticsService.setUserProperties({
            age: profile.dateOfBirth ? DateUtils.getAge(new Date(profile.dateOfBirth)) : undefined,
            gender: profile.gender,
            isPremium: profile.isPremium,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const updatedProfile = await UserApi.updateProfile(data);
          
          set({ 
            profile: updatedProfile, 
            isLoading: false,
            lastSyncDate: new Date().toISOString(),
          });

          // Track analytics
          AnalyticsService.trackEvent('user_profile_updated', {
            fields_updated: Object.keys(data),
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      uploadAvatar: async (file) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await UserApi.uploadAvatar(file);
          
          // Update profile with new avatar
          const { profile } = get();
          if (profile) {
            const updatedProfile = { ...profile, avatar: response.avatarUrl };
            set({ profile: updatedProfile, isLoading: false });
          }

          // Track analytics
          AnalyticsService.trackEvent('avatar_uploaded');

        } catch (error) {
          const appError = ErrorHandler.handleImageError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      // Stats & Achievements
      fetchStats: async () => {
        try {
          const stats = await UserApi.getStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
        }
      },

      fetchAchievements: async () => {
        try {
          const achievements = await UserApi.getAchievements();
          set({ achievements });
        } catch (error) {
          console.error('Failed to fetch achievements:', error);
        }
      },

      // Goals
      fetchGoals: async () => {
        try {
          const goals = await UserApi.getGoals();
          set({ goals });
        } catch (error) {
          console.error('Failed to fetch goals:', error);
        }
      },

      createGoal: async (goalData) => {
        try {
          set({ isLoading: true, error: null });
          
          const newGoal = await UserApi.createGoal(goalData);
          
          const { goals } = get();
          set({ 
            goals: [...goals, newGoal], 
            isLoading: false,
          });

          // Track analytics
          AnalyticsService.trackEvent('goal_created', {
            goal_type: newGoal.type,
            target_value: newGoal.targetValue,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      updateGoal: async (id, data) => {
        try {
          const updatedGoal = await UserApi.updateGoal(id, data);
          
          const { goals } = get();
          const updatedGoals = goals.map(goal => 
            goal.id === id ? updatedGoal : goal
          );
          
          set({ goals: updatedGoals });

          // Track analytics
          AnalyticsService.trackEvent('goal_updated', {
            goal_id: id,
            goal_type: updatedGoal.type,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      deleteGoal: async (id) => {
        try {
          await UserApi.deleteGoal(id);
          
          const { goals } = get();
          const filteredGoals = goals.filter(goal => goal.id !== id);
          
          set({ goals: filteredGoals });

          // Track analytics
          AnalyticsService.trackEvent('goal_deleted', { goal_id: id });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Weight tracking
      logWeight: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const weightLog = await UserApi.logWeight(data);
          
          const { weightLogs } = get();
          set({ 
            weightLogs: [weightLog, ...weightLogs].slice(0, 50), // Keep last 50 entries
            isLoading: false,
          });

          // Track analytics
          AnalyticsService.trackWeightLog(data.weight, weightLog.bmi);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      fetchWeightLogs: async (params) => {
        try {
          const weightLogs = await UserApi.getWeightLogs(params);
          set({ weightLogs });
        } catch (error) {
          console.error('Failed to fetch weight logs:', error);
        }
      },

      updateWeightLog: async (id, data) => {
        try {
          const updatedLog = await UserApi.updateWeightLog(id, data);
          
          const { weightLogs } = get();
          const updatedLogs = weightLogs.map(log => 
            log.id === id ? updatedLog : log
          );
          
          set({ weightLogs: updatedLogs });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      deleteWeightLog: async (id) => {
        try {
          await UserApi.deleteWeightLog(id);
          
          const { weightLogs } = get();
          const filteredLogs = weightLogs.filter(log => log.id !== id);
          
          set({ weightLogs: filteredLogs });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Water tracking
      logWater: async (amount) => {
        try {
          const waterLog = await UserApi.logWater({ amount });
          
          const { waterLogs } = get();
          const today = DateUtils.formatDateKey(new Date());
          const todayLogs = waterLogs.filter(log => 
            DateUtils.formatDateKey(new Date(log.loggedAt)) === today
          );
          
          const totalToday = todayLogs.reduce((sum, log) => sum + log.amount, 0) + amount;
          
          set({ 
            waterLogs: [waterLog, ...waterLogs.filter(log => 
              DateUtils.formatDateKey(new Date(log.loggedAt)) !== today
            ), ...todayLogs],
          });

          // Track analytics
          AnalyticsService.trackWaterIntake(amount, totalToday);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      fetchWaterLogs: async (date) => {
        try {
          const waterLogs = await UserApi.getWaterLogs(date);
          set({ waterLogs });
        } catch (error) {
          console.error('Failed to fetch water logs:', error);
        }
      },

      updateWaterLog: async (id, data) => {
        try {
          const updatedLog = await UserApi.updateWaterLog(id, data);
          
          const { waterLogs } = get();
          const updatedLogs = waterLogs.map(log => 
            log.id === id ? updatedLog : log
          );
          
          set({ waterLogs: updatedLogs });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      deleteWaterLog: async (id) => {
        try {
          await UserApi.deleteWaterLog(id);
          
          const { waterLogs } = get();
          const filteredLogs = waterLogs.filter(log => log.id !== id);
          
          set({ waterLogs: filteredLogs });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Exercise tracking
      logExercise: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const exerciseLog = await UserApi.logExercise(data);
          
          const { exerciseLogs } = get();
          set({ 
            exerciseLogs: [exerciseLog, ...exerciseLogs].slice(0, 100), // Keep last 100 entries
            isLoading: false,
          });

          // Track analytics
          AnalyticsService.trackExercise(
            data.type, 
            data.duration, 
            data.intensity, 
            data.caloriesBurned || 0
          );

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      fetchExerciseLogs: async (params) => {
        try {
          const exerciseLogs = await UserApi.getExerciseLogs(params);
          set({ exerciseLogs });
        } catch (error) {
          console.error('Failed to fetch exercise logs:', error);
        }
      },

      updateExerciseLog: async (id, data) => {
        try {
          const updatedLog = await UserApi.updateExerciseLog(id, data);
          
          const { exerciseLogs } = get();
          const updatedLogs = exerciseLogs.map(log => 
            log.id === id ? updatedLog : log
          );
          
          set({ exerciseLogs: updatedLogs });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      deleteExerciseLog: async (id) => {
        try {
          await UserApi.deleteExerciseLog(id);
          
          const { exerciseLogs } = get();
          const filteredLogs = exerciseLogs.filter(log => log.id !== id);
          
          set({ exerciseLogs: filteredLogs });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Progress
      fetchDailyProgress: async (date) => {
        try {
          const dailyProgress = await UserApi.getDailyProgress(date);
          set({ dailyProgress });
        } catch (error) {
          console.error('Failed to fetch daily progress:', error);
        }
      },

      fetchProgressTrends: async (period) => {
        try {
          const progressTrends = await UserApi.getProgressTrends(period);
          set({ progressTrends });
        } catch (error) {
          console.error('Failed to fetch progress trends:', error);
        }
      },

      // Settings
      updateNotificationSettings: async (settings) => {
        try {
          await UserApi.updateNotificationSettings(settings);
          
          const { profile } = get();
          if (profile) {
            set({ 
              profile: { ...profile, notifications: settings },
            });
          }

          // Track analytics
          AnalyticsService.trackSettingsChange('notifications', profile?.notifications, settings);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      updatePrivacySettings: async (settings) => {
        try {
          await UserApi.updatePrivacySettings(settings);
          
          const { profile } = get();
          if (profile) {
            set({ 
              profile: { ...profile, privacy: settings },
            });
          }

          // Track analytics
          AnalyticsService.trackSettingsChange('privacy', profile?.privacy, settings);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      updateUnits: async (units) => {
        try {
          await UserApi.updateUnits(units);
          
          const { profile } = get();
          if (profile) {
            set({ 
              profile: { ...profile, units },
            });
          }

          // Track analytics
          AnalyticsService.trackSettingsChange('units', profile?.units, units);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Subscription
      getSubscriptionStatus: async () => {
        try {
          return await UserApi.getSubscriptionStatus();
        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      updateSubscription: async (plan) => {
        try {
          const response = await UserApi.updateSubscription(plan);
          
          // Track analytics
          AnalyticsService.trackEvent('subscription_initiated', { plan });
          
          return response;
        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      cancelSubscription: async () => {
        try {
          await UserApi.cancelSubscription();
          
          // Update profile premium status
          const { profile } = get();
          if (profile) {
            set({ 
              profile: { ...profile, isPremium: false },
            });
          }

          // Track analytics
          AnalyticsService.trackEvent('subscription_cancelled');

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      syncData: async () => {
        try {
          set({ isLoading: true });
          
          // Sync all user data
          await Promise.all([
            get().fetchProfile(),
            get().fetchStats(),
            get().fetchAchievements(),
            get().fetchGoals(),
            get().fetchDailyProgress(DateUtils.formatDateKey(new Date())),
          ]);

          set({ 
            isLoading: false,
            lastSyncDate: new Date().toISOString(),
          });

        } catch (error) {
          console.error('Failed to sync user data:', error);
          set({ isLoading: false });
        }
      },

      clearUserData: () => {
        set({
          profile: null,
          stats: null,
          achievements: [],
          goals: [],
          dailyProgress: null,
          weightLogs: [],
          waterLogs: [],
          exerciseLogs: [],
          progressTrends: null,
          isLoading: false,
          error: null,
          lastSyncDate: null,
        });
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        stats: state.stats,
        achievements: state.achievements,
        goals: state.goals,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
);

export default useUserStore;