import { query } from '../config/database.js';

export const foodController = {
  async search(req, res) {
    const { q = '', category, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const params = [];
    let where = 'WHERE 1=1';
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      where += ` AND (LOWER(name_vi) LIKE $${params.length} OR LOWER(name_en) LIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      where += ` AND category = $${params.length}`;
    }

    params.push(pageSize, offset);

    const sql = `SELECT id, name_vi, name_en, category, serving_size_g, calories, protein_g, carbs_g, fat_g, fiber_g
                 FROM foods ${where}
                 ORDER BY name_vi ASC
                 LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(sql, params);
    return res.json({ items: result.rows, page: Number(page), pageSize: Number(pageSize) });
  },

  async getById(req, res) {
    const { id } = req.params;
    const result = await query(
      'SELECT id, name_vi, name_en, category, serving_size_g, calories, protein_g, carbs_g, fat_g, fiber_g FROM foods WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Food not found' });
    return res.json(result.rows[0]);
  },

  async getFavorites(req, res) {
    const { userId } = req.user;
    const result = await query(
      `SELECT f.* FROM favorites fav JOIN foods f ON f.id = fav.food_id WHERE fav.user_id = $1 ORDER BY f.name_vi ASC`,
      [userId]
    );
    return res.json(result.rows);
  },

  async addFavorite(req, res) {
    const { userId } = req.user;
    const { foodId } = req.body;
    await query('INSERT INTO favorites (user_id, food_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, foodId]);
    return res.status(201).json({ message: 'Added to favorites' });
  },

  async removeFavorite(req, res) {
    const { userId } = req.user;
    const { foodId } = req.params;
    await query('DELETE FROM favorites WHERE user_id = $1 AND food_id = $2', [userId, foodId]);
    return res.json({ message: 'Removed from favorites' });
  }
};
