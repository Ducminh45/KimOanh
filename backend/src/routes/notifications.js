const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pushService = require('../services/pushNotificationService');
const logger = require('../services/logger');

/**
 * Register device token
 * POST /api/notifications/register
 */
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Token and platform are required',
      });
    }

    await pushService.saveDeviceToken(userId, token, platform);

    // Subscribe to general topics
    await pushService.subscribeToTopic([token], 'general');
    await pushService.subscribeToTopic([token], `user_${userId}`);

    res.json({
      success: true,
      message: 'Device registered successfully',
    });
  } catch (error) {
    logger.error('Register device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
    });
  }
});

/**
 * Test push notification
 * POST /api/notifications/test
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tokens = await pushService.getUserTokens(userId);

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No device tokens found',
      });
    }

    const notification = {
      title: '🧪 Test Notification',
      body: 'This is a test notification from NutriScanVN!',
      options: { sound: 'default' },
    };

    const result = await pushService.sendToDevices(tokens, notification, {
      type: 'test',
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    });
  }
});

/**
 * Schedule reminder
 * POST /api/notifications/reminder
 */
router.post('/reminder', authenticateToken, async (req, res) => {
  try {
    const { type, customData } = req.body;
    const userId = req.user.id;

    if (!['water', 'meal', 'exercise'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reminder type',
      });
    }

    const result = await pushService.sendReminder(userId, type, customData);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Schedule reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule reminder',
    });
  }
});

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      waterReminders,
      mealReminders,
      exerciseReminders,
      communityNotifications,
      achievementNotifications,
    } = req.body;

    // Save preferences to database
    const query = `
      INSERT INTO notification_preferences 
      (user_id, water_reminders, meal_reminders, exercise_reminders, 
       community_notifications, achievement_notifications)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        water_reminders = $2,
        meal_reminders = $3,
        exercise_reminders = $4,
        community_notifications = $5,
        achievement_notifications = $6,
        updated_at = CURRENT_TIMESTAMP
    `;

    await require('../config/database').query(query, [
      userId,
      waterReminders ?? true,
      mealReminders ?? true,
      exerciseReminders ?? true,
      communityNotifications ?? true,
      achievementNotifications ?? true,
    ]);

    res.json({
      success: true,
      message: 'Preferences updated',
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
    });
  }
});

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM notification_preferences WHERE user_id = $1
    `;

    const result = await require('../config/database').query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          waterReminders: true,
          mealReminders: true,
          exerciseReminders: true,
          communityNotifications: true,
          achievementNotifications: true,
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
    });
  }
});

/**
 * Unregister device
 * DELETE /api/notifications/device
 */
router.delete('/device', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    await pushService.removeDeviceToken(token);

    res.json({
      success: true,
      message: 'Device unregistered',
    });
  } catch (error) {
    logger.error('Unregister device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister device',
    });
  }
});

module.exports = router;
