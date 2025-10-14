import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/config';

export interface StorageOptions {
  secure?: boolean;
  encrypt?: boolean;
  expiry?: number; // milliseconds
}

export interface StoredItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export class StorageService {
  /**
   * Store data with optional security and expiry
   */
  static async setItem<T>(
    key: string,
    value: T,
    options: StorageOptions = {}
  ): Promise<void> {
    try {
      const item: StoredItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiry: options.expiry ? Date.now() + options.expiry : undefined,
      };

      const serializedValue = JSON.stringify(item);

      if (options.secure) {
        await SecureStore.setItemAsync(key, serializedValue);
      } else {
        await AsyncStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      console.error(`Error storing item with key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Retrieve data with automatic expiry check
   */
  static async getItem<T>(
    key: string,
    options: { secure?: boolean } = {}
  ): Promise<T | null> {
    try {
      let serializedValue: string | null;

      if (options.secure) {
        serializedValue = await SecureStore.getItemAsync(key);
      } else {
        serializedValue = await AsyncStorage.getItem(key);
      }

      if (!serializedValue) {
        return null;
      }

      const item: StoredItem<T> = JSON.parse(serializedValue);

      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        await this.removeItem(key, options);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error(`Error retrieving item with key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  static async removeItem(
    key: string,
    options: { secure?: boolean } = {}
  ): Promise<void> {
    try {
      if (options.secure) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing item with key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Check if item exists
   */
  static async hasItem(
    key: string,
    options: { secure?: boolean } = {}
  ): Promise<boolean> {
    const item = await this.getItem(key, options);
    return item !== null;
  }

  /**
   * Get all keys from storage
   */
  static async getAllKeys(secure: boolean = false): Promise<string[]> {
    try {
      if (secure) {
        // SecureStore doesn't have getAllKeys, so we maintain our own index
        const keysIndex = await this.getItem<string[]>('__secure_keys_index__', { secure: true });
        return keysIndex || [];
      } else {
        return await AsyncStorage.getAllKeys();
      }
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Clear all storage
   */
  static async clear(secure: boolean = false): Promise<void> {
    try {
      if (secure) {
        const keys = await this.getAllKeys(true);
        await Promise.all(keys.map(key => this.removeItem(key, { secure: true })));
        await this.removeItem('__secure_keys_index__', { secure: true });
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get storage usage info
   */
  static async getStorageInfo(): Promise<{
    totalKeys: number;
    estimatedSize: number; // in bytes
    keys: string[];
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let estimatedSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          estimatedSize += key.length + value.length;
        }
      }

      return {
        totalKeys: keys.length,
        estimatedSize,
        keys,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalKeys: 0,
        estimatedSize: 0,
        keys: [],
      };
    }
  }

  /**
   * Batch operations
   */
  static async multiSet(
    keyValuePairs: Array<[string, any]>,
    options: StorageOptions = {}
  ): Promise<void> {
    try {
      const promises = keyValuePairs.map(([key, value]) =>
        this.setItem(key, value, options)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error in multiSet:', error);
      throw error;
    }
  }

  static async multiGet<T>(
    keys: string[],
    options: { secure?: boolean } = {}
  ): Promise<Array<[string, T | null]>> {
    try {
      const promises = keys.map(async (key) => {
        const value = await this.getItem<T>(key, options);
        return [key, value] as [string, T | null];
      });
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error in multiGet:', error);
      throw error;
    }
  }

  static async multiRemove(
    keys: string[],
    options: { secure?: boolean } = {}
  ): Promise<void> {
    try {
      const promises = keys.map(key => this.removeItem(key, options));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error in multiRemove:', error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  static async setCache<T>(
    key: string,
    value: T,
    ttl: number = 3600000 // 1 hour default
  ): Promise<void> {
    await this.setItem(`cache_${key}`, value, { expiry: ttl });
  }

  static async getCache<T>(key: string): Promise<T | null> {
    return await this.getItem<T>(`cache_${key}`);
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await this.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * User-specific storage methods
   */
  static async setUserData<T>(
    userId: string,
    key: string,
    value: T,
    options: StorageOptions = {}
  ): Promise<void> {
    const userKey = `user_${userId}_${key}`;
    await this.setItem(userKey, value, options);
  }

  static async getUserData<T>(
    userId: string,
    key: string,
    options: { secure?: boolean } = {}
  ): Promise<T | null> {
    const userKey = `user_${userId}_${key}`;
    return await this.getItem<T>(userKey, options);
  }

  static async removeUserData(
    userId: string,
    key: string,
    options: { secure?: boolean } = {}
  ): Promise<void> {
    const userKey = `user_${userId}_${key}`;
    await this.removeItem(userKey, options);
  }

  static async clearUserData(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.startsWith(`user_${userId}_`));
      await this.multiRemove(userKeys);
    } catch (error) {
      console.error(`Error clearing user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * App-specific storage methods using config keys
   */
  static async setUserToken(token: string): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.USER_TOKEN, token, { secure: true });
  }

  static async getUserToken(): Promise<string | null> {
    return await this.getItem<string>(Config.STORAGE_KEYS.USER_TOKEN, { secure: true });
  }

  static async removeUserToken(): Promise<void> {
    await this.removeItem(Config.STORAGE_KEYS.USER_TOKEN, { secure: true });
  }

  static async setUserProfile(profile: any): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.USER_DATA, profile);
  }

  static async getUserProfile<T>(): Promise<T | null> {
    return await this.getItem<T>(Config.STORAGE_KEYS.USER_DATA);
  }

  static async removeUserProfile(): Promise<void> {
    await this.removeItem(Config.STORAGE_KEYS.USER_DATA);
  }

  static async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.THEME, theme);
  }

  static async getTheme(): Promise<'light' | 'dark' | null> {
    return await this.getItem<'light' | 'dark'>(Config.STORAGE_KEYS.THEME);
  }

  static async setLanguage(language: string): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.LANGUAGE, language);
  }

  static async getLanguage(): Promise<string | null> {
    return await this.getItem<string>(Config.STORAGE_KEYS.LANGUAGE);
  }

  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  }

  static async isOnboardingCompleted(): Promise<boolean> {
    const completed = await this.getItem<boolean>(Config.STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed === true;
  }

  static async setPremiumStatus(isPremium: boolean): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.PREMIUM_STATUS, isPremium);
  }

  static async getPremiumStatus(): Promise<boolean> {
    const isPremium = await this.getItem<boolean>(Config.STORAGE_KEYS.PREMIUM_STATUS);
    return isPremium === true;
  }

  static async setSettings(settings: any): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.SETTINGS, settings);
  }

  static async getSettings<T>(): Promise<T | null> {
    return await this.getItem<T>(Config.STORAGE_KEYS.SETTINGS);
  }

  /**
   * Offline data management
   */
  static async setOfflineData<T>(key: string, data: T): Promise<void> {
    await this.setItem(`offline_${key}`, data);
  }

  static async getOfflineData<T>(key: string): Promise<T | null> {
    return await this.getItem<T>(`offline_${key}`);
  }

  static async clearOfflineData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      await this.multiRemove(offlineKeys);
    } catch (error) {
      console.error('Error clearing offline data:', error);
      throw error;
    }
  }

  /**
   * Migration utilities
   */
  static async migrateData(
    oldKey: string,
    newKey: string,
    transform?: (data: any) => any
  ): Promise<void> {
    try {
      const oldData = await this.getItem(oldKey);
      if (oldData !== null) {
        const newData = transform ? transform(oldData) : oldData;
        await this.setItem(newKey, newData);
        await this.removeItem(oldKey);
      }
    } catch (error) {
      console.error(`Error migrating data from ${oldKey} to ${newKey}:`, error);
      throw error;
    }
  }

  /**
   * Debug utilities
   */
  static async debugDump(): Promise<Record<string, any>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result: Record<string, any> = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        try {
          result[key] = value ? JSON.parse(value) : null;
        } catch {
          result[key] = value;
        }
      }

      return result;
    } catch (error) {
      console.error('Error dumping storage:', error);
      return {};
    }
  }
}

export default StorageService;