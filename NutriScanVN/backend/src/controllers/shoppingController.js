import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

export const shoppingController = {
  async list(req, res) {
    const lists = await query('SELECT id, title, created_at FROM shopping_lists WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId]);
    return res.json({ items: lists.rows });
  },
  async createList(req, res) {
    const { title } = req.body;
    const id = uuidv4();
    await query('INSERT INTO shopping_lists (id, user_id, title) VALUES ($1,$2,$3)', [id, req.user.userId, title]);
    return res.status(201).json({ id });
  },
  async listItems(req, res) {
    const { listId } = req.params;
    const items = await query('SELECT id, name, quantity, category, checked FROM shopping_items WHERE list_id = $1 ORDER BY created_at ASC', [listId]);
    return res.json({ items: items.rows });
  },
  async addItem(req, res) {
    const { listId } = req.params;
    const { name, quantity, category } = req.body;
    const id = uuidv4();
    await query('INSERT INTO shopping_items (id, list_id, name, quantity, category) VALUES ($1,$2,$3,$4,$5)', [id, listId, name, quantity || null, category || null]);
    return res.status(201).json({ id });
  },
  async toggleItem(req, res) {
    const { itemId } = req.params;
    await query('UPDATE shopping_items SET checked = NOT checked WHERE id = $1', [itemId]);
    return res.json({ message: 'Toggled' });
  },
  async deleteItem(req, res) {
    const { itemId } = req.params;
    await query('DELETE FROM shopping_items WHERE id = $1', [itemId]);
    return res.json({ message: 'Deleted' });
  }
};
