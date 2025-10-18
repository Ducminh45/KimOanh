import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

export const challengesController = {
  async list(req, res) {
    const rows = await query(
      `SELECT id, title, period, start_at, end_at, goal_type, goal_value
       FROM challenges WHERE start_at <= NOW() AND end_at >= NOW()
       ORDER BY start_at ASC`
    );
    return res.json({ items: rows.rows });
  },

  async join(req, res) {
    const { challengeId } = req.body;
    await query(
      `INSERT INTO user_challenges (user_id, challenge_id, progress_value)
       VALUES ($1,$2,0)
       ON CONFLICT (user_id, challenge_id) DO NOTHING`,
      [req.user.userId, challengeId]
    );
    return res.json({ message: 'Joined' });
  }
};
