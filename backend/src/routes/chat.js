const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');
const geminiService = require('../services/geminiService');
const logger = require('../services/logger');

/**
 * @route   POST /api/chat/message
 * @desc    Send message to AI chatbot
 * @access  Private
 */
router.post('/message', authenticate, aiLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Get user context
    const userResult = await query(
      `SELECT full_name, goal, daily_calorie_goal, height, weight, activity_level
       FROM users WHERE id = $1`,
      [req.userId]
    );

    const userContext = userResult.rows[0] || {};

    // Generate AI response
    const aiResponse = await geminiService.generateChatResponse(message, {
      fullName: userContext.full_name,
      goal: userContext.goal,
      dailyCalorieGoal: userContext.daily_calorie_goal,
      height: userContext.height,
      weight: userContext.weight,
      activityLevel: userContext.activity_level,
    });

    // Save chat message
    const chatResult = await query(
      'INSERT INTO chat_messages (user_id, message, response) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, message, aiResponse]
    );

    // Get quick reply suggestions
    const suggestions = await geminiService.getQuickReplySuggestions(aiResponse);

    res.json({
      success: true,
      data: {
        message: chatResult.rows[0],
        response: aiResponse,
        suggestions,
      },
    });
  } catch (error) {
    logger.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
    });
  }
});

/**
 * @route   GET /api/chat/history
 * @desc    Get chat history
 * @access  Private
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT * FROM chat_messages
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows.reverse(), // Reverse to show oldest first
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
    });
  }
});

/**
 * @route   DELETE /api/chat/history
 * @desc    Clear chat history
 * @access  Private
 */
router.delete('/history', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM chat_messages WHERE user_id = $1', [req.userId]);

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    logger.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
    });
  }
});

module.exports = router;
