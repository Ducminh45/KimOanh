const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validateOnboarding } = require('../middleware/validation');

/**
 * @route   POST /api/user/onboarding
 * @desc    Complete user onboarding
 * @access  Private
 */
router.post('/onboarding', authenticate, validateOnboarding, userController.completeOnboarding);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', authenticate, userController.getUserStats);

/**
 * @route   GET /api/user/preferences
 * @desc    Get dietary preferences and allergies
 * @access  Private
 */
router.get('/preferences', authenticate, userController.getPreferences);

/**
 * @route   PUT /api/user/preferences
 * @desc    Update dietary preferences and allergies
 * @access  Private
 */
router.put('/preferences', authenticate, userController.updatePreferences);

module.exports = router;
