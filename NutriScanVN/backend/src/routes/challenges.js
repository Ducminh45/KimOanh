import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { challengesController } from '../controllers/challengesController.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';

const router = Router();

router.get('/', requireAuth, challengesController.list);
router.post('/join', requireAuth, validateBody(Joi.object({ challengeId: Joi.string().uuid().required() })), challengesController.join);

export default router;
