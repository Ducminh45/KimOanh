import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

function getDateRange(dateParam) {
  const date = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59));
  return { start, end };
}

function scale(base, grams) {
  const baseGrams = Number(base.serving_size_g || 100);
  const factor = baseGrams > 0 ? grams / baseGrams : 1;
  return {
    calories: Math.round(Number(base.calories || 0) * factor),
    protein_g: Math.round(Number(base.protein_g || 0) * factor),
    carbs_g: Math.round(Number(base.carbs_g || 0) * factor),
    fat_g: Math.round(Number(base.fat_g || 0) * factor),
    fiber_g: Math.round(Number(base.fiber_g || 0) * factor)
  };
}

export const diaryController = {
  async list(req, res) {
    const { start, end } = getDateRange(req.query.date);
    const result = await query(
      `SELECT fl.id, fl.meal_type, fl.quantity, fl.serving_size_g, fl.calories, fl.protein_g, fl.carbs_g, fl.fat_g, fl.fiber_g, fl.image_url, fl.logged_at,
              f.id as food_id, f.name_vi, f.name_en, f.category
       FROM food_logs fl
       LEFT JOIN foods f ON f.id = fl.food_id
       WHERE fl.user_id = $1 AND fl.logged_at BETWEEN $2 AND $3
       ORDER BY fl.logged_at DESC`,
      [req.user.userId, start, end]
    );
    return res.json({ items: result.rows });
  },

  async create(req, res) {
    const { foodId, mealType, quantity, servingSizeG, imageUrl } = req.body;
    const foodRes = await query(
      `SELECT serving_size_g, calories, protein_g, carbs_g, fat_g, fiber_g FROM foods WHERE id = $1`,
      [foodId]
    );
    if (foodRes.rowCount === 0) return res.status(400).json({ message: 'Invalid foodId' });
    const grams = Number(servingSizeG) * Number(quantity);
    const scaled = scale(foodRes.rows[0], grams);

    const id = uuidv4();
    const vals = [
      id,
      req.user.userId,
      foodId,
      mealType,
      quantity,
      servingSizeG,
      scaled.calories,
      scaled.protein_g,
      scaled.carbs_g,
      scaled.fat_g,
      scaled.fiber_g,
      imageUrl || null
    ];
    const insert = await query(
      `INSERT INTO food_logs (
        id, user_id, food_id, meal_type, quantity, serving_size_g,
        calories, protein_g, carbs_g, fat_g, fiber_g, image_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, meal_type, quantity, serving_size_g, calories, protein_g, carbs_g, fat_g, fiber_g, image_url, logged_at`,
      vals
    );
    return res.status(201).json(insert.rows[0]);
  },

  async update(req, res) {
    const { id } = req.params;
    const { quantity, servingSizeG, mealType, imageUrl } = req.body;
    const rowRes = await query(
      `SELECT fl.*, f.serving_size_g AS base_serving, f.calories AS base_calories, f.protein_g AS base_protein, f.carbs_g AS base_carbs, f.fat_g AS base_fat, f.fiber_g AS base_fiber
       FROM food_logs fl LEFT JOIN foods f ON f.id = fl.food_id
       WHERE fl.id = $1 AND fl.user_id = $2`,
      [id, req.user.userId]
    );
    if (rowRes.rowCount === 0) return res.status(404).json({ message: 'Not found' });
    const row = rowRes.rows[0];

    const newQuantity = quantity ?? row.quantity;
    const newServing = servingSizeG ?? row.serving_size_g;
    let cal = row.calories;
    let p = row.protein_g;
    let c = row.carbs_g;
    let f = row.fat_g;
    let fib = row.fiber_g;

    if (row.food_id) {
      const base = {
        serving_size_g: row.base_serving,
        calories: row.base_calories,
        protein_g: row.base_protein,
        carbs_g: row.base_carbs,
        fat_g: row.base_fat,
        fiber_g: row.base_fiber
      };
      const grams = Number(newServing) * Number(newQuantity);
      const scaled = scale(base, grams);
      cal = scaled.calories;
      p = scaled.protein_g;
      c = scaled.carbs_g;
      f = scaled.fat_g;
      fib = scaled.fiber_g;
    }

    const upd = await query(
      `UPDATE food_logs SET meal_type = $1, quantity = $2, serving_size_g = $3,
        calories = $4, protein_g = $5, carbs_g = $6, fat_g = $7, fiber_g = $8, image_url = $9
       WHERE id = $10 AND user_id = $11
       RETURNING id, meal_type, quantity, serving_size_g, calories, protein_g, carbs_g, fat_g, fiber_g, image_url, logged_at`,
      [mealType ?? row.meal_type, newQuantity, newServing, cal, p, c, f, fib, imageUrl ?? row.image_url, id, req.user.userId]
    );
    return res.json(upd.rows[0]);
  },

  async remove(req, res) {
    const { id } = req.params;
    await query('DELETE FROM food_logs WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    return res.json({ message: 'Deleted' });
  }
};
