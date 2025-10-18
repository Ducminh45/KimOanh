import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';
import { billingController } from '../controllers/billingController.js';

const router = Router();

const updateSchema = Joi.object({
  tier: Joi.string().valid('free','premium_monthly','premium_yearly').required()
});

router.get('/me', requireAuth, billingController.getSubscription);
router.put('/me', requireAuth, validateBody(updateSchema), billingController.updateSubscription);

export default router;
