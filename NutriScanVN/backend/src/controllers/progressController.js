import { query } from '../config/database.js';

function getDateRange(dateParam) {
  const date = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59));
  return { start, end };
}

export const progressController = {
  async listWater(req, res) {
    const { start, end } = getDateRange(req.query.date);
    const result = await query(
      `SELECT id, amount_ml, logged_at FROM water_logs
       WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3
       ORDER BY logged_at DESC`,
      [req.user.userId, start, end]
    );
    const total = result.rows.reduce((sum, r) => sum + Number(r.amount_ml), 0);
    return res.json({ items: result.rows, totalMl: total });
  },

  async addWater(req, res) {
    const { amountMl } = req.body;
    const result = await query(
      `INSERT INTO water_logs (user_id, amount_ml)
       VALUES ($1, $2)
       RETURNING id, amount_ml, logged_at`,
      [req.user.userId, amountMl]
    );
    return res.status(201).json(result.rows[0]);
  },

  async deleteWater(req, res) {
    const { id } = req.params;
    await query('DELETE FROM water_logs WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    return res.json({ message: 'Deleted' });
  },

  async listExercise(req, res) {
    const { start, end } = getDateRange(req.query.date);
    const result = await query(
      `SELECT id, type, duration_min, intensity, calories_burned, logged_at
       FROM exercise_logs
       WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3
       ORDER BY logged_at DESC`,
      [req.user.userId, start, end]
    );
    const totalCalories = result.rows.reduce((sum, r) => sum + Number(r.calories_burned || 0), 0);
    return res.json({ items: result.rows, caloriesBurned: totalCalories });
  },

  async addExercise(req, res) {
    const { type, durationMin, intensity } = req.body;
    // Simple estimation: MET-based could be used; for now constant mapping
    const intensityToMet = { low: 3.0, medium: 6.0, high: 8.0 };
    const met = intensityToMet[intensity] || 5.0;
    // Approximate weight 70kg if not provided; better: fetch from profile
    const weightKg = 70;
    const calories = met * 1.05 * (weightKg / 60) * Number(durationMin);

    const result = await query(
      `INSERT INTO exercise_logs (user_id, type, duration_min, intensity, calories_burned)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, duration_min, intensity, calories_burned, logged_at`,
      [req.user.userId, type, durationMin, intensity, calories]
    );
    return res.status(201).json(result.rows[0]);
  },

  async deleteExercise(req, res) {
    const { id } = req.params;
    await query('DELETE FROM exercise_logs WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    return res.json({ message: 'Deleted' });
  },

  async getDailySummary(req, res) {
    const { start, end } = getDateRange(req.query.date);

    const [waterRes, exerciseRes, foodRes] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(amount_ml),0) as total_ml FROM water_logs WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3`,
        [req.user.userId, start, end]
      ),
      query(
        `SELECT COALESCE(SUM(calories_burned),0) as calories_burned FROM exercise_logs WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3`,
        [req.user.userId, start, end]
      ),
      query(
        `SELECT COALESCE(SUM(calories),0) as calories, COALESCE(SUM(protein_g),0) as protein_g,
                COALESCE(SUM(carbs_g),0) as carbs_g, COALESCE(SUM(fat_g),0) as fat_g, COALESCE(SUM(fiber_g),0) as fiber_g
         FROM food_logs WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3`,
        [req.user.userId, start, end]
      )
    ]);

    return res.json({
      waterMl: Number(waterRes.rows[0].total_ml),
      caloriesBurned: Number(exerciseRes.rows[0].calories_burned),
      calories: Number(foodRes.rows[0].calories),
      macros: {
        proteinG: Number(foodRes.rows[0].protein_g),
        carbsG: Number(foodRes.rows[0].carbs_g),
        fatG: Number(foodRes.rows[0].fat_g),
        fiberG: Number(foodRes.rows[0].fiber_g)
      }
    });
  }
};
