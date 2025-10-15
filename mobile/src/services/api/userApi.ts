import apiClient from './apiClient';
import { User, ApiResponse } from '@types';

export const userApi = {
  /**
   * Complete onboarding
   */
  completeOnboarding: async (data: {
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    height: number;
    weight: number;
    goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle';
    activityLevel: string;
    dietaryPreferences?: string[];
    allergies?: Array<{ name: string; severity?: string }>;
  }): Promise<ApiResponse<{
    bmi: number;
    bmr: number;
    tdee: number;
    dailyCalorieGoal: number;
    macros: { protein: number; carbs: number; fats: number };
  }>> => {
    return await apiClient.post('/user/onboarding', data);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return await apiClient.put('/user/profile', data);
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<ApiResponse<{
    streakCount: number;
    totalMealsLogged: number;
    totalWaterLogs: number;
    totalExercises: number;
    totalPosts: number;
    followingCount: number;
    followersCount: number;
    achievementsCount: number;
    totalPoints: number;
  }>> => {
    return await apiClient.get('/user/stats');
  },

  /**
   * Get dietary preferences and allergies
   */
  getPreferences: async (): Promise<ApiResponse<{
    preferences: string[];
    allergies: Array<{ allergen: string; severity: string }>;
  }>> => {
    return await apiClient.get('/user/preferences');
  },

  /**
   * Update dietary preferences
   */
  updatePreferences: async (data: {
    preferences: string[];
    allergies: Array<{ name: string; severity?: string }>;
  }): Promise<ApiResponse> => {
    return await apiClient.put('/user/preferences', data);
  },
};

export default userApi;
