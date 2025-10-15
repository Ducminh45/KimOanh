const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validatePost, validateComment, validateUUID, validatePagination } = require('../middleware/validation');
const logger = require('../services/logger');

/**
 * @route   GET /api/community/feed
 * @desc    Get community feed with posts
 * @access  Private
 */
router.get('/feed', authenticate, validatePagination, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT p.*, 
              u.full_name as author_name,
              u.profile_image_url as author_image,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
              (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
              EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked
       FROM posts p
       INNER JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get community feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to get community feed' });
  }
});

/**
 * @route   POST /api/community/post
 * @desc    Create a new post
 * @access  Private
 */
router.post('/post', authenticate, validatePost, async (req, res) => {
  try {
    const { content, imageUrl, postType = 'general' } = req.body;

    const result = await query(
      'INSERT INTO posts (user_id, content, image_url, post_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, content, imageUrl, postType]
    );

    // Get author info
    const userResult = await query(
      'SELECT full_name, profile_image_url FROM users WHERE id = $1',
      [req.userId]
    );

    const post = {
      ...result.rows[0],
      author_name: userResult.rows[0].full_name,
      author_image: userResult.rows[0].profile_image_url,
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
    };

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

/**
 * @route   POST /api/community/post/:id/like
 * @desc    Toggle like on a post
 * @access  Private
 */
router.post('/post/:id/like', authenticate, validateUUID, async (req, res) => {
  const client = await getClient();
  
  try {
    const postId = req.params.id;

    await client.query('BEGIN');

    // Check if already liked
    const likeResult = await client.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, req.userId]
    );

    let isLiked;
    if (likeResult.rows.length > 0) {
      // Unlike
      await client.query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, req.userId]
      );
      await client.query(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1',
        [postId]
      );
      isLiked = false;
    } else {
      // Like
      await client.query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [postId, req.userId]
      );
      await client.query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1',
        [postId]
      );
      isLiked = true;
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { isLiked },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like' });
  } finally {
    client.release();
  }
});

/**
 * @route   POST /api/community/post/:id/comment
 * @desc    Add comment to a post
 * @access  Private
 */
router.post('/post/:id/comment', authenticate, validateUUID, validateComment, async (req, res) => {
  const client = await getClient();
  
  try {
    const { content } = req.body;
    const postId = req.params.id;

    await client.query('BEGIN');

    const result = await client.query(
      'INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, req.userId, content]
    );

    await client.query(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1',
      [postId]
    );

    const userResult = await client.query(
      'SELECT full_name, profile_image_url FROM users WHERE id = $1',
      [req.userId]
    );

    await client.query('COMMIT');

    const comment = {
      ...result.rows[0],
      author_name: userResult.rows[0].full_name,
      author_image: userResult.rows[0].profile_image_url,
    };

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  } finally {
    client.release();
  }
});

/**
 * @route   GET /api/community/post/:id/comments
 * @desc    Get comments for a post
 * @access  Private
 */
router.get('/post/:id/comments', authenticate, validateUUID, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
              u.full_name as author_name,
              u.profile_image_url as author_image
       FROM post_comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get comments' });
  }
});

/**
 * @route   GET /api/community/leaderboard
 * @desc    Get leaderboard
 * @access  Private
 */
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    const result = await query(
      `SELECT ls.*,
              u.full_name,
              u.profile_image_url
       FROM leaderboard_scores ls
       INNER JOIN users u ON ls.user_id = u.id
       WHERE ls.period = $1
       AND ls.period_start = DATE_TRUNC('${period === 'monthly' ? 'month' : 'week'}', CURRENT_DATE)
       ORDER BY ls.rank ASC
       LIMIT 100`,
      [period]
    );

    // Get current user rank
    const userRank = await query(
      `SELECT rank, score
       FROM leaderboard_scores
       WHERE user_id = $1 AND period = $2
       AND period_start = DATE_TRUNC('${period === 'monthly' ? 'month' : 'week'}', CURRENT_DATE)`,
      [req.userId, period]
    );

    res.json({
      success: true,
      data: {
        leaderboard: result.rows,
        userRank: userRank.rows[0] || null,
      },
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get leaderboard' });
  }
});

/**
 * @route   DELETE /api/community/post/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/post/:id', authenticate, validateUUID, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

module.exports = router;
