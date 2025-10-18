import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiController } from '../controllers/aiController.js';
import { validateBody, schemas } from '../middleware/validation.js';

const router = Router();

router.post('/scan', requireAuth, validateBody(schemas.aiScan), aiController.scanFood);
router.post('/chat', requireAuth, validateBody(schemas.aiChat), aiController.chat);
router.post('/mealplan', requireAuth, aiController.mealPlan);

export default router;
