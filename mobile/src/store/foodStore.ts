import { create } from 'zustand';
import { Food, FoodLog, DailyNutrition, ScannedFood } from '@types';
import foodApi from '@services/api/foodApi';

interface FoodState {
  dailyNutrition: DailyNutrition | null;
  foodLogs: FoodLog[];
  favorites: Food[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  scanFood: (imageBase64: string) => Promise<{ isFood: boolean; foods: ScannedFood[] } | null>;
  logFood: (data: any) => Promise<boolean>;
  getFoodLogs: (startDate?: string, endDate?: string) => Promise<void>;
  getDailyNutrition: (date?: string) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<boolean>;
  searchFoods: (query: string) => Promise<Food[]>;
  getFavorites: () => Promise<void>;
  toggleFavorite: (foodId: string) => Promise<void>;
  clearError: () => void;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  dailyNutrition: null,
  foodLogs: [],
  favorites: [],
  isLoading: false,
  error: null,

  scanFood: async (imageBase64) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await foodApi.scanFood(imageBase64);
      
      if (response.success && response.data) {
        set({ isLoading: false });
        return {
          isFood: response.data.isFood,
          foods: response.data.foods,
        };
      } else {
        set({ 
          error: response.message || 'Failed to scan food',
          isLoading: false 
        });
        return null;
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to scan food',
        isLoading: false 
      });
      return null;
    }
  },

  logFood: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await foodApi.logFood(data);
      
      if (response.success) {
        // Refresh daily nutrition
        await get().getDailyNutrition();
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to log food',
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to log food',
        isLoading: false 
      });
      return false;
    }
  },

  getFoodLogs: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await foodApi.getFoodLogs({ startDate, endDate });
      
      if (response.success && response.data) {
        set({ 
          foodLogs: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to get food logs',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to get food logs',
        isLoading: false 
      });
    }
  },

  getDailyNutrition: async (date) => {
    try {
      const response = await foodApi.getDailyNutrition(date);
      
      if (response.success && response.data) {
        set({ dailyNutrition: response.data });
      }
    } catch (error: any) {
      console.error('Get daily nutrition error:', error);
    }
  },

  deleteFoodLog: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await foodApi.deleteFoodLog(id);
      
      if (response.success) {
        // Remove from local state
        set(state => ({
          foodLogs: state.foodLogs.filter(log => log.id !== id),
          isLoading: false
        }));
        
        // Refresh daily nutrition
        await get().getDailyNutrition();
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to delete food log',
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete food log',
        isLoading: false 
      });
      return false;
    }
  },

  searchFoods: async (query) => {
    try {
      const response = await foodApi.searchFoods({ q: query, limit: 20 });
      
      if (response.success && response.data) {
        return response.data.foods;
      }
      return [];
    } catch (error) {
      console.error('Search foods error:', error);
      return [];
    }
  },

  getFavorites: async () => {
    try {
      const response = await foodApi.getFavorites();
      
      if (response.success && response.data) {
        set({ favorites: response.data });
      }
    } catch (error) {
      console.error('Get favorites error:', error);
    }
  },

  toggleFavorite: async (foodId) => {
    try {
      const response = await foodApi.toggleFavorite(foodId);
      
      if (response.success) {
        await get().getFavorites();
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useFoodStore;
