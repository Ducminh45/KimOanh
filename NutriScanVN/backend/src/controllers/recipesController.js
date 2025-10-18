import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

export const recipesController = {
  async list(req, res) {
    const r = await query('SELECT id, title, image_url, servings, calories, protein_g, carbs_g, fat_g FROM recipes ORDER BY created_at DESC');
    return res.json({ items: r.rows });
  },
  async get(req, res) {
    const { id } = req.params;
    const recipe = await query('SELECT id, title, image_url, servings, calories, protein_g, carbs_g, fat_g FROM recipes WHERE id = $1', [id]);
    if (recipe.rowCount === 0) return res.status(404).json({ message: 'Not found' });
    const ingredients = await query('SELECT id, name, amount FROM recipe_ingredients WHERE recipe_id = $1', [id]);
    const steps = await query('SELECT id, step_number, description, duration_sec FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_number ASC', [id]);
    return res.json({ ...recipe.rows[0], ingredients: ingredients.rows, steps: steps.rows });
  },
  async create(req, res) {
    const { title, imageUrl, servings, calories, proteinG, carbsG, fatG, ingredients, steps } = req.body;
    const id = uuidv4();
    await query('INSERT INTO recipes (id, user_id, title, image_url, servings, calories, protein_g, carbs_g, fat_g) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [id, req.user.userId, title, imageUrl || null, servings || 1, calories || 0, proteinG || 0, carbsG || 0, fatG || 0]);
    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        await query('INSERT INTO recipe_ingredients (id, recipe_id, name, amount) VALUES ($1,$2,$3,$4)', [uuidv4(), id, ing.name, ing.amount || null]);
      }
    }
    if (Array.isArray(steps)) {
      let i = 1;
      for (const st of steps) {
        await query('INSERT INTO recipe_steps (id, recipe_id, step_number, description, duration_sec) VALUES ($1,$2,$3,$4,$5)', [uuidv4(), id, i++, st.description, st.durationSec || null]);
      }
    }
    return res.status(201).json({ id });
  },
  async update(req, res) {
    const { id } = req.params;
    const { title, imageUrl, servings, calories, proteinG, carbsG, fatG, ingredients, steps } = req.body;
    await query('UPDATE recipes SET title=$1, image_url=$2, servings=$3, calories=$4, protein_g=$5, carbs_g=$6, fat_g=$7 WHERE id=$8', [title, imageUrl || null, servings || 1, calories || 0, proteinG || 0, carbsG || 0, fatG || 0, id]);
    // replace sub-tables
    await query('DELETE FROM recipe_ingredients WHERE recipe_id=$1', [id]);
    await query('DELETE FROM recipe_steps WHERE recipe_id=$1', [id]);
    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        await query('INSERT INTO recipe_ingredients (id, recipe_id, name, amount) VALUES ($1,$2,$3,$4)', [uuidv4(), id, ing.name, ing.amount || null]);
      }
    }
    if (Array.isArray(steps)) {
      let i = 1;
      for (const st of steps) {
        await query('INSERT INTO recipe_steps (id, recipe_id, step_number, description, duration_sec) VALUES ($1,$2,$3,$4,$5)', [uuidv4(), id, i++, st.description, st.durationSec || null]);
      }
    }
    return res.json({ message: 'Updated' });
  },
  async remove(req, res) {
    const { id } = req.params;
    await query('DELETE FROM recipes WHERE id = $1', [id]);
    return res.json({ message: 'Deleted' });
  }
};
