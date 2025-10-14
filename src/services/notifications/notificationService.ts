import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Config } from '@/constants/config';
import { StorageService } from '../storage/storageService';
import { PermissionManager } from '@/utils/permissions';

export interface NotificationSettings {
  mealReminders: boolean;
  waterReminders: boolean;
  exerciseReminders: boolean;
  socialUpdates: boolean;
  weeklyReports: boolean;
  achievements: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  trigger: Notifications.NotificationTriggerInput;
  categoryId?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  options?: {
    opensAppToForeground?: boolean;
    isAuthenticationRequired?: boolean;
    isDestructive?: boolean;
  };
}

export interface NotificationCategory {
  id: string;
  actions: NotificationAction[];
  options?: {
    customDismissAction?: boolean;
    allowInCarPlay?: boolean;
    allowAnnouncement?: boolean;
    showTitle?: boolean;
    showSubtitle?: boolean;
  };
}

export class NotificationService {
  private static isInitialized = false;
  private static settings: NotificationSettings = {
    mealReminders: true,
    waterReminders: true,
    exerciseReminders: true,
    socialUpdates: true,
    weeklyReports: true,
    achievements: true,
    sound: true,
    vibration: true,
    badge: true,
  };

  /**
   * Initialize notification service
   */
  static async initialize(): Promise<void> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: this.settings.sound,
          shouldSetBadge: this.settings.badge,
        }),
      });

      // Load stored settings
      const storedSettings = await StorageService.getItem<NotificationSettings>('notification_settings');
      if (storedSettings) {
        this.settings = { ...this.settings, ...storedSettings };
      }

      // Set up notification categories
      await this.setupNotificationCategories();

      // Request permissions
      await this.requestPermissions();

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const permission = await PermissionManager.requestNotificationPermission();
      return permission.granted;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Check notification permissions
   */
  static async checkPermissions(): Promise<boolean> {
    try {
      const permission = await PermissionManager.getNotificationPermissionStatus();
      return permission.granted;
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      return false;
    }
  }

  /**
   * Update notification settings
   */
  static async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await StorageService.setItem('notification_settings', this.settings);

    // Update notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: this.settings.sound,
        shouldSetBadge: this.settings.badge,
      }),
    });
  }

  /**
   * Get current notification settings
   */
  static getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Schedule a notification
   */
  static async scheduleNotification(notification: ScheduledNotification): Promise<string> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          categoryIdentifier: notification.categoryId,
          sound: this.settings.sound ? 'default' : undefined,
        },
        trigger: notification.trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Send immediate notification
   */
  static async sendNotification(
    title: string,
    body: string,
    data?: any,
    categoryId?: string
  ): Promise<string> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          categoryIdentifier: categoryId,
          sound: this.settings.sound ? 'default' : undefined,
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Schedule meal reminders
   */
  static async scheduleMealReminders(): Promise<void> {
    if (!this.settings.mealReminders) return;

    try {
      // Cancel existing meal reminders
      await this.cancelNotificationsByCategory('meal_reminder');

      const mealTimes = Config.NOTIFICATIONS.MEAL_REMINDERS;

      // Schedule breakfast reminder
      await this.scheduleNotification({
        id: 'breakfast_reminder',
        title: 'Đã đến giờ ăn sáng! 🌅',
        body: 'Hãy bắt đầu ngày mới với một bữa sáng bổ dưỡng nhé!',
        categoryId: 'meal_reminder',
        trigger: {
          hour: mealTimes.BREAKFAST.hour,
          minute: mealTimes.BREAKFAST.minute,
          repeats: true,
        },
      });

      // Schedule lunch reminder
      await this.scheduleNotification({
        id: 'lunch_reminder',
        title: 'Đã đến giờ ăn trưa! ☀️',
        body: 'Đừng quên bữa trưa để duy trì năng lượng cho cả ngày!',
        categoryId: 'meal_reminder',
        trigger: {
          hour: mealTimes.LUNCH.hour,
          minute: mealTimes.LUNCH.minute,
          repeats: true,
        },
      });

      // Schedule dinner reminder
      await this.scheduleNotification({
        id: 'dinner_reminder',
        title: 'Đã đến giờ ăn tối! 🌙',
        body: 'Hãy thưởng thức bữa tối ngon miệng và bổ dưỡng!',
        categoryId: 'meal_reminder',
        trigger: {
          hour: mealTimes.DINNER.hour,
          minute: mealTimes.DINNER.minute,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Failed to schedule meal reminders:', error);
    }
  }

  /**
   * Schedule water reminders
   */
  static async scheduleWaterReminders(): Promise<void> {
    if (!this.settings.waterReminders) return;

    try {
      // Cancel existing water reminders
      await this.cancelNotificationsByCategory('water_reminder');

      const waterSettings = Config.NOTIFICATIONS.WATER_REMINDERS;
      const interval = waterSettings.INTERVAL * 60 * 60; // Convert hours to seconds

      // Schedule water reminders throughout the day
      for (let hour = waterSettings.START_HOUR; hour <= waterSettings.END_HOUR; hour += waterSettings.INTERVAL) {
        await this.scheduleNotification({
          id: `water_reminder_${hour}`,
          title: 'Đã đến giờ uống nước! 💧',
          body: 'Hãy uống một ly nước để duy trì sức khỏe tốt nhất!',
          categoryId: 'water_reminder',
          trigger: {
            hour,
            minute: 0,
            repeats: true,
          },
        });
      }
    } catch (error) {
      console.error('Failed to schedule water reminders:', error);
    }
  }

  /**
   * Schedule exercise reminders
   */
  static async scheduleExerciseReminders(): Promise<void> {
    if (!this.settings.exerciseReminders) return;

    try {
      // Cancel existing exercise reminders
      await this.cancelNotificationsByCategory('exercise_reminder');

      // Schedule daily exercise reminder
      await this.scheduleNotification({
        id: 'daily_exercise_reminder',
        title: 'Đã đến giờ tập luyện! 💪',
        body: 'Hãy dành 30 phút để tập thể dục và chăm sóc sức khỏe!',
        categoryId: 'exercise_reminder',
        trigger: {
          hour: 18, // 6 PM
          minute: 0,
          repeats: true,
        },
      });

      // Schedule weekend workout reminder
      await this.scheduleNotification({
        id: 'weekend_exercise_reminder',
        title: 'Cuối tuần vui vẻ! 🏃‍♂️',
        body: 'Hãy tận dụng cuối tuần để tập luyện và thư giãn!',
        categoryId: 'exercise_reminder',
        trigger: {
          weekday: 7, // Sunday
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Failed to schedule exercise reminders:', error);
    }
  }

  /**
   * Send achievement notification
   */
  static async sendAchievementNotification(
    achievementName: string,
    achievementIcon: string,
    points: number
  ): Promise<void> {
    if (!this.settings.achievements) return;

    try {
      await this.sendNotification(
        `Chúc mừng! ${achievementIcon}`,
        `Bạn đã mở khóa thành tựu "${achievementName}" và nhận được ${points} điểm!`,
        {
          type: 'achievement',
          achievementName,
          points,
        },
        'achievement'
      );
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
    }
  }

  /**
   * Send goal completion notification
   */
  static async sendGoalCompletionNotification(
    goalType: string,
    goalName: string
  ): Promise<void> {
    try {
      const messages = {
        calories: 'Bạn đã hoàn thành mục tiêu calo hôm nay! 🎯',
        water: 'Bạn đã uống đủ nước trong ngày! 💧',
        exercise: 'Bạn đã hoàn thành mục tiêu tập luyện! 💪',
        weight: 'Chúc mừng! Bạn đã đạt được mục tiêu cân nặng! ⚖️',
      };

      const message = messages[goalType as keyof typeof messages] || `Bạn đã hoàn thành mục tiêu "${goalName}"!`;

      await this.sendNotification(
        'Mục tiêu hoàn thành! 🎉',
        message,
        {
          type: 'goal_completion',
          goalType,
          goalName,
        },
        'goal_completion'
      );
    } catch (error) {
      console.error('Failed to send goal completion notification:', error);
    }
  }

  /**
   * Send weekly report notification
   */
  static async sendWeeklyReportNotification(): Promise<void> {
    if (!this.settings.weeklyReports) return;

    try {
      await this.sendNotification(
        'Báo cáo tuần của bạn đã sẵn sàng! 📊',
        'Xem tiến trình và thành tựu của bạn trong tuần qua.',
        {
          type: 'weekly_report',
        },
        'weekly_report'
      );
    } catch (error) {
      console.error('Failed to send weekly report notification:', error);
    }
  }

  /**
   * Send social notification
   */
  static async sendSocialNotification(
    type: 'like' | 'comment' | 'follow' | 'challenge',
    message: string,
    data?: any
  ): Promise<void> {
    if (!this.settings.socialUpdates) return;

    try {
      const titles = {
        like: 'Ai đó đã thích bài viết của bạn! ❤️',
        comment: 'Bạn có bình luận mới! 💬',
        follow: 'Bạn có người theo dõi mới! 👥',
        challenge: 'Thử thách mới dành cho bạn! 🏆',
      };

      await this.sendNotification(
        titles[type],
        message,
        {
          type: 'social',
          subType: type,
          ...data,
        },
        'social'
      );
    } catch (error) {
      console.error('Failed to send social notification:', error);
    }
  }

  /**
   * Setup notification categories
   */
  private static async setupNotificationCategories(): Promise<void> {
    try {
      const categories: NotificationCategory[] = [
        {
          id: 'meal_reminder',
          actions: [
            {
              id: 'log_meal',
              title: 'Ghi nhận bữa ăn',
              options: { opensAppToForeground: true },
            },
            {
              id: 'snooze',
              title: 'Nhắc lại sau',
            },
          ],
        },
        {
          id: 'water_reminder',
          actions: [
            {
              id: 'log_water',
              title: 'Đã uống nước',
              options: { opensAppToForeground: false },
            },
            {
              id: 'snooze',
              title: 'Nhắc lại sau',
            },
          ],
        },
        {
          id: 'exercise_reminder',
          actions: [
            {
              id: 'start_workout',
              title: 'Bắt đầu tập',
              options: { opensAppToForeground: true },
            },
            {
              id: 'skip_today',
              title: 'Bỏ qua hôm nay',
            },
          ],
        },
        {
          id: 'achievement',
          actions: [
            {
              id: 'view_achievement',
              title: 'Xem thành tựu',
              options: { opensAppToForeground: true },
            },
            {
              id: 'share_achievement',
              title: 'Chia sẻ',
              options: { opensAppToForeground: true },
            },
          ],
        },
        {
          id: 'goal_completion',
          actions: [
            {
              id: 'view_progress',
              title: 'Xem tiến trình',
              options: { opensAppToForeground: true },
            },
            {
              id: 'share_success',
              title: 'Chia sẻ thành công',
              options: { opensAppToForeground: true },
            },
          ],
        },
        {
          id: 'social',
          actions: [
            {
              id: 'view_notification',
              title: 'Xem',
              options: { opensAppToForeground: true },
            },
            {
              id: 'reply',
              title: 'Trả lời',
              options: { opensAppToForeground: true },
            },
          ],
        },
        {
          id: 'weekly_report',
          actions: [
            {
              id: 'view_report',
              title: 'Xem báo cáo',
              options: { opensAppToForeground: true },
            },
            {
              id: 'share_report',
              title: 'Chia sẻ',
              options: { opensAppToForeground: true },
            },
          ],
        },
      ];

      await Notifications.setNotificationCategoryAsync(
        categories[0].id,
        categories[0].actions.map(action => ({
          identifier: action.id,
          buttonTitle: action.title,
          options: action.options,
        }))
      );
    } catch (error) {
      console.error('Failed to setup notification categories:', error);
    }
  }

  /**
   * Cancel notifications by category
   */
  private static async cancelNotificationsByCategory(categoryId: string): Promise<void> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();
      const categoryNotifications = scheduledNotifications.filter(
        notification => notification.content.categoryIdentifier === categoryId
      );

      for (const notification of categoryNotifications) {
        await this.cancelNotification(notification.identifier);
      }
    } catch (error) {
      console.error(`Failed to cancel notifications for category ${categoryId}:`, error);
    }
  }

  /**
   * Handle notification response
   */
  static handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { actionIdentifier, notification } = response;
    const { data, categoryIdentifier } = notification.request.content;

    console.log('Notification response:', {
      actionIdentifier,
      categoryIdentifier,
      data,
    });

    // Handle different notification actions
    switch (actionIdentifier) {
      case 'log_meal':
        // Navigate to food logging screen
        break;
      case 'log_water':
        // Log water intake
        break;
      case 'start_workout':
        // Navigate to exercise screen
        break;
      case 'view_achievement':
        // Navigate to achievements screen
        break;
      case 'view_progress':
        // Navigate to progress screen
        break;
      case 'view_notification':
        // Navigate to relevant screen based on data
        break;
      default:
        // Default action (usually opens the app)
        break;
    }
  }

  /**
   * Get notification badge count
   */
  static async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count
   */
  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }
}

export default NotificationService;