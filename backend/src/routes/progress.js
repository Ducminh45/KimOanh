const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const {
  validateWaterLog,
  validateExerciseLog,
  validateWeightLog,
  validateUUID,
  validateDateRange,
} = require('../middleware/validation');
const logger = require('../services/logger');

/**
 * @route   POST /api/progress/water
 * @desc    Log water intake
 * @access  Private
 */
router.post('/water', authenticate, validateWaterLog, async (req, res) => {
  try {
    const { amountMl } = req.body;

    const result = await query(
      'INSERT INTO water_logs (user_id, amount_ml) VALUES ($1, $2) RETURNING *',
      [req.userId, amountMl]
    );

    res.status(201).json({
      success: true,
      message: 'Water logged successfully',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Log water error:', error);
    res.status(500).json({ success: false, message: 'Failed to log water' });
  }
});

/**
 * @route   GET /api/progress/water
 * @desc    Get water logs
 * @access  Private
 */
router.get('/water', authenticate, validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const date = startDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT SUM(amount_ml) as total_ml, COUNT(*) as log_count
       FROM water_logs
       WHERE user_id = $1 AND DATE(logged_at) = $2`,
      [req.userId, date]
    );

    const userResult = await query(
      'SELECT water_goal FROM users WHERE id = $1',
      [req.userId]
    );

    const goal = userResult.rows[0]?.water_goal || 2000;
    const total = parseInt(result.rows[0]?.total_ml) || 0;

    res.json({
      success: true,
      data: {
        date,
        total_ml: total,
        goal_ml: goal,
        progress: (total / goal) * 100,
        log_count: parseInt(result.rows[0]?.log_count) || 0,
      },
    });
  } catch (error) {
    logger.error('Get water logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get water logs' });
  }
});

/**
 * @route   POST /api/progress/exercise
 * @desc    Log exercise
 * @access  Private
 */
router.post('/exercise', authenticate, validateExerciseLog, async (req, res) => {
  try {
    const { exerciseType, durationMinutes, intensity, notes } = req.body;

    // Calculate calories burned (rough estimate)
    const intensityMultipliers = { low: 3, medium: 5, high: 8 };
    const caloriesBurned = Math.round(durationMinutes * intensityMultipliers[intensity]);

    const result = await query(
      `INSERT INTO exercise_logs 
       (user_id, exercise_type, duration_minutes, intensity, calories_burned, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, exerciseType, durationMinutes, intensity, caloriesBurned, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Exercise logged successfully',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Log exercise error:', error);
    res.status(500).json({ success: false, message: 'Failed to log exercise' });
  }
});

/**
 * @route   GET /api/progress/exercise
 * @desc    Get exercise logs
 * @access  Private
 */
router.get('/exercise', authenticate, validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let queryText = 'SELECT * FROM exercise_logs WHERE user_id = $1';
    const queryParams = [req.userId];
    let paramIndex = 2;

    if (startDate) {
      queryText += ` AND logged_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND logged_at <= $${paramIndex}`;
      queryParams.push(endDate);
    }

    queryText += ' ORDER BY logged_at DESC';

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get exercise logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get exercise logs' });
  }
});

/**
 * @route   DELETE /api/progress/exercise/:id
 * @desc    Delete exercise log
 * @access  Private
 */
router.delete('/exercise/:id', authenticate, validateUUID, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM exercise_logs WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise log not found' });
    }

    res.json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    logger.error('Delete exercise error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete exercise' });
  }
});

/**
 * @route   POST /api/progress/weight
 * @desc    Log weight
 * @access  Private
 */
router.post('/weight', authenticate, validateWeightLog, async (req, res) => {
  try {
    const { weight, notes } = req.body;

    // Get user height to calculate BMI
    const userResult = await query('SELECT height FROM users WHERE id = $1', [req.userId]);
    const height = userResult.rows[0]?.height;

    let bmi = null;
    if (height) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 10) / 10;
    }

    const result = await query(
      'INSERT INTO weight_logs (user_id, weight, bmi, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, weight, bmi, notes]
    );

    // Update user current weight
    await query('UPDATE users SET weight = $1 WHERE id = $2', [weight, req.userId]);

    res.status(201).json({
      success: true,
      message: 'Weight logged successfully',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Log weight error:', error);
    res.status(500).json({ success: false, message: 'Failed to log weight' });
  }
});

/**
 * @route   GET /api/progress/weight
 * @desc    Get weight logs
 * @access  Private
 */
router.get('/weight', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM weight_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 100',
      [req.userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get weight logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get weight logs' });
  }
});

/**
 * @route   GET /api/progress/summary
 * @desc    Get progress summary (weekly, monthly)
 * @access  Private
 */
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const daysBack = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 90;

    // Get nutrition data for period
    const nutritionResult = await query(
      `SELECT DATE(logged_at) as date,
              SUM(calories) as total_calories,
              SUM(protein) as total_protein,
              SUM(carbohydrates) as total_carbs,
              SUM(fats) as total_fats
       FROM food_logs
       WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '${daysBack} days'
       GROUP BY DATE(logged_at)
       ORDER BY date`,
      [req.userId]
    );

    // Get water data
    const waterResult = await query(
      `SELECT DATE(logged_at) as date, SUM(amount_ml) as total_ml
       FROM water_logs
       WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '${daysBack} days'
       GROUP BY DATE(logged_at)
       ORDER BY date`,
      [req.userId]
    );

    // Get exercise data
    const exerciseResult = await query(
      `SELECT DATE(logged_at) as date,
              SUM(duration_minutes) as total_minutes,
              SUM(calories_burned) as total_calories_burned
       FROM exercise_logs
       WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '${daysBack} days'
       GROUP BY DATE(logged_at)
       ORDER BY date`,
      [req.userId]
    );

    res.json({
      success: true,
      data: {
        period,
        nutrition: nutritionResult.rows,
        water: waterResult.rows,
        exercise: exerciseResult.rows,
      },
    });
  } catch (error) {
    logger.error('Get progress summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get progress summary' });
  }
});

module.exports = router;
