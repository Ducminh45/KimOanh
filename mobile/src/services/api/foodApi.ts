import apiClient from './apiClient';
import { Food, FoodLog, DailyNutrition, ScannedFood, ApiResponse } from '@types';

export const foodApi = {
  /**
   * Scan food image
   */
  scanFood: async (imageBase64: string): Promise<ApiResponse<{
    isFood: boolean;
    foods: ScannedFood[];
    description?: string;
  }>> => {
    return await apiClient.post('/food/scan', { imageBase64 });
  },

  /**
   * Log food entry
   */
  logFood: async (data: {
    foodId?: string;
    foodName: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servingSize?: number;
    servingUnit?: string;
    calories: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
    fiber?: number;
    imageUrl?: string;
    scanned?: boolean;
    confidenceScore?: number;
    notes?: string;
  }): Promise<ApiResponse<FoodLog>> => {
    return await apiClient.post('/food/log', data);
  },

  /**
   * Get food logs
   */
  getFoodLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    mealType?: string;
  }): Promise<ApiResponse<FoodLog[]>> => {
    return await apiClient.get('/food/logs', { params });
  },

  /**
   * Get daily nutrition summary
   */
  getDailyNutrition: async (date?: string): Promise<ApiResponse<DailyNutrition>> => {
    return await apiClient.get('/food/daily', { params: { date } });
  },

  /**
   * Delete food log
   */
  deleteFoodLog: async (id: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/food/log/${id}`);
  },

  /**
   * Search foods
   */
  searchFoods: async (params: {
    q?: string;
    category?: string;
    cuisine?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    foods: Food[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }>> => {
    return await apiClient.get('/food/search', { params });
  },

  /**
   * Get food by ID
   */
  getFoodById: async (id: string): Promise<ApiResponse<Food>> => {
    return await apiClient.get(`/food/${id}`);
  },

  /**
   * Get favorite foods
   */
  getFavorites: async (): Promise<ApiResponse<Food[]>> => {
    return await apiClient.get('/food/user/favorites');
  },

  /**
   * Toggle favorite food
   */
  toggleFavorite: async (foodId: string): Promise<ApiResponse<{
    isFavorite: boolean;
  }>> => {
    return await apiClient.post(`/food/favorite/${foodId}`);
  },
};

export default foodApi;
