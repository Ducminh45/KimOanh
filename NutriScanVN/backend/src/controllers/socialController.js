import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

export const socialController = {
  async feed(req, res) {
    const result = await query(
      `SELECT p.id, p.content, p.image_url, p.created_at, u.full_name,
              (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
              (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments
       FROM posts p JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC LIMIT 50`
    );
    return res.json({ items: result.rows });
  },

  async createPost(req, res) {
    const { content, imageUrl } = req.body;
    const id = uuidv4();
    await query('INSERT INTO posts (id, user_id, content, image_url) VALUES ($1,$2,$3,$4)', [id, req.user.userId, content || null, imageUrl || null]);
    return res.status(201).json({ id });
  },

  async like(req, res) {
    const { postId } = req.params;
    await query('INSERT INTO post_likes (post_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [postId, req.user.userId]);
    return res.json({ message: 'Liked' });
  },

  async unlike(req, res) {
    const { postId } = req.params;
    await query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, req.user.userId]);
    return res.json({ message: 'Unliked' });
  },

  async comment(req, res) {
    const { postId } = req.params;
    const { content } = req.body;
    const id = uuidv4();
    await query('INSERT INTO post_comments (id, post_id, user_id, content) VALUES ($1,$2,$3,$4)', [id, postId, req.user.userId, content]);
    return res.status(201).json({ id });
  },

  async listComments(req, res) {
    const { postId } = req.params;
    const rows = await query(
      `SELECT pc.id, pc.content, pc.created_at, u.full_name
       FROM post_comments pc JOIN users u ON u.id = pc.user_id
       WHERE pc.post_id = $1 ORDER BY pc.created_at ASC`,
      [postId]
    );
    return res.json({ items: rows.rows });
  }
};
