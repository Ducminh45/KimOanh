const admin = require('firebase-admin');
const db = require('../config/database');
const logger = require('./logger');

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      logger.info('Firebase Admin initialized');
    } else {
      logger.warn('Firebase service account not configured');
    }
  }
};

/**
 * Send push notification to single device
 */
const sendToDevice = async (token, notification, data = {}) => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...notification.options,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      token,
    };

    const response = await admin.messaging().send(message);
    logger.info('Push notification sent', { token, response });
    return { success: true, response };
  } catch (error) {
    logger.error('Push notification error', { error: error.message, token });
    
    // Handle invalid tokens
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      await removeDeviceToken(token);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to multiple devices
 */
const sendToDevices = async (tokens, notification, data = {}) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { success: false, error: 'No tokens provided' };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...notification.options,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    
    logger.info('Multicast notification sent', {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        await removeDeviceTokens(failedTokens);
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    logger.error('Multicast notification error', { error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Send to topic (for broadcast messages)
 */
const sendToTopic = async (topic, notification, data = {}) => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...notification.options,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      topic,
    };

    const response = await admin.messaging().send(message);
    logger.info('Topic notification sent', { topic, response });
    return { success: true, response };
  } catch (error) {
    logger.error('Topic notification error', { error: error.message, topic });
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe device to topic
 */
const subscribeToTopic = async (tokens, topic) => {
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    logger.info('Subscribed to topic', { topic, successCount: response.successCount });
    return { success: true, successCount: response.successCount };
  } catch (error) {
    logger.error('Subscribe to topic error', { error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Unsubscribe device from topic
 */
const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    logger.info('Unsubscribed from topic', { topic, successCount: response.successCount });
    return { success: true, successCount: response.successCount };
  } catch (error) {
    logger.error('Unsubscribe from topic error', { error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Save device token to database
 */
const saveDeviceToken = async (userId, token, platform) => {
  try {
    const query = `
      INSERT INTO device_tokens (user_id, token, platform)
      VALUES ($1, $2, $3)
      ON CONFLICT (token) 
      DO UPDATE SET user_id = $1, platform = $2, updated_at = CURRENT_TIMESTAMP
    `;
    
    await db.query(query, [userId, token, platform]);
    logger.info('Device token saved', { userId, platform });
  } catch (error) {
    logger.error('Save device token error', { error: error.message });
    throw error;
  }
};

/**
 * Get user device tokens
 */
const getUserTokens = async (userId) => {
  try {
    const query = 'SELECT token FROM device_tokens WHERE user_id = $1 AND is_active = true';
    const result = await db.query(query, [userId]);
    return result.rows.map(row => row.token);
  } catch (error) {
    logger.error('Get user tokens error', { error: error.message });
    return [];
  }
};

/**
 * Remove invalid device token
 */
const removeDeviceToken = async (token) => {
  try {
    const query = 'UPDATE device_tokens SET is_active = false WHERE token = $1';
    await db.query(query, [token]);
    logger.info('Device token removed', { token });
  } catch (error) {
    logger.error('Remove device token error', { error: error.message });
  }
};

/**
 * Remove multiple invalid tokens
 */
const removeDeviceTokens = async (tokens) => {
  try {
    const query = 'UPDATE device_tokens SET is_active = false WHERE token = ANY($1)';
    await db.query(query, [tokens]);
    logger.info('Multiple device tokens removed', { count: tokens.length });
  } catch (error) {
    logger.error('Remove device tokens error', { error: error.message });
  }
};

/**
 * Send reminder notification
 */
const sendReminder = async (userId, type, customData = {}) => {
  const tokens = await getUserTokens(userId);
  
  if (tokens.length === 0) {
    return { success: false, error: 'No device tokens found' };
  }

  const notifications = {
    water: {
      title: '💧 Uống nước đi bạn!',
      body: 'Đã đến giờ uống nước rồi. Hãy uống đủ 8 ly mỗi ngày nhé!',
      options: { icon: 'water', sound: 'default' },
    },
    meal: {
      title: '🍽️ Đến giờ ăn rồi!',
      body: 'Đã đến giờ bữa ăn của bạn. Nhớ ghi nhật ký nhé!',
      options: { icon: 'food', sound: 'default' },
    },
    exercise: {
      title: '🏃 Vận động nào!',
      body: 'Hãy dành 30 phút vận động để khỏe mạnh hơn!',
      options: { icon: 'exercise', sound: 'default' },
    },
  };

  const notification = notifications[type] || notifications.water;
  
  return sendToDevices(tokens, notification, {
    type,
    ...customData,
  });
};

/**
 * Send achievement notification
 */
const sendAchievementNotification = async (userId, achievement) => {
  const tokens = await getUserTokens(userId);
  
  if (tokens.length === 0) {
    return { success: false };
  }

  const notification = {
    title: '🏆 Thành tựu mới!',
    body: `Chúc mừng! Bạn đã đạt được: ${achievement.name}`,
    options: { 
      icon: 'trophy',
      sound: 'achievement',
      badge: 1,
    },
  };

  return sendToDevices(tokens, notification, {
    type: 'achievement',
    achievementId: achievement.id,
  });
};

/**
 * Send community notification (like, comment)
 */
const sendCommunityNotification = async (userId, type, data) => {
  const tokens = await getUserTokens(userId);
  
  if (tokens.length === 0) {
    return { success: false };
  }

  const notifications = {
    like: {
      title: '❤️ Có người thích bài viết của bạn',
      body: `${data.userName} đã thích bài viết của bạn`,
    },
    comment: {
      title: '💬 Bình luận mới',
      body: `${data.userName}: ${data.commentText}`,
    },
    follow: {
      title: '👥 Người theo dõi mới',
      body: `${data.userName} đã theo dõi bạn`,
    },
  };

  const notification = notifications[type];
  if (!notification) return { success: false };

  return sendToDevices(tokens, notification, {
    type: `community_${type}`,
    ...data,
  });
};

/**
 * Send goal progress notification
 */
const sendGoalProgressNotification = async (userId, progress) => {
  const tokens = await getUserTokens(userId);
  
  if (tokens.length === 0) {
    return { success: false };
  }

  let body;
  if (progress >= 100) {
    body = '🎉 Tuyệt vời! Bạn đã hoàn thành mục tiêu hôm nay!';
  } else if (progress >= 75) {
    body = `💪 Sắp đến đích rồi! Bạn đã hoàn thành ${progress}%`;
  } else if (progress >= 50) {
    body = `👍 Bạn đã đi được nửa đường! ${progress}% rồi!`;
  } else {
    return { success: false }; // Don't send for < 50%
  }

  const notification = {
    title: '🎯 Tiến độ mục tiêu',
    body,
    options: { icon: 'target', sound: 'default' },
  };

  return sendToDevices(tokens, notification, {
    type: 'goal_progress',
    progress,
  });
};

// Initialize on module load
initializeFirebase();

module.exports = {
  sendToDevice,
  sendToDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  saveDeviceToken,
  getUserTokens,
  removeDeviceToken,
  sendReminder,
  sendAchievementNotification,
  sendCommunityNotification,
  sendGoalProgressNotification,
};
