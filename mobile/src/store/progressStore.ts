import { create } from 'zustand';
import { WaterLog, ExerciseLog, WeightLog } from '@types';
import progressApi from '@services/api/progressApi';

interface ProgressState {
  waterLogs: WaterLog[];
  exerciseLogs: ExerciseLog[];
  weightLogs: WeightLog[];
  todayWater: {
    total_ml: number;
    goal_ml: number;
    progress: number;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  logWater: (amountMl: number) => Promise<boolean>;
  getTodayWater: () => Promise<void>;
  logExercise: (data: any) => Promise<boolean>;
  getExerciseLogs: (startDate?: string, endDate?: string) => Promise<void>;
  deleteExerciseLog: (id: string) => Promise<boolean>;
  logWeight: (weight: number, notes?: string) => Promise<boolean>;
  getWeightLogs: () => Promise<void>;
  getProgressSummary: (period?: string) => Promise<any>;
  clearError: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  waterLogs: [],
  exerciseLogs: [],
  weightLogs: [],
  todayWater: {
    total_ml: 0,
    goal_ml: 2000,
    progress: 0,
  },
  isLoading: false,
  error: null,

  logWater: async (amountMl) => {
    try {
      const response = await progressApi.logWater(amountMl);
      
      if (response.success) {
        await get().getTodayWater();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Log water error:', error);
      return false;
    }
  },

  getTodayWater: async () => {
    try {
      const response = await progressApi.getWaterLogs();
      
      if (response.success && response.data) {
        set({
          todayWater: {
            total_ml: response.data.total_ml,
            goal_ml: response.data.goal_ml,
            progress: response.data.progress,
          },
        });
      }
    } catch (error) {
      console.error('Get today water error:', error);
    }
  },

  logExercise: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await progressApi.logExercise(data);
      
      if (response.success) {
        await get().getExerciseLogs();
        set({ isLoading: false });
        return true;
      }
      
      set({
        error: response.message || 'Failed to log exercise',
        isLoading: false,
      });
      return false;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to log exercise',
        isLoading: false,
      });
      return false;
    }
  },

  getExerciseLogs: async (startDate, endDate) => {
    try {
      const response = await progressApi.getExerciseLogs({ startDate, endDate });
      
      if (response.success && response.data) {
        set({ exerciseLogs: response.data });
      }
    } catch (error) {
      console.error('Get exercise logs error:', error);
    }
  },

  deleteExerciseLog: async (id) => {
    try {
      const response = await progressApi.deleteExerciseLog(id);
      
      if (response.success) {
        set((state) => ({
          exerciseLogs: state.exerciseLogs.filter((log) => log.id !== id),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete exercise log error:', error);
      return false;
    }
  },

  logWeight: async (weight, notes) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await progressApi.logWeight({ weight, notes });
      
      if (response.success) {
        await get().getWeightLogs();
        set({ isLoading: false });
        return true;
      }
      
      set({
        error: response.message || 'Failed to log weight',
        isLoading: false,
      });
      return false;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to log weight',
        isLoading: false,
      });
      return false;
    }
  },

  getWeightLogs: async () => {
    try {
      const response = await progressApi.getWeightLogs();
      
      if (response.success && response.data) {
        set({ weightLogs: response.data });
      }
    } catch (error) {
      console.error('Get weight logs error:', error);
    }
  },

  getProgressSummary: async (period = 'weekly') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await progressApi.getProgressSummary(period as any);
      
      if (response.success && response.data) {
        set({ isLoading: false });
        return response.data;
      }
      
      set({ isLoading: false });
      return null;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get progress summary',
        isLoading: false,
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useProgressStore;
