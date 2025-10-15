import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SETTINGS: 'settings',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  THEME: 'theme',
  LANGUAGE: 'language',
  FIRST_LAUNCH: 'first_launch',
  CACHED_FOODS: 'cached_foods',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITES: 'favorites',
};

/**
 * Save data to storage
 */
export const saveData = async (key: string, value: any): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Save data error:', error);
    return false;
  }
};

/**
 * Get data from storage
 */
export const getData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Get data error:', error);
    return null;
  }
};

/**
 * Remove data from storage
 */
export const removeData = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Remove data error:', error);
    return false;
  }
};

/**
 * Clear all storage
 */
export const clearAll = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Clear all error:', error);
    return false;
  }
};

/**
 * Save auth tokens
 */
export const saveAuthTokens = async (
  token: string,
  refreshToken: string
): Promise<boolean> => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
    return true;
  } catch (error) {
    console.error('Save auth tokens error:', error);
    return false;
  }
};

/**
 * Get auth tokens
 */
export const getAuthTokens = async (): Promise<{
  token: string | null;
  refreshToken: string | null;
}> => {
  try {
    const values = await AsyncStorage.multiGet([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);

    return {
      token: values[0][1],
      refreshToken: values[1][1],
    };
  } catch (error) {
    console.error('Get auth tokens error:', error);
    return { token: null, refreshToken: null };
  }
};

/**
 * Clear auth tokens
 */
export const clearAuthTokens = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
    return true;
  } catch (error) {
    console.error('Clear auth tokens error:', error);
    return false;
  }
};

/**
 * Check if first launch
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    if (value === null) {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Check first launch error:', error);
    return false;
  }
};

/**
 * Save recent search
 */
export const saveRecentSearch = async (query: string): Promise<void> => {
  try {
    const recentSearches = await getData<string[]>(STORAGE_KEYS.RECENT_SEARCHES) || [];
    const updated = [query, ...recentSearches.filter((q) => q !== query)].slice(0, 10);
    await saveData(STORAGE_KEYS.RECENT_SEARCHES, updated);
  } catch (error) {
    console.error('Save recent search error:', error);
  }
};

/**
 * Get recent searches
 */
export const getRecentSearches = async (): Promise<string[]> => {
  try {
    return (await getData<string[]>(STORAGE_KEYS.RECENT_SEARCHES)) || [];
  } catch (error) {
    console.error('Get recent searches error:', error);
    return [];
  }
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = async (): Promise<void> => {
  try {
    await removeData(STORAGE_KEYS.RECENT_SEARCHES);
  } catch (error) {
    console.error('Clear recent searches error:', error);
  }
};

export default {
  STORAGE_KEYS,
  saveData,
  getData,
  removeData,
  clearAll,
  saveAuthTokens,
  getAuthTokens,
  clearAuthTokens,
  isFirstLaunch,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
};
