import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';
import { shoppingController } from '../controllers/shoppingController.js';

const router = Router();

router.get('/lists', requireAuth, shoppingController.list);
router.post('/lists', requireAuth, validateBody(Joi.object({ title: Joi.string().min(2).required() })), shoppingController.createList);
router.get('/lists/:listId/items', requireAuth, shoppingController.listItems);
router.post('/lists/:listId/items', requireAuth, validateBody(Joi.object({ name: Joi.string().required(), quantity: Joi.string().allow('', null), category: Joi.string().allow('', null) })), shoppingController.addItem);
router.post('/lists/:listId/items/bulk', requireAuth, validateBody(Joi.object({ items: Joi.array().items(Joi.object({ name: Joi.string().required(), quantity: Joi.string().allow('', null), category: Joi.string().allow('', null) })).min(1).required() })), shoppingController.addItemsBulk);
router.post('/items/:itemId/toggle', requireAuth, shoppingController.toggleItem);
router.delete('/items/:itemId', requireAuth, shoppingController.deleteItem);

export default router;
