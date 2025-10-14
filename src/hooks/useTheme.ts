import { useState, useEffect, useCallback } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { lightTheme, darkTheme, Theme, ThemeType } from '@/constants/themes';
import { StorageService } from '@/services/storage/storageService';
import { AnalyticsService } from '@/services/analytics/analyticsService';

export interface UseThemeReturn {
  theme: Theme;
  themeType: ThemeType;
  isDark: boolean;
  isLight: boolean;
  setTheme: (themeType: ThemeType) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setSystemTheme: () => Promise<void>;
  isSystemTheme: boolean;
}

export const useTheme = (): UseThemeReturn => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // Get current theme object
  const theme = themeType === 'dark' ? darkTheme : lightTheme;
  const isDark = themeType === 'dark';
  const isLight = themeType === 'light';

  // Load saved theme preference
  const loadThemePreference = useCallback(async () => {
    try {
      const savedTheme = await StorageService.getTheme();
      const systemTheme = Appearance.getColorScheme();
      
      if (savedTheme === 'system' || !savedTheme) {
        setIsSystemTheme(true);
        setThemeType(systemTheme === 'dark' ? 'dark' : 'light');
      } else {
        setIsSystemTheme(false);
        setThemeType(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      // Fallback to system theme
      const systemTheme = Appearance.getColorScheme();
      setThemeType(systemTheme === 'dark' ? 'dark' : 'light');
    }
  }, []);

  // Set theme
  const setTheme = useCallback(async (newThemeType: ThemeType) => {
    try {
      const oldTheme = themeType;
      
      setThemeType(newThemeType);
      setIsSystemTheme(false);
      
      await StorageService.setTheme(newThemeType);
      
      // Track analytics
      AnalyticsService.trackThemeChange(oldTheme, newThemeType);
      
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  }, [themeType]);

  // Toggle theme
  const toggleTheme = useCallback(async () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  }, [themeType, setTheme]);

  // Set system theme
  const setSystemTheme = useCallback(async () => {
    try {
      const systemTheme = Appearance.getColorScheme();
      const oldTheme = themeType;
      
      setThemeType(systemTheme === 'dark' ? 'dark' : 'light');
      setIsSystemTheme(true);
      
      await StorageService.setItem('theme', 'system');
      
      // Track analytics
      AnalyticsService.trackThemeChange(oldTheme, 'system');
      
    } catch (error) {
      console.error('Failed to set system theme:', error);
    }
  }, [themeType]);

  // Handle system theme changes
  const handleSystemThemeChange = useCallback((colorScheme: ColorSchemeName) => {
    if (isSystemTheme) {
      setThemeType(colorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [isSystemTheme]);

  // Initialize theme on mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      handleSystemThemeChange(colorScheme);
    });

    return () => subscription?.remove();
  }, [handleSystemThemeChange]);

  return {
    theme,
    themeType,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
    setSystemTheme,
    isSystemTheme,
  };
};

export default useTheme;