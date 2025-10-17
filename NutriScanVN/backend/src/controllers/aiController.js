import { v4 as uuidv4 } from 'uuid';
import { analyzeFoodImage, chatWithUser } from '../services/geminiService.js';
import { searchFoodByName, scaleNutrition } from '../services/fatSecretService.js';
import { query } from '../config/database.js';

export const aiController = {
  async scanFood(req, res) {
    const { imageBase64, imageUrl, locale = 'vi', mealType, autoLog = false } = req.body || {};
    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ message: 'imageBase64 or imageUrl is required' });
    }

    const detection = await analyzeFoodImage({ imageBase64, imageUrl, locale });

    const results = [];
    for (const item of detection.items) {
      const name = item.name;
      const candidates = await searchFoodByName(name, { locale });
      let picked = candidates[0];
      let nutrition = null;
      const servingGrams = item.servingGrams || picked?.servingSizeG || 100;
      if (picked) {
        nutrition = scaleNutrition(picked, servingGrams);
      }
      results.push({
        name,
        detectedServingGrams: servingGrams,
        confidence: item.confidence,
        match: picked || null,
        nutrition,
        alternatives: candidates.slice(1, 5)
      });
    }

    const createdLogIds = [];
    if (autoLog && mealType) {
      for (const r of results) {
        const id = uuidv4();
        const foodId = r.match?.foodId || null;
        const vals = [
          id,
          req.user.userId,
          foodId,
          mealType,
          1,
          r.detectedServingGrams,
          r.nutrition?.calories || null,
          r.nutrition?.proteinG || null,
          r.nutrition?.carbsG || null,
          r.nutrition?.fatG || null,
          r.nutrition?.fiberG || null,
          null
        ];
        await query(
          `INSERT INTO food_logs (
            id, user_id, food_id, meal_type, quantity, serving_size_g,
            calories, protein_g, carbs_g, fat_g, fiber_g, image_url
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          vals
        );
        createdLogIds.push(id);
      }
    }

    return res.json({ items: results, loggedIds: createdLogIds });
  },

  async chat(req, res) {
    const { messages = [], locale = 'vi' } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array is required' });
    }

    const userId = req.user.userId;
    const profileRes = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0] || null;

    const start = new Date();
    const startUtc = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0));
    const endUtc = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 23, 59, 59));
    const foodSum = await query(
      `SELECT COALESCE(SUM(calories),0) as calories, COALESCE(SUM(protein_g),0) as protein_g,
              COALESCE(SUM(carbs_g),0) as carbs_g, COALESCE(SUM(fat_g),0) as fat_g, COALESCE(SUM(fiber_g),0) as fiber_g
       FROM food_logs WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3`,
      [userId, startUtc, endUtc]
    );
    const waterSum = await query(
      `SELECT COALESCE(SUM(amount_ml),0) as total_ml FROM water_logs WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3`,
      [userId, startUtc, endUtc]
    );
    const exerciseSum = await query(
      `SELECT COALESCE(SUM(calories_burned),0) as calories_burned FROM exercise_logs WHERE user_id = $1 AND logged_at BETWEEN $2 AND $3`,
      [userId, startUtc, endUtc]
    );
    const todaySummary = {
      calories: Number(foodSum.rows[0].calories),
      macros: {
        proteinG: Number(foodSum.rows[0].protein_g),
        carbsG: Number(foodSum.rows[0].carbs_g),
        fatG: Number(foodSum.rows[0].fat_g),
        fiberG: Number(foodSum.rows[0].fiber_g)
      },
      waterMl: Number(waterSum.rows[0].total_ml),
      caloriesBurned: Number(exerciseSum.rows[0].calories_burned)
    };

    const reply = await chatWithUser({ messages, userProfile: profile, todaySummary, locale });

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      await query(
        'INSERT INTO chat_messages (id, user_id, role, content) VALUES ($1,$2,$3,$4)',
        [uuidv4(), userId, 'user', lastUser.content]
      );
    }
    await query(
      'INSERT INTO chat_messages (id, user_id, role, content) VALUES ($1,$2,$3,$4)',
      [uuidv4(), userId, 'assistant', reply.reply]
    );

    return res.json({ reply: reply.reply });
  }
};
