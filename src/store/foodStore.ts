import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  FoodApi, 
  FoodItem, 
  FoodLog, 
  FoodScanResult, 
  NutritionSummary, 
  Recipe 
} from '@/services/api/foodApi';
import { GeminiService, FoodAnalysisResult } from '@/services/gemini/geminiService';
import { ErrorHandler, AppError } from '@/utils/errorHandler';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { DateUtils } from '@/utils/dateUtils';
import { ImageUtils } from '@/utils/imageUtils';

export interface FoodState {
  // Food database
  foods: FoodItem[];
  popularFoods: FoodItem[];
  recentFoods: FoodItem[];
  favoriteFoods: FoodItem[];
  searchResults: FoodItem[];
  categories: Array<{
    id: string;
    name: string;
    nameVi: string;
    icon: string;
    count: number;
  }>;
  
  // Food logging
  foodLogs: FoodLog[];
  nutritionSummary: NutritionSummary | null;
  nutritionTrends: {
    dates: string[];
    calories: number[];
    protein: number[];
    carbs: number[];
    fat: number[];
  } | null;
  
  // Food scanning
  scanResult: FoodAnalysisResult | null;
  scanHistory: FoodAnalysisResult[];
  
  // Recipes
  recipes: Recipe[];
  popularRecipes: Recipe[];
  recommendedRecipes: Recipe[];
  
  // State
  isLoading: boolean;
  isScanning: boolean;
  error: AppError | null;
  lastSyncDate: string | null;
  
  // Actions
  // Food database
  searchFoods: (query: string, category?: string) => Promise<void>;
  getFoodById: (id: string) => Promise<FoodItem>;
  getFoodByBarcode: (barcode: string) => Promise<FoodItem>;
  fetchPopularFoods: () => Promise<void>;
  fetchRecentFoods: () => Promise<void>;
  fetchFavoriteFoods: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addToFavorites: (foodId: string) => Promise<void>;
  removeFromFavorites: (foodId: string) => Promise<void>;
  createCustomFood: (foodData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'verified'>) => Promise<void>;
  
  // Food logging
  logFood: (data: {
    foodId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servingSize: number;
    servingUnit: string;
    loggedAt?: string;
    notes?: string;
    image?: string;
  }) => Promise<void>;
  fetchFoodLogs: (date: string) => Promise<void>;
  fetchFoodLogsRange: (startDate: string, endDate: string) => Promise<void>;
  updateFoodLog: (id: string, data: Partial<FoodLog>) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;
  
  // Nutrition
  fetchNutritionSummary: (date: string) => Promise<void>;
  fetchNutritionTrends: (period: 'week' | 'month' | '3months') => Promise<void>;
  analyzeCustomMeal: (foods: Array<{
    foodId: string;
    servingSize: number;
    servingUnit: string;
  }>) => Promise<{
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
  }>;
  
  // Food scanning
  scanFoodImage: (imageUri: string) => Promise<FoodAnalysisResult>;
  clearScanResult: () => void;
  
  // Recipes
  fetchRecipes: (params?: {
    category?: string;
    difficulty?: string;
    maxTime?: number;
    search?: string;
  }) => Promise<void>;
  getRecipeById: (id: string) => Promise<Recipe>;
  fetchPopularRecipes: () => Promise<void>;
  fetchRecommendedRecipes: () => Promise<void>;
  rateRecipe: (id: string, rating: number) => Promise<void>;
  
  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  clearSearchResults: () => void;
  syncData: () => Promise<void>;
  clearFoodData: () => void;
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      // Initial state
      foods: [],
      popularFoods: [],
      recentFoods: [],
      favoriteFoods: [],
      searchResults: [],
      categories: [],
      foodLogs: [],
      nutritionSummary: null,
      nutritionTrends: null,
      scanResult: null,
      scanHistory: [],
      recipes: [],
      popularRecipes: [],
      recommendedRecipes: [],
      isLoading: false,
      isScanning: false,
      error: null,
      lastSyncDate: null,

      // Food database actions
      searchFoods: async (query, category) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await FoodApi.searchFoods({ query, category });
          
          set({ 
            searchResults: response.data,
            isLoading: false,
          });

          // Track analytics
          AnalyticsService.trackEvent('food_search', {
            query,
            category,
            results_count: response.data.length,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      getFoodById: async (id) => {
        try {
          const food = await FoodApi.getFoodById(id);
          
          // Add to recent foods if not already there
          const { recentFoods } = get();
          const isAlreadyRecent = recentFoods.some(f => f.id === id);
          if (!isAlreadyRecent) {
            set({
              recentFoods: [food, ...recentFoods.slice(0, 9)], // Keep last 10
            });
          }

          return food;
        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      getFoodByBarcode: async (barcode) => {
        try {
          set({ isLoading: true, error: null });
          
          const food = await FoodApi.getFoodByBarcode(barcode);
          
          set({ isLoading: false });

          // Track analytics
          AnalyticsService.trackEvent('barcode_scan', {
            barcode,
            food_found: true,
            food_name: food.name,
          });

          return food;
        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          
          // Track analytics
          AnalyticsService.trackEvent('barcode_scan', {
            barcode,
            food_found: false,
          });
          
          throw appError;
        }
      },

      fetchPopularFoods: async () => {
        try {
          const popularFoods = await FoodApi.getPopularFoods();
          set({ popularFoods });
        } catch (error) {
          console.error('Failed to fetch popular foods:', error);
        }
      },

      fetchRecentFoods: async () => {
        try {
          const recentFoods = await FoodApi.getRecentFoods();
          set({ recentFoods });
        } catch (error) {
          console.error('Failed to fetch recent foods:', error);
        }
      },

      fetchFavoriteFoods: async () => {
        try {
          const favoriteFoods = await FoodApi.getFavoriteFoods();
          set({ favoriteFoods });
        } catch (error) {
          console.error('Failed to fetch favorite foods:', error);
        }
      },

      fetchCategories: async () => {
        try {
          const categories = await FoodApi.getFoodCategories();
          set({ categories });
        } catch (error) {
          console.error('Failed to fetch food categories:', error);
        }
      },

      addToFavorites: async (foodId) => {
        try {
          await FoodApi.addToFavorites(foodId);
          
          // Refresh favorites list
          await get().fetchFavoriteFoods();

          // Track analytics
          AnalyticsService.trackEvent('food_favorited', { food_id: foodId });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      removeFromFavorites: async (foodId) => {
        try {
          await FoodApi.removeFromFavorites(foodId);
          
          // Remove from local favorites list
          const { favoriteFoods } = get();
          const updatedFavorites = favoriteFoods.filter(food => food.id !== foodId);
          set({ favoriteFoods: updatedFavorites });

          // Track analytics
          AnalyticsService.trackEvent('food_unfavorited', { food_id: foodId });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      createCustomFood: async (foodData) => {
        try {
          set({ isLoading: true, error: null });
          
          const newFood = await FoodApi.createFood(foodData);
          
          // Add to foods list
          const { foods } = get();
          set({ 
            foods: [newFood, ...foods],
            isLoading: false,
          });

          // Track analytics
          AnalyticsService.trackEvent('custom_food_created', {
            food_name: newFood.name,
            category: newFood.category,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      // Food logging actions
      logFood: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const foodLog = await FoodApi.logFood(data);
          
          // Add to food logs
          const { foodLogs } = get();
          const today = DateUtils.formatDateKey(new Date());
          const logDate = DateUtils.formatDateKey(new Date(foodLog.loggedAt));
          
          if (logDate === today) {
            set({ 
              foodLogs: [foodLog, ...foodLogs.filter(log => 
                DateUtils.formatDateKey(new Date(log.loggedAt)) !== today
              )],
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          // Refresh nutrition summary for the logged date
          await get().fetchNutritionSummary(logDate);

          // Track analytics
          AnalyticsService.trackFoodLog(data.mealType, foodLog.calories, 'manual');

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      fetchFoodLogs: async (date) => {
        try {
          const foodLogs = await FoodApi.getFoodLogs(date);
          set({ foodLogs });
        } catch (error) {
          console.error('Failed to fetch food logs:', error);
        }
      },

      fetchFoodLogsRange: async (startDate, endDate) => {
        try {
          const foodLogs = await FoodApi.getFoodLogsRange(startDate, endDate);
          set({ foodLogs });
        } catch (error) {
          console.error('Failed to fetch food logs range:', error);
        }
      },

      updateFoodLog: async (id, data) => {
        try {
          const updatedLog = await FoodApi.updateFoodLog(id, data);
          
          const { foodLogs } = get();
          const updatedLogs = foodLogs.map(log => 
            log.id === id ? updatedLog : log
          );
          
          set({ foodLogs: updatedLogs });

          // Refresh nutrition summary
          const logDate = DateUtils.formatDateKey(new Date(updatedLog.loggedAt));
          await get().fetchNutritionSummary(logDate);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      deleteFoodLog: async (id) => {
        try {
          await FoodApi.deleteFoodLog(id);
          
          const { foodLogs } = get();
          const logToDelete = foodLogs.find(log => log.id === id);
          const filteredLogs = foodLogs.filter(log => log.id !== id);
          
          set({ foodLogs: filteredLogs });

          // Refresh nutrition summary
          if (logToDelete) {
            const logDate = DateUtils.formatDateKey(new Date(logToDelete.loggedAt));
            await get().fetchNutritionSummary(logDate);
          }

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Nutrition actions
      fetchNutritionSummary: async (date) => {
        try {
          const nutritionSummary = await FoodApi.getNutritionSummary(date);
          set({ nutritionSummary });
        } catch (error) {
          console.error('Failed to fetch nutrition summary:', error);
        }
      },

      fetchNutritionTrends: async (period) => {
        try {
          const nutritionTrends = await FoodApi.getNutritionTrends(period);
          set({ nutritionTrends });
        } catch (error) {
          console.error('Failed to fetch nutrition trends:', error);
        }
      },

      analyzeCustomMeal: async (foods) => {
        try {
          return await FoodApi.analyzeCustomMeal(foods);
        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Food scanning actions
      scanFoodImage: async (imageUri) => {
        try {
          set({ isScanning: true, error: null });
          
          // Optimize image for upload
          const optimizedImage = await ImageUtils.optimizeForUpload(imageUri);
          
          // Convert to base64
          const base64 = await ImageUtils.convertToBase64(optimizedImage.uri);
          
          // Analyze with Gemini
          const result = await GeminiService.analyzeFoodImage(base64);
          
          // Add to scan history
          const { scanHistory } = get();
          const updatedHistory = [result, ...scanHistory.slice(0, 9)]; // Keep last 10
          
          set({ 
            scanResult: result,
            scanHistory: updatedHistory,
            isScanning: false,
          });

          // Track analytics
          AnalyticsService.trackFoodScan(
            result.confidence > 0.7,
            result.confidence,
            result.foods[0]?.category
          );

          return result;

        } catch (error) {
          const appError = ErrorHandler.handleGeminiError(error);
          set({ isScanning: false, error: appError });
          
          // Track analytics
          AnalyticsService.trackFoodScan(false, 0);
          
          throw appError;
        }
      },

      clearScanResult: () => {
        set({ scanResult: null });
      },

      // Recipe actions
      fetchRecipes: async (params) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await FoodApi.getRecipes(params);
          
          set({ 
            recipes: response.data,
            isLoading: false,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      getRecipeById: async (id) => {
        try {
          const recipe = await FoodApi.getRecipeById(id);
          
          // Track analytics
          AnalyticsService.trackRecipeView(id, recipe.name);
          
          return recipe;
        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      fetchPopularRecipes: async () => {
        try {
          const popularRecipes = await FoodApi.getPopularRecipes();
          set({ popularRecipes });
        } catch (error) {
          console.error('Failed to fetch popular recipes:', error);
        }
      },

      fetchRecommendedRecipes: async () => {
        try {
          const recommendedRecipes = await FoodApi.getRecommendedRecipes();
          set({ recommendedRecipes });
        } catch (error) {
          console.error('Failed to fetch recommended recipes:', error);
        }
      },

      rateRecipe: async (id, rating) => {
        try {
          await FoodApi.rateRecipe(id, rating);
          
          // Track analytics
          AnalyticsService.trackEvent('recipe_rated', {
            recipe_id: id,
            rating,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Utility actions
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      clearSearchResults: () => {
        set({ searchResults: [] });
      },

      syncData: async () => {
        try {
          set({ isLoading: true });
          
          const today = DateUtils.formatDateKey(new Date());
          
          // Sync all food data
          await Promise.all([
            get().fetchPopularFoods(),
            get().fetchRecentFoods(),
            get().fetchFavoriteFoods(),
            get().fetchCategories(),
            get().fetchFoodLogs(today),
            get().fetchNutritionSummary(today),
            get().fetchPopularRecipes(),
            get().fetchRecommendedRecipes(),
          ]);

          set({ 
            isLoading: false,
            lastSyncDate: new Date().toISOString(),
          });

        } catch (error) {
          console.error('Failed to sync food data:', error);
          set({ isLoading: false });
        }
      },

      clearFoodData: () => {
        set({
          foods: [],
          popularFoods: [],
          recentFoods: [],
          favoriteFoods: [],
          searchResults: [],
          categories: [],
          foodLogs: [],
          nutritionSummary: null,
          nutritionTrends: null,
          scanResult: null,
          scanHistory: [],
          recipes: [],
          popularRecipes: [],
          recommendedRecipes: [],
          isLoading: false,
          isScanning: false,
          error: null,
          lastSyncDate: null,
        });
      },
    }),
    {
      name: 'food-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentFoods: state.recentFoods,
        favoriteFoods: state.favoriteFoods,
        scanHistory: state.scanHistory,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
);

export default useFoodStore;