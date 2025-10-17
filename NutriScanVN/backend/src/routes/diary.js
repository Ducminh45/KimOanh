import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';
import { diaryController } from '../controllers/diaryController.js';

const router = Router();

const createSchema = Joi.object({
  foodId: Joi.string().uuid().required(),
  mealType: Joi.string().valid('breakfast','lunch','dinner','snack').required(),
  quantity: Joi.number().min(0.1).max(10).required(),
  servingSizeG: Joi.number().min(1).max(1000).required(),
  imageUrl: Joi.string().uri().optional()
});

const updateSchema = Joi.object({
  mealType: Joi.string().valid('breakfast','lunch','dinner','snack').optional(),
  quantity: Joi.number().min(0.1).max(10).optional(),
  servingSizeG: Joi.number().min(1).max(1000).optional(),
  imageUrl: Joi.string().uri().optional()
});

router.get('/', requireAuth, diaryController.list);
router.post('/', requireAuth, validateBody(createSchema), diaryController.create);
router.put('/:id', requireAuth, validateBody(updateSchema), diaryController.update);
router.delete('/:id', requireAuth, diaryController.remove);

export default router;
