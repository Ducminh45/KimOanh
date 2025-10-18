import dotenv from 'dotenv';
import { query } from '../config/database.js';
import { logger } from './logger.js';

dotenv.config();

export async function searchFoodByName(name, { locale = 'vi' } = {}) {
  const res = await query(
    `SELECT id, name_vi, name_en, category, serving_size_g, calories, protein_g, carbs_g, fat_g, fiber_g
     FROM foods
     WHERE LOWER(name_vi) LIKE LOWER($1) OR LOWER(name_en) LIKE LOWER($1)
     ORDER BY name_vi ASC LIMIT 5`,
    [`%${name}%`]
  );
  if (res.rowCount > 0) {
    return res.rows.map((r) => ({
      source: 'local',
      foodId: r.id,
      name: locale === 'vi' ? r.name_vi : (r.name_en || r.name_vi),
      category: r.category,
      servingSizeG: Number(r.serving_size_g || 100),
      calories: Number(r.calories || 0),
      proteinG: Number(r.protein_g || 0),
      carbsG: Number(r.carbs_g || 0),
      fatG: Number(r.fat_g || 0),
      fiberG: Number(r.fiber_g || 0)
    }));
  }

  logger.warn('No local match in foods table for', { name });
  return [];
}

export function scaleNutrition(base, targetGrams) {
  const baseGrams = base.servingSizeG || 100;
  const factor = baseGrams > 0 ? targetGrams / baseGrams : 1;
  return {
    calories: Math.round((base.calories || 0) * factor),
    proteinG: Math.round((base.proteinG || 0) * factor),
    carbsG: Math.round((base.carbsG || 0) * factor),
    fatG: Math.round((base.fatG || 0) * factor),
    fiberG: Math.round((base.fiberG || 0) * factor)
  };
}
