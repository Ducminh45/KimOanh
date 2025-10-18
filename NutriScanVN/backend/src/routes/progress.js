import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';
import { progressController } from '../controllers/progressController.js';

const router = Router();

// Water
router.get('/water', requireAuth, progressController.listWater);
router.post('/water', requireAuth, validateBody(schemas.addWater), progressController.addWater);
router.delete('/water/:id', requireAuth, progressController.deleteWater);

// Exercise
router.get('/exercise', requireAuth, progressController.listExercise);
router.post('/exercise', requireAuth, validateBody(schemas.addExercise), progressController.addExercise);
router.delete('/exercise/:id', requireAuth, progressController.deleteExercise);

// Daily summary (calories, macros, water, exercise)
router.get('/summary', requireAuth, progressController.getDailySummary);
router.get('/history', requireAuth, progressController.getHistory);

export default router;
