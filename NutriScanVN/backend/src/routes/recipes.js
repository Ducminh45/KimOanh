import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';
import { recipesController } from '../controllers/recipesController.js';

const router = Router();

router.get('/', requireAuth, recipesController.list);
router.get('/:id', requireAuth, recipesController.get);

const recipeSchema = Joi.object({
  title: Joi.string().min(2).required(),
  imageUrl: Joi.string().uri().optional(),
  servings: Joi.number().integer().min(1).default(1),
  calories: Joi.number().min(0).default(0),
  proteinG: Joi.number().min(0).default(0),
  carbsG: Joi.number().min(0).default(0),
  fatG: Joi.number().min(0).default(0),
  ingredients: Joi.array().items(Joi.object({ name: Joi.string().required(), amount: Joi.string().allow('', null) })).default([]),
  steps: Joi.array().items(Joi.object({ description: Joi.string().required(), durationSec: Joi.number().integer().min(0).allow(null) })).default([])
});

router.post('/', requireAuth, validateBody(recipeSchema), recipesController.create);
router.put('/:id', requireAuth, validateBody(recipeSchema), recipesController.update);
router.delete('/:id', requireAuth, recipesController.remove);

export default router;
