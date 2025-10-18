import { query } from '../config/database.js';

export const billingController = {
  async getSubscription(req, res) {
    const userId = req.user.userId;
    const r = await query('SELECT tier, renewed_at, expires_at FROM subscriptions WHERE user_id = $1', [userId]);
    if (r.rowCount === 0) return res.json({ tier: 'free' });
    return res.json(r.rows[0]);
  },

  async updateSubscription(req, res) {
    const userId = req.user.userId;
    const { tier } = req.body;
    let days = 0;
    if (tier === 'premium_monthly') days = 30;
    else if (tier === 'premium_yearly') days = 365;
    const q = await query(
      `INSERT INTO subscriptions (user_id, tier, renewed_at, expires_at)
       VALUES ($1, $2, NOW(), CASE WHEN $3 > 0 THEN NOW() + ($3 || ' days')::interval ELSE NULL END)
       ON CONFLICT (user_id) DO UPDATE SET tier = EXCLUDED.tier, renewed_at = NOW(),
         expires_at = CASE WHEN $3 > 0 THEN NOW() + ($3 || ' days')::interval ELSE NULL END
       RETURNING tier, renewed_at, expires_at`,
      [userId, tier, days]
    );
    return res.json(q.rows[0]);
  }
};
