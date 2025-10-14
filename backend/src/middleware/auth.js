const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../services/logger');

/**
 * Middleware to verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await query(
      'SELECT id, email, full_name, is_premium, scan_count_today, scan_limit FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user to request object
    req.user = result.rows[0];
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if user is premium
 */
const requirePremium = (req, res, next) => {
  if (!req.user.is_premium) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required',
      premiumRequired: true,
    });
  }
  next();
};

/**
 * Middleware to check scan limit
 */
const checkScanLimit = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Premium users have unlimited scans
    if (user.is_premium) {
      return next();
    }

    // Check if we need to reset daily scan count
    const lastReset = await query(
      'SELECT last_scan_reset FROM users WHERE id = $1',
      [user.id]
    );
    
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = lastReset.rows[0]?.last_scan_reset;
    
    if (lastResetDate !== today) {
      // Reset scan count for new day
      await query(
        'UPDATE users SET scan_count_today = 0, last_scan_reset = $1 WHERE id = $2',
        [today, user.id]
      );
      req.user.scan_count_today = 0;
    }

    // Check if limit exceeded
    if (user.scan_count_today >= user.scan_limit) {
      return res.status(429).json({
        success: false,
        message: 'Daily scan limit reached',
        scanLimitReached: true,
        scansRemaining: 0,
        limit: user.scan_limit,
      });
    }

    next();
  } catch (error) {
    logger.error('Scan limit check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check scan limit',
    });
  }
};

/**
 * Middleware to increment scan count
 */
const incrementScanCount = async (req, res, next) => {
  try {
    if (!req.user.is_premium) {
      await query(
        'UPDATE users SET scan_count_today = scan_count_today + 1 WHERE id = $1',
        [req.userId]
      );
    }
    next();
  } catch (error) {
    logger.error('Increment scan count error:', error);
    // Don't block the request if this fails
    next();
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query(
      'SELECT id, email, full_name, is_premium FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
      req.userId = decoded.userId;
    }
    
    next();
  } catch (error) {
    // Ignore errors and continue
    next();
  }
};

module.exports = {
  authenticate,
  requirePremium,
  checkScanLimit,
  incrementScanCount,
  optionalAuth,
};
