import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';
import Joi from 'joi';
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

// Weight
router.get('/weight', requireAuth, progressController.listWeight);
router.post('/weight', requireAuth, validateBody(Joi.object({ weightKg: Joi.number().min(20).max(500).required() })), progressController.addWeight);
router.delete('/weight/:id', requireAuth, progressController.deleteWeight);

export default router;
