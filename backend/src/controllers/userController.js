const { query, getClient } = require('../config/database');
const logger = require('../services/logger');

/**
 * Calculate BMI, BMR, and TDEE
 */
const calculateMetrics = (height, weight, age, gender, activityLevel) => {
  // BMI calculation
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // BMR calculation using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);
  
  return { bmi: Math.round(bmi * 10) / 10, bmr: Math.round(bmr), tdee };
};

/**
 * Calculate macro goals based on goal type
 */
const calculateMacros = (dailyCalories, goal) => {
  let proteinPercentage, carbsPercentage, fatsPercentage;
  
  switch (goal) {
    case 'lose_weight':
      proteinPercentage = 0.40; // 40% protein
      carbsPercentage = 0.30;   // 30% carbs
      fatsPercentage = 0.30;    // 30% fats
      break;
    case 'build_muscle':
      proteinPercentage = 0.35; // 35% protein
      carbsPercentage = 0.45;   // 45% carbs
      fatsPercentage = 0.20;    // 20% fats
      break;
    case 'gain_weight':
      proteinPercentage = 0.25; // 25% protein
      carbsPercentage = 0.50;   // 50% carbs
      fatsPercentage = 0.25;    // 25% fats
      break;
    default: // maintain_weight
      proteinPercentage = 0.30; // 30% protein
      carbsPercentage = 0.40;   // 40% carbs
      fatsPercentage = 0.30;    // 30% fats
  }
  
  const proteinCalories = dailyCalories * proteinPercentage;
  const carbsCalories = dailyCalories * carbsPercentage;
  const fatsCalories = dailyCalories * fatsPercentage;
  
  return {
    protein: Math.round(proteinCalories / 4), // 4 calories per gram
    carbs: Math.round(carbsCalories / 4),     // 4 calories per gram
    fats: Math.round(fatsCalories / 9),       // 9 calories per gram
  };
};

/**
 * Complete user onboarding
 */
const completeOnboarding = async (req, res) => {
  const client = await getClient();
  
  try {
    const {
      dateOfBirth,
      gender,
      height,
      weight,
      goal,
      activityLevel,
      dietaryPreferences,
      allergies,
    } = req.body;

    await client.query('BEGIN');

    // Calculate age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Calculate metrics
    const { bmi, bmr, tdee } = calculateMetrics(height, weight, age, gender, activityLevel);
    
    // Adjust TDEE based on goal
    let dailyCalorieGoal = tdee;
    if (goal === 'lose_weight') {
      dailyCalorieGoal = Math.round(tdee - 500); // 500 calorie deficit
    } else if (goal === 'gain_weight') {
      dailyCalorieGoal = Math.round(tdee + 500); // 500 calorie surplus
    }
    
    // Calculate macros
    const macros = calculateMacros(dailyCalorieGoal, goal);

    // Update user profile
    await client.query(
      `UPDATE users SET 
        date_of_birth = $1, gender = $2, height = $3, weight = $4,
        goal = $5, activity_level = $6, daily_calorie_goal = $7,
        protein_goal = $8, carbs_goal = $9, fats_goal = $10,
        updated_at = NOW()
       WHERE id = $11`,
      [
        dateOfBirth, gender, height, weight, goal, activityLevel,
        dailyCalorieGoal, macros.protein, macros.carbs, macros.fats,
        req.userId,
      ]
    );

    // Add dietary preferences
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      for (const preference of dietaryPreferences) {
        await client.query(
          'INSERT INTO dietary_preferences (user_id, preference) VALUES ($1, $2)',
          [req.userId, preference]
        );
      }
    }

    // Add allergies
    if (allergies && allergies.length > 0) {
      for (const allergen of allergies) {
        await client.query(
          'INSERT INTO allergies (user_id, allergen) VALUES ($1, $2)',
          [req.userId, allergen.name]
        );
      }
    }

    // Log initial weight
    await client.query(
      'INSERT INTO weight_logs (user_id, weight, bmi) VALUES ($1, $2, $3)',
      [req.userId, weight, bmi]
    );

    await client.query('COMMIT');

    logger.info(`User ${req.userId} completed onboarding`);

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        bmi,
        bmr,
        tdee,
        dailyCalorieGoal,
        macros,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Onboarding failed',
    });
  } finally {
    client.release();
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'full_name', 'date_of_birth', 'gender', 'height', 'weight',
      'goal', 'activity_level', 'daily_calorie_goal', 'water_goal',
      'profile_image_url', 'language', 'unit_system', 
      'notifications_enabled', 'dark_mode',
    ];

    // Filter out non-allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedUpdates.includes(snakeKey)) {
        filteredUpdates[snakeKey] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided',
      });
    }

    // Build dynamic update query
    const keys = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} 
       RETURNING id, email, full_name`,
      [...values, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    logger.info(`User ${req.userId} updated profile`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        u.streak_count,
        (SELECT COUNT(*) FROM food_logs WHERE user_id = u.id) as total_meals_logged,
        (SELECT COUNT(*) FROM water_logs WHERE user_id = u.id) as total_water_logs,
        (SELECT COUNT(*) FROM exercise_logs WHERE user_id = u.id) as total_exercises,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as total_posts,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as achievements_count,
        (SELECT SUM(points) FROM achievements a 
         INNER JOIN user_achievements ua ON a.id = ua.achievement_id 
         WHERE ua.user_id = u.id) as total_points
       FROM users u
       WHERE u.id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user stats',
    });
  }
};

/**
 * Get dietary preferences and allergies
 */
const getPreferences = async (req, res) => {
  try {
    const preferencesResult = await query(
      'SELECT preference FROM dietary_preferences WHERE user_id = $1',
      [req.userId]
    );

    const allergiesResult = await query(
      'SELECT allergen, severity FROM allergies WHERE user_id = $1',
      [req.userId]
    );

    res.json({
      success: true,
      data: {
        preferences: preferencesResult.rows.map(r => r.preference),
        allergies: allergiesResult.rows,
      },
    });
  } catch (error) {
    logger.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
    });
  }
};

/**
 * Update dietary preferences
 */
const updatePreferences = async (req, res) => {
  const client = await getClient();
  
  try {
    const { preferences, allergies } = req.body;

    await client.query('BEGIN');

    // Delete existing preferences
    await client.query('DELETE FROM dietary_preferences WHERE user_id = $1', [req.userId]);
    
    // Add new preferences
    if (preferences && preferences.length > 0) {
      for (const preference of preferences) {
        await client.query(
          'INSERT INTO dietary_preferences (user_id, preference) VALUES ($1, $2)',
          [req.userId, preference]
        );
      }
    }

    // Delete existing allergies
    await client.query('DELETE FROM allergies WHERE user_id = $1', [req.userId]);
    
    // Add new allergies
    if (allergies && allergies.length > 0) {
      for (const allergen of allergies) {
        await client.query(
          'INSERT INTO allergies (user_id, allergen, severity) VALUES ($1, $2, $3)',
          [req.userId, allergen.name, allergen.severity || 'moderate']
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
    });
  } finally {
    client.release();
  }
};

module.exports = {
  completeOnboarding,
  updateProfile,
  getUserStats,
  getPreferences,
  updatePreferences,
};
