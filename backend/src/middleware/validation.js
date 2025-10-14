const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Validation rules for onboarding
 */
const validateOnboarding = [
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('goal')
    .optional()
    .isIn(['lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle'])
    .withMessage('Invalid goal'),
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Invalid activity level'),
  handleValidationErrors,
];

/**
 * Validation rules for food logging
 */
const validateFoodLog = [
  body('foodName')
    .trim()
    .notEmpty()
    .withMessage('Food name is required'),
  body('mealType')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Invalid meal type'),
  body('calories')
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  body('servingSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Serving size must be a positive number'),
  handleValidationErrors,
];

/**
 * Validation rules for water logging
 */
const validateWaterLog = [
  body('amountMl')
    .isInt({ min: 1, max: 5000 })
    .withMessage('Water amount must be between 1 and 5000 ml'),
  handleValidationErrors,
];

/**
 * Validation rules for exercise logging
 */
const validateExerciseLog = [
  body('exerciseType')
    .trim()
    .notEmpty()
    .withMessage('Exercise type is required'),
  body('durationMinutes')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes'),
  body('intensity')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid intensity level'),
  handleValidationErrors,
];

/**
 * Validation rules for weight logging
 */
const validateWeightLog = [
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  handleValidationErrors,
];

/**
 * Validation rules for creating a post
 */
const validatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('postType')
    .optional()
    .isIn(['general', 'meal', 'progress', 'achievement'])
    .withMessage('Invalid post type'),
  handleValidationErrors,
];

/**
 * Validation rules for creating a comment
 */
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  handleValidationErrors,
];

/**
 * Validation rules for UUID parameters
 */
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

/**
 * Validation rules for date range
 */
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateOnboarding,
  validateFoodLog,
  validateWaterLog,
  validateExerciseLog,
  validateWeightLog,
  validatePost,
  validateComment,
  validateUUID,
  validatePagination,
  validateDateRange,
};
