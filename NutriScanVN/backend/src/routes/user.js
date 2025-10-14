import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';
import { userController } from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, validateBody(schemas.updateProfile), userController.updateProfile);

router.get('/metrics', requireAuth, userController.getMetrics);
router.put('/metrics', requireAuth, validateBody(schemas.updateMetrics), userController.updateMetrics);

export default router;
