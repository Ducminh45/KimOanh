const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');
const { validateUUID } = require('../middleware/validation');
const geminiService = require('../services/geminiService');
const logger = require('../services/logger');

/**
 * @route   POST /api/meal-plan/generate
 * @desc    Generate AI-powered meal plan
 * @access  Private
 */
router.post('/generate', authenticate, aiLimiter, async (req, res) => {
  const client = await getClient();
  
  try {
    // Get user profile and preferences
    const userResult = await query(
      `SELECT daily_calorie_goal, protein_goal, carbs_goal, fats_goal, 
              goal, activity_level
       FROM users WHERE id = $1`,
      [req.userId]
    );

    const preferencesResult = await query(
      'SELECT preference FROM dietary_preferences WHERE user_id = $1',
      [req.userId]
    );

    const allergiesResult = await query(
      'SELECT allergen FROM allergies WHERE user_id = $1',
      [req.userId]
    );

    const userProfile = {
      ...userResult.rows[0],
      dietaryPreferences: preferencesResult.rows.map(r => r.preference),
      allergies: allergiesResult.rows.map(r => r.allergen),
    };

    // Generate meal plan with AI
    const mealPlan = await geminiService.generateMealPlan(userProfile);

    // Save meal plan to database
    await client.query('BEGIN');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 6); // 7-day plan

    const planResult = await client.query(
      `INSERT INTO meal_plans 
       (user_id, name, start_date, end_date, target_calories, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.userId,
        'AI Generated Meal Plan',
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        userProfile.daily_calorie_goal,
        true,
      ]
    );

    const mealPlanId = planResult.rows[0].id;

    // Save meal plan items (simplified - would need full implementation)
    for (const day of mealPlan.weekPlan) {
      // Store breakfast, lunch, dinner, snacks for each day
      // This is simplified - full implementation would map to actual foods/recipes
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Meal plan generated successfully',
      data: {
        mealPlanId,
        weekPlan: mealPlan.weekPlan,
        tips: mealPlan.tips,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Generate meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meal plan',
    });
  } finally {
    client.release();
  }
});

/**
 * @route   GET /api/meal-plan/recipes
 * @desc    Get recipes with filters
 * @access  Private
 */
router.get('/recipes', authenticate, async (req, res) => {
  try {
    const { cuisine, difficulty, limit = 20, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM recipes WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (cuisine) {
      queryText += ` AND cuisine = $${paramIndex}`;
      queryParams.push(cuisine);
      paramIndex++;
    }

    if (difficulty) {
      queryText += ` AND difficulty = $${paramIndex}`;
      queryParams.push(difficulty);
      paramIndex++;
    }

    queryText += ` ORDER BY is_featured DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recipes',
    });
  }
});

/**
 * @route   GET /api/meal-plan/recipe/:id
 * @desc    Get recipe details with ingredients
 * @access  Private
 */
router.get('/recipe/:id', authenticate, validateUUID, async (req, res) => {
  try {
    const recipeResult = await query(
      'SELECT * FROM recipes WHERE id = $1',
      [req.params.id]
    );

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    const ingredientsResult = await query(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = $1',
      [req.params.id]
    );

    const recipe = {
      ...recipeResult.rows[0],
      ingredients: ingredientsResult.rows,
    };

    res.json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    logger.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recipe',
    });
  }
});

/**
 * @route   POST /api/meal-plan/recipe/:id/favorite
 * @desc    Toggle favorite recipe
 * @access  Private
 */
router.post('/recipe/:id/favorite', authenticate, validateUUID, async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Check if already favorited
    const existing = await query(
      'SELECT id FROM favorite_recipes WHERE user_id = $1 AND recipe_id = $2',
      [req.userId, recipeId]
    );

    if (existing.rows.length > 0) {
      await query(
        'DELETE FROM favorite_recipes WHERE user_id = $1 AND recipe_id = $2',
        [req.userId, recipeId]
      );
      res.json({ success: true, message: 'Removed from favorites', isFavorite: false });
    } else {
      await query(
        'INSERT INTO favorite_recipes (user_id, recipe_id) VALUES ($1, $2)',
        [req.userId, recipeId]
      );
      res.json({ success: true, message: 'Added to favorites', isFavorite: true });
    }
  } catch (error) {
    logger.error('Toggle recipe favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
    });
  }
});

/**
 * @route   GET /api/meal-plan/shopping-list
 * @desc    Get user's shopping list
 * @access  Private
 */
router.get('/shopping-list', authenticate, async (req, res) => {
  try {
    const listResult = await query(
      'SELECT * FROM shopping_lists WHERE user_id = $1 AND is_active = true LIMIT 1',
      [req.userId]
    );

    let shoppingListId;
    if (listResult.rows.length === 0) {
      // Create new shopping list
      const newList = await query(
        'INSERT INTO shopping_lists (user_id) VALUES ($1) RETURNING *',
        [req.userId]
      );
      shoppingListId = newList.rows[0].id;
    } else {
      shoppingListId = listResult.rows[0].id;
    }

    const itemsResult = await query(
      'SELECT * FROM shopping_list_items WHERE shopping_list_id = $1 ORDER BY category, item_name',
      [shoppingListId]
    );

    res.json({
      success: true,
      data: {
        shoppingListId,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    logger.error('Get shopping list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shopping list',
    });
  }
});

/**
 * @route   POST /api/meal-plan/shopping-list/item
 * @desc    Add item to shopping list
 * @access  Private
 */
router.post('/shopping-list/item', authenticate, async (req, res) => {
  try {
    const { itemName, category, quantity, unit, notes } = req.body;

    // Get or create shopping list
    let listResult = await query(
      'SELECT id FROM shopping_lists WHERE user_id = $1 AND is_active = true LIMIT 1',
      [req.userId]
    );

    let shoppingListId;
    if (listResult.rows.length === 0) {
      const newList = await query(
        'INSERT INTO shopping_lists (user_id) VALUES ($1) RETURNING id',
        [req.userId]
      );
      shoppingListId = newList.rows[0].id;
    } else {
      shoppingListId = listResult.rows[0].id;
    }

    const result = await query(
      `INSERT INTO shopping_list_items 
       (shopping_list_id, item_name, category, quantity, unit, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [shoppingListId, itemName, category, quantity, unit, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Item added to shopping list',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Add shopping list item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item',
    });
  }
});

/**
 * @route   PUT /api/meal-plan/shopping-list/item/:id/toggle
 * @desc    Toggle item checked status
 * @access  Private
 */
router.put('/shopping-list/item/:id/toggle', authenticate, validateUUID, async (req, res) => {
  try {
    const result = await query(
      `UPDATE shopping_list_items 
       SET is_checked = NOT is_checked
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Toggle shopping item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle item',
    });
  }
});

/**
 * @route   DELETE /api/meal-plan/shopping-list/item/:id
 * @desc    Delete shopping list item
 * @access  Private
 */
router.delete('/shopping-list/item/:id', authenticate, validateUUID, async (req, res) => {
  try {
    await query('DELETE FROM shopping_list_items WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    logger.error('Delete shopping item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
    });
  }
});

module.exports = router;
