import { v4 as uuidv4 } from 'uuid';
import { analyzeFoodImage, chatWithUser } from '../services/geminiService.js';
import { searchFoodByName, scaleNutrition } from '../services/fatSecretService.js';
import { query } from '../config/database.js';

export const aiController = {
  async scanFood(req, res) {
    const { imageBase64, imageUrl, locale = 'vi', mealType, autoLog = false } = req.body || {};
    // Enforce free-tier scan limit: 3/day unless premium
    const userId = req.user.userId;
    const sub = await query('SELECT tier, expires_at FROM subscriptions WHERE user_id = $1', [userId]);
    const isPremium = sub.rowCount > 0 && sub.rows[0].tier && sub.rows[0].tier !== 'free' && (!sub.rows[0].expires_at || new Date(sub.rows[0].expires_at) > new Date());
    if (!isPremium) {
      const start = new Date();
      const startUtc = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0));
      const endUtc = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 23, 59, 59));
      const countRes = await query('SELECT COUNT(*)::int AS c FROM scan_logs WHERE user_id = $1 AND created_at BETWEEN $2 AND $3', [userId, startUtc, endUtc]);
      if (Number(countRes.rows[0].c) >= 3) {
        return res.status(402).json({ code: 'SCAN_LIMIT_REACHED', message: 'Bạn đã dùng hết 3 lần quét miễn phí hôm nay. Nâng cấp Premium để tiếp tục.' });
      }
    }
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

    // record scan usage
    await query('INSERT INTO scan_logs (id, user_id) VALUES ($1,$2)', [uuidv4(), userId]);

    return res.json({ items: results, loggedIds: createdLogIds, premium: isPremium });
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
  ,

  async mealPlan(req, res) {
    const { targetCalories = 2000, days = 7, locale = 'vi' } = req.body || {};
    const d = Math.max(1, Math.min(7, Number(days || 7)));
    // Simple stubbed meal plan using local foods, grouped by 3 meals
    const foods = await query(`SELECT id, name_vi, name_en, calories, protein_g, carbs_g, fat_g, serving_size_g FROM foods ORDER BY name_vi ASC LIMIT 20`);
    const items = foods.rows.map((f) => ({
      id: f.id,
      name: locale === 'vi' ? f.name_vi : (f.name_en || f.name_vi),
      calories: Number(f.calories || 0),
      proteinG: Number(f.protein_g || 0),
      carbsG: Number(f.carbs_g || 0),
      fatG: Number(f.fat_g || 0),
      servingSizeG: Number(f.serving_size_g || 100)
    }));

    const plan = [];
    for (let day = 0; day < d; day++) {
      const dayMeals = { breakfast: [], lunch: [], dinner: [], totalCalories: 0 };
      let remaining = Number(targetCalories);
      for (const meal of ['breakfast','lunch','dinner']) {
        const picks = items.slice((day * 3) % items.length, ((day * 3) % items.length) + 3);
        const perMealTarget = Math.round(remaining / (3 - ['breakfast','lunch','dinner'].indexOf(meal)));
        let sum = 0;
        for (const p of picks) {
          if (sum + p.calories <= perMealTarget) {
            dayMeals[meal].push({ name: p.name, servingG: p.servingSizeG, calories: p.calories });
            sum += p.calories;
          }
        }
        remaining -= sum;
        dayMeals.totalCalories += sum;
      }
      plan.push(dayMeals);
    }
    return res.json({ days: d, targetCalories, plan });
  }
};
