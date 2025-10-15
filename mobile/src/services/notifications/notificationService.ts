import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Configure channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    return true;
  } catch (error) {
    console.error('Request notification permissions error:', error);
    return false;
  }
};

/**
 * Schedule water reminder notification
 */
export const scheduleWaterReminder = async (hour: number, minute: number): Promise<string | null> => {
  try {
    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Nhắc nhở uống nước',
        body: 'Đã đến giờ uống nước rồi! Hãy hydrat hóa cơ thể bạn.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    return id;
  } catch (error) {
    console.error('Schedule water reminder error:', error);
    return null;
  }
};

/**
 * Schedule meal reminder
 */
export const scheduleMealReminder = async (
  mealType: string,
  hour: number,
  minute: number
): Promise<string | null> => {
  try {
    const mealEmojis: { [key: string]: string } = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
    };

    const mealNames: { [key: string]: string } = {
      breakfast: 'bữa sáng',
      lunch: 'bữa trưa',
      dinner: 'bữa tối',
      snack: 'bữa phụ',
    };

    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${mealEmojis[mealType]} Nhắc nhở ${mealNames[mealType]}`,
        body: `Đừng quên ghi lại ${mealNames[mealType]} của bạn!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    return id;
  } catch (error) {
    console.error('Schedule meal reminder error:', error);
    return null;
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (
  title: string,
  body: string
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Send local notification error:', error);
  }
};

/**
 * Cancel notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Cancel notification error:', error);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Cancel all notifications error:', error);
  }
};

/**
 * Get scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Get scheduled notifications error:', error);
    return [];
  }
};

/**
 * Schedule daily goal reminder
 */
export const scheduleDailyGoalReminder = async (): Promise<void> => {
  try {
    // Morning reminder at 9 AM
    await scheduleWaterReminder(9, 0);
    
    // Lunch reminder at 12 PM
    await scheduleMealReminder('lunch', 12, 0);
    
    // Afternoon water reminder at 3 PM
    await scheduleWaterReminder(15, 0);
    
    // Dinner reminder at 6 PM
    await scheduleMealReminder('dinner', 18, 0);
    
    // Evening reminder at 9 PM
    await sendLocalNotification(
      '🌙 Kết thúc ngày',
      'Đừng quên ghi lại bữa tối và kiểm tra tiến trình hôm nay!'
    );
  } catch (error) {
    console.error('Schedule daily goal reminder error:', error);
  }
};

export default {
  requestNotificationPermissions,
  scheduleWaterReminder,
  scheduleMealReminder,
  sendLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  scheduleDailyGoalReminder,
};
