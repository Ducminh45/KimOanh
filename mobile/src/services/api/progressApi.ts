import apiClient from './apiClient';
import { WaterLog, ExerciseLog, WeightLog, ApiResponse } from '@types';

export const progressApi = {
  /**
   * Log water intake
   */
  logWater: async (amountMl: number): Promise<ApiResponse<WaterLog>> => {
    return await apiClient.post('/progress/water', { amountMl });
  },

  /**
   * Get water logs
   */
  getWaterLogs: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    date: string;
    total_ml: number;
    goal_ml: number;
    progress: number;
    log_count: number;
  }>> => {
    return await apiClient.get('/progress/water', { params });
  },

  /**
   * Log exercise
   */
  logExercise: async (data: {
    exerciseType: string;
    durationMinutes: number;
    intensity: 'low' | 'medium' | 'high';
    notes?: string;
  }): Promise<ApiResponse<ExerciseLog>> => {
    return await apiClient.post('/progress/exercise', data);
  },

  /**
   * Get exercise logs
   */
  getExerciseLogs: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ExerciseLog[]>> => {
    return await apiClient.get('/progress/exercise', { params });
  },

  /**
   * Delete exercise log
   */
  deleteExerciseLog: async (id: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/progress/exercise/${id}`);
  },

  /**
   * Log weight
   */
  logWeight: async (data: {
    weight: number;
    notes?: string;
  }): Promise<ApiResponse<WeightLog>> => {
    return await apiClient.post('/progress/weight', data);
  },

  /**
   * Get weight logs
   */
  getWeightLogs: async (): Promise<ApiResponse<WeightLog[]>> => {
    return await apiClient.get('/progress/weight');
  },

  /**
   * Get progress summary
   */
  getProgressSummary: async (period: 'weekly' | 'monthly' | '90days' = 'weekly'): Promise<ApiResponse<{
    period: string;
    nutrition: any[];
    water: any[];
    exercise: any[];
  }>> => {
    return await apiClient.get('/progress/summary', { params: { period } });
  },
};

export default progressApi;
