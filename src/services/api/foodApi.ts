import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

export interface FoodItem {
  id: string;
  name: string;
  nameVi: string;
  brand?: string;
  category: string;
  barcode?: string;
  images: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    servingSize: number;
    servingUnit: string;
  };
  verified: boolean;
  source: 'user' | 'database' | 'api';
  createdAt: string;
  updatedAt: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodId: string;
  food: FoodItem;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  loggedAt: string;
  notes?: string;
  image?: string;
}

export interface FoodScanResult {
  confidence: number;
  foods: Array<{
    name: string;
    nameVi: string;
    confidence: number;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
    };
    category?: string;
    servingSize?: number;
    servingUnit?: string;
  }>;
  suggestions?: string[];
}

export interface NutritionSummary {
  date: string;
  calories: {
    consumed: number;
    goal: number;
    remaining: number;
  };
  macros: {
    protein: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    carbs: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    fat: {
      consumed: number;
      goal: number;
      percentage: number;
    };
  };
  fiber: number;
  sugar: number;
  sodium: number;
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
}

export interface Recipe {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  images: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    optional?: boolean;
  }>;
  instructions: Array<{
    step: number;
    instruction: string;
    image?: string;
    duration?: number;
  }>;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export class FoodApi {
  /**
   * Scan food image using AI
   */
  static async scanFood(image: {
    uri: string;
    name: string;
    type: string;
  }): Promise<FoodScanResult> {
    const response = await apiClient.uploadFile<FoodScanResult>(
      '/food/scan',
      image
    );
    return response.data;
  }

  /**
   * Search foods in database
   */
  static async searchFoods(params: {
    query: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<FoodItem>> {
    const response = await apiClient.getPaginated<FoodItem>('/food/search', params);
    return response;
  }

  /**
   * Get food by ID
   */
  static async getFoodById(id: string): Promise<FoodItem> {
    const response = await apiClient.get<FoodItem>(`/food/${id}`);
    return response.data;
  }

  /**
   * Get food by barcode
   */
  static async getFoodByBarcode(barcode: string): Promise<FoodItem> {
    const response = await apiClient.get<FoodItem>(`/food/barcode/${barcode}`);
    return response.data;
  }

  /**
   * Get popular foods
   */
  static async getPopularFoods(limit: number = 20): Promise<FoodItem[]> {
    const response = await apiClient.get<FoodItem[]>(`/food/popular?limit=${limit}`);
    return response.data;
  }

  /**
   * Get recent foods for user
   */
  static async getRecentFoods(limit: number = 10): Promise<FoodItem[]> {
    const response = await apiClient.get<FoodItem[]>(`/food/recent?limit=${limit}`);
    return response.data;
  }

  /**
   * Get favorite foods for user
   */
  static async getFavoriteFoods(): Promise<FoodItem[]> {
    const response = await apiClient.get<FoodItem[]>('/food/favorites');
    return response.data;
  }

  /**
   * Add food to favorites
   */
  static async addToFavorites(foodId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/food/${foodId}/favorite`);
    return response.data;
  }

  /**
   * Remove food from favorites
   */
  static async removeFromFavorites(foodId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/food/${foodId}/favorite`);
    return response.data;
  }

  /**
   * Create custom food item
   */
  static async createFood(data: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'verified'>): Promise<FoodItem> {
    const response = await apiClient.post<FoodItem>('/food', data);
    return response.data;
  }

  /**
   * Update food item
   */
  static async updateFood(id: string, data: Partial<FoodItem>): Promise<FoodItem> {
    const response = await apiClient.put<FoodItem>(`/food/${id}`, data);
    return response.data;
  }

  /**
   * Delete food item
   */
  static async deleteFood(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/food/${id}`);
    return response.data;
  }

  /**
   * Log food consumption
   */
  static async logFood(data: {
    foodId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servingSize: number;
    servingUnit: string;
    loggedAt?: string;
    notes?: string;
    image?: string;
  }): Promise<FoodLog> {
    const response = await apiClient.post<FoodLog>('/food/log', data);
    return response.data;
  }

  /**
   * Get food logs for date
   */
  static async getFoodLogs(date: string): Promise<FoodLog[]> {
    const response = await apiClient.get<FoodLog[]>(`/food/logs?date=${date}`);
    return response.data;
  }

  /**
   * Get food logs for date range
   */
  static async getFoodLogsRange(startDate: string, endDate: string): Promise<FoodLog[]> {
    const response = await apiClient.get<FoodLog[]>(
      `/food/logs/range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  /**
   * Update food log
   */
  static async updateFoodLog(id: string, data: Partial<FoodLog>): Promise<FoodLog> {
    const response = await apiClient.put<FoodLog>(`/food/logs/${id}`, data);
    return response.data;
  }

  /**
   * Delete food log
   */
  static async deleteFoodLog(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/food/logs/${id}`);
    return response.data;
  }

  /**
   * Get nutrition summary for date
   */
  static async getNutritionSummary(date: string): Promise<NutritionSummary> {
    const response = await apiClient.get<NutritionSummary>(`/food/nutrition/summary?date=${date}`);
    return response.data;
  }

  /**
   * Get nutrition trends
   */
  static async getNutritionTrends(period: 'week' | 'month' | '3months'): Promise<{
    dates: string[];
    calories: number[];
    protein: number[];
    carbs: number[];
    fat: number[];
  }> {
    const response = await apiClient.get<{
      dates: string[];
      calories: number[];
      protein: number[];
      carbs: number[];
      fat: number[];
    }>(`/food/nutrition/trends?period=${period}`);
    return response.data;
  }

  /**
   * Get food categories
   */
  static async getFoodCategories(): Promise<Array<{
    id: string;
    name: string;
    nameVi: string;
    icon: string;
    count: number;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      name: string;
      nameVi: string;
      icon: string;
      count: number;
    }>>('/food/categories');
    return response.data;
  }

  /**
   * Get Vietnamese foods
   */
  static async getVietnameseFoods(params?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<FoodItem>> {
    const response = await apiClient.getPaginated<FoodItem>('/food/vietnamese', params);
    return response;
  }

  /**
   * Get recipes
   */
  static async getRecipes(params?: {
    category?: string;
    difficulty?: string;
    maxTime?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Recipe>> {
    const response = await apiClient.getPaginated<Recipe>('/recipes', params);
    return response;
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe> {
    const response = await apiClient.get<Recipe>(`/recipes/${id}`);
    return response.data;
  }

  /**
   * Get popular recipes
   */
  static async getPopularRecipes(limit: number = 10): Promise<Recipe[]> {
    const response = await apiClient.get<Recipe[]>(`/recipes/popular?limit=${limit}`);
    return response.data;
  }

  /**
   * Get recommended recipes based on user preferences
   */
  static async getRecommendedRecipes(limit: number = 10): Promise<Recipe[]> {
    const response = await apiClient.get<Recipe[]>(`/recipes/recommended?limit=${limit}`);
    return response.data;
  }

  /**
   * Rate recipe
   */
  static async rateRecipe(id: string, rating: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/recipes/${id}/rate`, { rating });
    return response.data;
  }

  /**
   * Get nutrition analysis for custom meal
   */
  static async analyzeCustomMeal(foods: Array<{
    foodId: string;
    servingSize: number;
    servingUnit: string;
  }>): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
    totalSugar: number;
    totalSodium: number;
    macroPercentages: {
      protein: number;
      carbs: number;
      fat: number;
    };
  }> {
    const response = await apiClient.post<{
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      totalFiber: number;
      totalSugar: number;
      totalSodium: number;
      macroPercentages: {
        protein: number;
        carbs: number;
        fat: number;
      };
    }>('/food/analyze-meal', { foods });
    return response.data;
  }

  /**
   * Export nutrition data
   */
  static async exportNutritionData(format: 'csv' | 'pdf', dateRange: {
    startDate: string;
    endDate: string;
  }): Promise<{ downloadUrl: string }> {
    const response = await apiClient.post<{ downloadUrl: string }>('/food/export', {
      format,
      ...dateRange,
    });
    return response.data;
  }
}

export default FoodApi;