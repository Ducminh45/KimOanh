import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService, NotificationSettings } from '@/services/notifications/notificationService';
import { PermissionManager } from '@/utils/permissions';
import { AnalyticsService } from '@/services/analytics/analyticsService';

export interface UseNotificationsReturn {
  // Permission state
  hasPermission: boolean;
  isLoading: boolean;
  
  // Settings
  settings: NotificationSettings;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  
  // Scheduling
  scheduleMealReminders: () => Promise<void>;
  scheduleWaterReminders: () => Promise<void>;
  scheduleExerciseReminders: () => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  
  // Immediate notifications
  sendAchievementNotification: (achievementName: string, achievementIcon: string, points: number) => Promise<void>;
  sendGoalCompletionNotification: (goalType: string, goalName: string) => Promise<void>;
  
  // Badge management
  badgeCount: number;
  setBadgeCount: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;
  
  // Utilities
  getScheduledNotifications: () => Promise<Notifications.NotificationRequest[]>;
  clearAllNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(NotificationService.getSettings());
  const [badgeCount, setBadgeCountState] = useState(0);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const granted = await NotificationService.requestPermissions();
      setHasPermission(granted);
      
      if (granted) {
        // Initialize notification service if permission granted
        await NotificationService.initialize();
        
        // Track analytics
        AnalyticsService.trackEvent('notification_permission_granted');
      } else {
        AnalyticsService.trackEvent('notification_permission_denied');
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      await NotificationService.updateSettings(newSettings);
      setSettings(updatedSettings);
      
      // Re-schedule reminders with new settings
      if (newSettings.mealReminders !== undefined) {
        if (newSettings.mealReminders) {
          await NotificationService.scheduleMealReminders();
        } else {
          // Cancel meal reminders if disabled
          const scheduled = await NotificationService.getScheduledNotifications();
          const mealReminders = scheduled.filter(n => 
            n.content.categoryIdentifier === 'meal_reminder'
          );
          
          for (const reminder of mealReminders) {
            await NotificationService.cancelNotification(reminder.identifier);
          }
        }
      }
      
      if (newSettings.waterReminders !== undefined) {
        if (newSettings.waterReminders) {
          await NotificationService.scheduleWaterReminders();
        } else {
          // Cancel water reminders if disabled
          const scheduled = await NotificationService.getScheduledNotifications();
          const waterReminders = scheduled.filter(n => 
            n.content.categoryIdentifier === 'water_reminder'
          );
          
          for (const reminder of waterReminders) {
            await NotificationService.cancelNotification(reminder.identifier);
          }
        }
      }
      
      if (newSettings.exerciseReminders !== undefined) {
        if (newSettings.exerciseReminders) {
          await NotificationService.scheduleExerciseReminders();
        } else {
          // Cancel exercise reminders if disabled
          const scheduled = await NotificationService.getScheduledNotifications();
          const exerciseReminders = scheduled.filter(n => 
            n.content.categoryIdentifier === 'exercise_reminder'
          );
          
          for (const reminder of exerciseReminders) {
            await NotificationService.cancelNotification(reminder.identifier);
          }
        }
      }
      
      // Track analytics
      AnalyticsService.trackEvent('notification_settings_updated', {
        settings_changed: Object.keys(newSettings),
      });
      
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }, [settings]);

  // Schedule meal reminders
  const scheduleMealReminders = useCallback(async () => {
    try {
      if (!hasPermission || !settings.mealReminders) return;
      
      await NotificationService.scheduleMealReminders();
      
      AnalyticsService.trackEvent('meal_reminders_scheduled');
    } catch (error) {
      console.error('Failed to schedule meal reminders:', error);
      throw error;
    }
  }, [hasPermission, settings.mealReminders]);

  // Schedule water reminders
  const scheduleWaterReminders = useCallback(async () => {
    try {
      if (!hasPermission || !settings.waterReminders) return;
      
      await NotificationService.scheduleWaterReminders();
      
      AnalyticsService.trackEvent('water_reminders_scheduled');
    } catch (error) {
      console.error('Failed to schedule water reminders:', error);
      throw error;
    }
  }, [hasPermission, settings.waterReminders]);

  // Schedule exercise reminders
  const scheduleExerciseReminders = useCallback(async () => {
    try {
      if (!hasPermission || !settings.exerciseReminders) return;
      
      await NotificationService.scheduleExerciseReminders();
      
      AnalyticsService.trackEvent('exercise_reminders_scheduled');
    } catch (error) {
      console.error('Failed to schedule exercise reminders:', error);
      throw error;
    }
  }, [hasPermission, settings.exerciseReminders]);

  // Cancel all reminders
  const cancelAllReminders = useCallback(async () => {
    try {
      await NotificationService.cancelAllNotifications();
      
      AnalyticsService.trackEvent('all_reminders_cancelled');
    } catch (error) {
      console.error('Failed to cancel all reminders:', error);
      throw error;
    }
  }, []);

  // Send achievement notification
  const sendAchievementNotification = useCallback(async (
    achievementName: string,
    achievementIcon: string,
    points: number
  ) => {
    try {
      if (!hasPermission || !settings.achievements) return;
      
      await NotificationService.sendAchievementNotification(
        achievementName,
        achievementIcon,
        points
      );
      
      AnalyticsService.trackEvent('achievement_notification_sent', {
        achievement_name: achievementName,
        points,
      });
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
    }
  }, [hasPermission, settings.achievements]);

  // Send goal completion notification
  const sendGoalCompletionNotification = useCallback(async (
    goalType: string,
    goalName: string
  ) => {
    try {
      if (!hasPermission) return;
      
      await NotificationService.sendGoalCompletionNotification(goalType, goalName);
      
      AnalyticsService.trackEvent('goal_completion_notification_sent', {
        goal_type: goalType,
        goal_name: goalName,
      });
    } catch (error) {
      console.error('Failed to send goal completion notification:', error);
    }
  }, [hasPermission]);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await NotificationService.setBadgeCount(count);
      setBadgeCountState(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }, []);

  // Clear badge
  const clearBadge = useCallback(async () => {
    await setBadgeCount(0);
  }, [setBadgeCount]);

  // Get scheduled notifications
  const getScheduledNotifications = useCallback(async () => {
    try {
      return await NotificationService.getScheduledNotifications();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await NotificationService.clearAllNotifications();
      setBadgeCountState(0);
      
      AnalyticsService.trackEvent('all_notifications_cleared');
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }, []);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const granted = await NotificationService.checkPermissions();
        setHasPermission(granted);
        
        if (granted) {
          // Get current badge count
          const currentBadgeCount = await NotificationService.getBadgeCount();
          setBadgeCountState(currentBadgeCount);
        }
      } catch (error) {
        console.error('Failed to check notification permissions:', error);
      }
    };
    
    checkPermission();
  }, []);

  // Set up notification response handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      NotificationService.handleNotificationResponse(response);
      
      // Track analytics
      AnalyticsService.trackEvent('notification_response', {
        action_identifier: response.actionIdentifier,
        category_identifier: response.notification.request.content.categoryIdentifier,
      });
    });

    return () => subscription.remove();
  }, []);

  // Set up notification received handler (for foreground notifications)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      // Track analytics
      AnalyticsService.trackEvent('notification_received', {
        category_identifier: notification.request.content.categoryIdentifier,
        is_foreground: true,
      });
    });

    return () => subscription.remove();
  }, []);

  // Schedule initial reminders when permission is granted and settings are enabled
  useEffect(() => {
    if (hasPermission) {
      const scheduleInitialReminders = async () => {
        try {
          if (settings.mealReminders) {
            await scheduleMealReminders();
          }
          
          if (settings.waterReminders) {
            await scheduleWaterReminders();
          }
          
          if (settings.exerciseReminders) {
            await scheduleExerciseReminders();
          }
        } catch (error) {
          console.error('Failed to schedule initial reminders:', error);
        }
      };
      
      scheduleInitialReminders();
    }
  }, [hasPermission, settings.mealReminders, settings.waterReminders, settings.exerciseReminders]);

  return {
    // Permission state
    hasPermission,
    isLoading,
    
    // Settings
    settings,
    
    // Actions
    requestPermission,
    updateSettings,
    
    // Scheduling
    scheduleMealReminders,
    scheduleWaterReminders,
    scheduleExerciseReminders,
    cancelAllReminders,
    
    // Immediate notifications
    sendAchievementNotification,
    sendGoalCompletionNotification,
    
    // Badge management
    badgeCount,
    setBadgeCount,
    clearBadge,
    
    // Utilities
    getScheduledNotifications,
    clearAllNotifications,
  };
};

export default useNotifications;