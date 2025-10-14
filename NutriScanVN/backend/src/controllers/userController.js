import { query } from '../config/database.js';

export const userController = {
  async getMe(req, res) {
    const { userId } = req.user;
    const result = await query(
      'SELECT id, email, full_name, is_email_verified FROM users WHERE id = $1',
      [userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    return res.json(result.rows[0]);
  },

  async updateProfile(req, res) {
    const { userId } = req.user;
    const { fullName } = req.body;
    await query('UPDATE users SET full_name = $1 WHERE id = $2', [fullName, userId]);
    const result = await query(
      'SELECT id, email, full_name, is_email_verified FROM users WHERE id = $1',
      [userId]
    );
    return res.json(result.rows[0]);
  },

  async getMetrics(req, res) {
    const { userId } = req.user;
    const result = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    if (result.rowCount === 0) return res.json(null);
    return res.json(result.rows[0]);
  },

  async updateMetrics(req, res) {
    const { userId } = req.user;
    const {
      gender,
      birthDate,
      heightCm,
      weightKg,
      goal,
      activityLevel,
      dietaryPreferences,
      allergies
    } = req.body;

    const sql = `INSERT INTO user_profiles (
        user_id, gender, birth_date, height_cm, weight_kg, goal, activity_level, dietary_preferences, allergies, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()
      ) ON CONFLICT (user_id) DO UPDATE SET
        gender = EXCLUDED.gender,
        birth_date = EXCLUDED.birth_date,
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        goal = EXCLUDED.goal,
        activity_level = EXCLUDED.activity_level,
        dietary_preferences = EXCLUDED.dietary_preferences,
        allergies = EXCLUDED.allergies,
        updated_at = NOW()
      RETURNING *`;

    const result = await query(sql, [
      userId,
      gender,
      birthDate,
      heightCm,
      weightKg,
      goal,
      activityLevel,
      dietaryPreferences,
      allergies
    ]);

    return res.json(result.rows[0]);
  }
};
