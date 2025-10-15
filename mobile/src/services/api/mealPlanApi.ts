import apiClient from './apiClient';
import { Recipe, MealPlan, ShoppingListItem, ApiResponse } from '@types';

export const mealPlanApi = {
  /**
   * Generate AI meal plan
   */
  generateMealPlan: async (): Promise<ApiResponse<{
    mealPlanId: string;
    weekPlan: any[];
    tips: string[];
  }>> => {
    return await apiClient.post('/meal-plan/generate');
  },

  /**
   * Get recipes
   */
  getRecipes: async (params?: {
    cuisine?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Recipe[]>> => {
    return await apiClient.get('/meal-plan/recipes', { params });
  },

  /**
   * Get recipe by ID
   */
  getRecipeById: async (
    recipeId: string
  ): Promise<ApiResponse<Recipe>> => {
    return await apiClient.get(`/meal-plan/recipe/${recipeId}`);
  },

  /**
   * Toggle favorite recipe
   */
  toggleFavoriteRecipe: async (
    recipeId: string
  ): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    return await apiClient.post(`/meal-plan/recipe/${recipeId}/favorite`);
  },

  /**
   * Get shopping list
   */
  getShoppingList: async (): Promise<ApiResponse<{
    shoppingListId: string;
    items: ShoppingListItem[];
  }>> => {
    return await apiClient.get('/meal-plan/shopping-list');
  },

  /**
   * Add item to shopping list
   */
  addShoppingListItem: async (data: {
    itemName: string;
    category?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }): Promise<ApiResponse<ShoppingListItem>> => {
    return await apiClient.post('/meal-plan/shopping-list/item', data);
  },

  /**
   * Toggle shopping list item
   */
  toggleShoppingListItem: async (itemId: string): Promise<ApiResponse<ShoppingListItem>> => {
    return await apiClient.put(`/meal-plan/shopping-list/item/${itemId}/toggle`);
  },

  /**
   * Delete shopping list item
   */
  deleteShoppingListItem: async (itemId: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/meal-plan/shopping-list/item/${itemId}`);
  },
};

export default mealPlanApi;
