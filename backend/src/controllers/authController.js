const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/database');
const logger = require('../services/logger');

/**
 * Register a new user
 */
const register = async (req, res) => {
  const client = await getClient();
  
  try {
    const { email, password, fullName } = req.body;

    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name, created_at`,
      [email.toLowerCase(), passwordHash, fullName]
    );

    const user = result.rows[0];

    await client.query('COMMIT');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  } finally {
    client.release();
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      `SELECT id, email, password_hash, full_name, is_premium, 
              height, weight, goal, activity_level, daily_calorie_goal 
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last active date and streak
    const today = new Date().toISOString().split('T')[0];
    await query(
      'UPDATE users SET last_active_date = $1 WHERE id = $2',
      [today, user.id]
    );

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    logger.info(`User logged in: ${email}`);

    // Check if user has completed onboarding
    const hasCompletedOnboarding = !!(
      user.height && 
      user.weight && 
      user.goal && 
      user.activity_level && 
      user.daily_calorie_goal
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          isPremium: user.is_premium,
          hasCompletedOnboarding,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists and is not expired
    const result = await query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link will be sent',
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    // TODO: Send email with reset link
    logger.info(`Password reset requested for user: ${email}`);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link will be sent',
      // In development, return the token
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
    });
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  const client = await getClient();
  
  try {
    const { token, newPassword } = req.body;

    await client.query('BEGIN');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token exists and is not used
    const result = await client.query(
      'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used = false',
      [token]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    const userId = result.rows[0].user_id;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );

    // Mark token as used
    await client.query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [token]
    );

    // Delete all refresh tokens for this user (force re-login)
    await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    logger.info(`Password reset successful for user ID: ${userId}`);

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  } finally {
    client.release();
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, date_of_birth, gender, height, weight, 
              goal, activity_level, daily_calorie_goal, protein_goal, carbs_goal, 
              fats_goal, fiber_goal, water_goal, is_premium, premium_expires_at,
              scan_count_today, scan_limit, streak_count, profile_image_url,
              language, unit_system, notifications_enabled, dark_mode, created_at
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          dateOfBirth: user.date_of_birth,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          goal: user.goal,
          activityLevel: user.activity_level,
          dailyCalorieGoal: user.daily_calorie_goal,
          proteinGoal: user.protein_goal,
          carbsGoal: user.carbs_goal,
          fatsGoal: user.fats_goal,
          fiberGoal: user.fiber_goal,
          waterGoal: user.water_goal,
          isPremium: user.is_premium,
          premiumExpiresAt: user.premium_expires_at,
          scanCountToday: user.scan_count_today,
          scanLimit: user.scan_limit,
          streakCount: user.streak_count,
          profileImageUrl: user.profile_image_url,
          language: user.language,
          unitSystem: user.unit_system,
          notificationsEnabled: user.notifications_enabled,
          darkMode: user.dark_mode,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  getProfile,
};
