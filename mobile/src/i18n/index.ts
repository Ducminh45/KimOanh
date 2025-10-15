/**
 * Internationalization (i18n) Setup
 * Support for Vietnamese and English
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import vi from './locales/vi.json';
import en from './locales/en.json';

const LANGUAGE_KEY = '@app_language';

// Create i18n instance
export const i18n = new I18n({
  vi,
  en,
});

// Set default locale
i18n.defaultLocale = 'vi';
i18n.locale = 'vi';
i18n.enableFallback = true;

/**
 * Initialize i18n with saved language preference
 */
export const initI18n = async (): Promise<void> => {
  try {
    // Try to get saved language
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    } else {
      // Use device locale
      const deviceLocale = Localization.locale;
      const language = deviceLocale.split('-')[0]; // Get 'vi' from 'vi-VN'
      
      // Only use if we support it
      if (['vi', 'en'].includes(language)) {
        i18n.locale = language;
      }
    }
    
    console.log('i18n initialized:', i18n.locale);
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
  }
};

/**
 * Change language
 */
export const changeLanguage = async (language: 'vi' | 'en'): Promise<void> => {
  try {
    i18n.locale = language;
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    console.log('Language changed to:', language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): 'vi' | 'en' => {
  return i18n.locale as 'vi' | 'en';
};

/**
 * Translate function
 */
export const t = (key: string, params?: Record<string, any>): string => {
  return i18n.t(key, params);
};

/**
 * Check if key exists
 */
export const exists = (key: string): boolean => {
  return i18n.exists(key);
};

export default {
  i18n,
  initI18n,
  changeLanguage,
  getCurrentLanguage,
  t,
  exists,
};
