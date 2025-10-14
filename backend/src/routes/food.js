const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authenticate, checkScanLimit, incrementScanCount } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');
const {
  validateFoodLog,
  validateUUID,
  validatePagination,
  validateDateRange,
} = require('../middleware/validation');

/**
 * @route   POST /api/food/scan
 * @desc    Scan food image using AI
 * @access  Private
 */
router.post(
  '/scan',
  authenticate,
  checkScanLimit,
  aiLimiter,
  incrementScanCount,
  foodController.scanFood
);

/**
 * @route   POST /api/food/log
 * @desc    Log food entry
 * @access  Private
 */
router.post('/log', authenticate, validateFoodLog, foodController.logFood);

/**
 * @route   GET /api/food/logs
 * @desc    Get food logs with optional date range filter
 * @access  Private
 */
router.get('/logs', authenticate, validateDateRange, foodController.getFoodLogs);

/**
 * @route   GET /api/food/daily
 * @desc    Get daily nutrition summary
 * @access  Private
 */
router.get('/daily', authenticate, foodController.getDailyNutrition);

/**
 * @route   DELETE /api/food/log/:id
 * @desc    Delete food log
 * @access  Private
 */
router.delete('/log/:id', authenticate, validateUUID, foodController.deleteFoodLog);

/**
 * @route   GET /api/food/search
 * @desc    Search foods in database
 * @access  Private
 */
router.get('/search', authenticate, validatePagination, foodController.searchFoods);

/**
 * @route   GET /api/food/:id
 * @desc    Get food by ID
 * @access  Private
 */
router.get('/:id', authenticate, validateUUID, foodController.getFoodById);

/**
 * @route   GET /api/food/favorites
 * @desc    Get favorite foods
 * @access  Private
 */
router.get('/user/favorites', authenticate, foodController.getFavorites);

/**
 * @route   POST /api/food/favorite/:foodId
 * @desc    Toggle favorite food
 * @access  Private
 */
router.post('/favorite/:foodId', authenticate, validateUUID, foodController.toggleFavorite);

module.exports = router;
