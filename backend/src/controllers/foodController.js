const { query, getClient } = require('../config/database');
const logger = require('../services/logger');
const geminiService = require('../services/geminiService');

/**
 * Scan food image using Gemini Vision API
 */
const scanFood = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Image data required',
      });
    }

    logger.info('Processing food scan request');

    // Analyze image with Gemini
    const scanResult = await geminiService.analyzeFoodImage(imageBase64);

    if (!scanResult.is_food || scanResult.foods.length === 0) {
      return res.json({
        success: true,
        data: {
          isFood: false,
          message: 'No food detected in image',
        },
      });
    }

    // Increment scan count (done by middleware)

    // Match detected foods with database
    const enrichedFoods = await Promise.all(
      scanResult.foods.map(async (food) => {
        // Try to find matching food in database
        const dbResult = await query(
          `SELECT * FROM foods 
           WHERE LOWER(name) LIKE LOWER($1) OR LOWER(name_vi) LIKE LOWER($1)
           LIMIT 1`,
          [`%${food.name}%`]
        );

        if (dbResult.rows.length > 0) {
          const dbFood = dbResult.rows[0];
          return {
            ...food,
            foodId: dbFood.id,
            fromDatabase: true,
            verified: dbFood.is_verified,
          };
        }

        return {
          ...food,
          fromDatabase: false,
          verified: false,
        };
      })
    );

    res.json({
      success: true,
      data: {
        isFood: true,
        foods: enrichedFoods,
        description: scanResult.description,
      },
    });
  } catch (error) {
    logger.error('Scan food error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan food',
    });
  }
};

/**
 * Log food entry
 */
const logFood = async (req, res) => {
  try {
    const {
      foodId,
      foodName,
      mealType,
      servingSize = 1,
      servingUnit,
      calories,
      protein = 0,
      carbohydrates = 0,
      fats = 0,
      fiber = 0,
      imageUrl,
      scanned = false,
      confidenceScore,
      notes,
    } = req.body;

    const result = await query(
      `INSERT INTO food_logs 
       (user_id, food_id, food_name, meal_type, serving_size, serving_unit,
        calories, protein, carbohydrates, fats, fiber, image_url, scanned, 
        confidence_score, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        req.userId, foodId, foodName, mealType, servingSize, servingUnit,
        calories, protein, carbohydrates, fats, fiber, imageUrl, scanned,
        confidenceScore, notes,
      ]
    );

    // Update food popularity if from database
    if (foodId) {
      await query(
        'UPDATE foods SET popularity_score = popularity_score + 1 WHERE id = $1',
        [foodId]
      );
    }

    // Check achievements
    // TODO: Implement achievement checking

    logger.info(`Food logged by user ${req.userId}: ${foodName}`);

    res.status(201).json({
      success: true,
      message: 'Food logged successfully',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Log food error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log food',
    });
  }
};

/**
 * Get food logs for a date range
 */
const getFoodLogs = async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query;
    const userId = req.userId;

    let queryText = 'SELECT * FROM food_logs WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    if (startDate) {
      queryText += ` AND logged_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND logged_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (mealType) {
      queryText += ` AND meal_type = $${paramIndex}`;
      queryParams.push(mealType);
      paramIndex++;
    }

    queryText += ' ORDER BY logged_at DESC';

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get food logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get food logs',
    });
  }
};

/**
 * Get daily nutrition summary
 */
const getDailyNutrition = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT 
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbohydrates) as total_carbs,
        SUM(fats) as total_fats,
        SUM(fiber) as total_fiber,
        COUNT(*) as meal_count
       FROM food_logs
       WHERE user_id = $1 AND DATE(logged_at) = $2`,
      [req.userId, targetDate]
    );

    // Get user goals
    const userResult = await query(
      `SELECT daily_calorie_goal, protein_goal, carbs_goal, fats_goal, fiber_goal
       FROM users WHERE id = $1`,
      [req.userId]
    );

    const goals = userResult.rows[0] || {};
    const nutrition = result.rows[0] || {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0,
      total_fiber: 0,
      meal_count: 0,
    };

    res.json({
      success: true,
      data: {
        date: targetDate,
        nutrition: {
          calories: Math.round(nutrition.total_calories || 0),
          protein: Math.round(nutrition.total_protein || 0),
          carbs: Math.round(nutrition.total_carbs || 0),
          fats: Math.round(nutrition.total_fats || 0),
          fiber: Math.round(nutrition.total_fiber || 0),
        },
        goals: {
          calories: goals.daily_calorie_goal,
          protein: goals.protein_goal,
          carbs: goals.carbs_goal,
          fats: goals.fats_goal,
          fiber: goals.fiber_goal,
        },
        progress: {
          calories: goals.daily_calorie_goal ? (nutrition.total_calories / goals.daily_calorie_goal) * 100 : 0,
          protein: goals.protein_goal ? (nutrition.total_protein / goals.protein_goal) * 100 : 0,
          carbs: goals.carbs_goal ? (nutrition.total_carbs / goals.carbs_goal) * 100 : 0,
          fats: goals.fats_goal ? (nutrition.total_fats / goals.fats_goal) * 100 : 0,
        },
        mealCount: nutrition.meal_count,
      },
    });
  } catch (error) {
    logger.error('Get daily nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily nutrition',
    });
  }
};

/**
 * Delete food log
 */
const deleteFoodLog = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM food_logs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food log not found',
      });
    }

    res.json({
      success: true,
      message: 'Food log deleted successfully',
    });
  } catch (error) {
    logger.error('Delete food log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete food log',
    });
  }
};

/**
 * Search foods in database
 */
const searchFoods = async (req, res) => {
  try {
    const { q, category, cuisine, limit = 20, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM foods WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (q) {
      queryText += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(name_vi) LIKE LOWER($${paramIndex}))`;
      queryParams.push(`%${q}%`);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (cuisine) {
      queryText += ` AND cuisine = $${paramIndex}`;
      queryParams.push(cuisine);
      paramIndex++;
    }

    queryText += ` ORDER BY popularity_score DESC, name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM foods WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (q) {
      countQuery += ` AND (LOWER(name) LIKE LOWER($${countIndex}) OR LOWER(name_vi) LIKE LOWER($${countIndex}))`;
      countParams.push(`%${q}%`);
      countIndex++;
    }

    if (category) {
      countQuery += ` AND category = $${countIndex}`;
      countParams.push(category);
      countIndex++;
    }

    if (cuisine) {
      countQuery += ` AND cuisine = $${countIndex}`;
      countParams.push(cuisine);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        foods: result.rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + result.rows.length < total,
        },
      },
    });
  } catch (error) {
    logger.error('Search foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search foods',
    });
  }
};

/**
 * Get food by ID
 */
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM foods WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Get food by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get food',
    });
  }
};

/**
 * Get favorite foods
 */
const getFavorites = async (req, res) => {
  try {
    const result = await query(
      `SELECT f.*, ff.created_at as favorited_at
       FROM favorite_foods ff
       INNER JOIN foods f ON ff.food_id = f.id
       WHERE ff.user_id = $1
       ORDER BY ff.created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites',
    });
  }
};

/**
 * Toggle favorite food
 */
const toggleFavorite = async (req, res) => {
  try {
    const { foodId } = req.params;

    // Check if already favorited
    const existing = await query(
      'SELECT id FROM favorite_foods WHERE user_id = $1 AND food_id = $2',
      [req.userId, foodId]
    );

    if (existing.rows.length > 0) {
      // Remove from favorites
      await query(
        'DELETE FROM favorite_foods WHERE user_id = $1 AND food_id = $2',
        [req.userId, foodId]
      );
      
      res.json({
        success: true,
        message: 'Removed from favorites',
        isFavorite: false,
      });
    } else {
      // Add to favorites
      await query(
        'INSERT INTO favorite_foods (user_id, food_id) VALUES ($1, $2)',
        [req.userId, foodId]
      );
      
      res.json({
        success: true,
        message: 'Added to favorites',
        isFavorite: true,
      });
    }
  } catch (error) {
    logger.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
    });
  }
};

module.exports = {
  scanFood,
  logFood,
  getFoodLogs,
  getDailyNutrition,
  deleteFoodLog,
  searchFoods,
  getFoodById,
  getFavorites,
  toggleFavorite,
};
