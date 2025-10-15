import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';
import { foodController } from '../controllers/foodController.js';

const router = Router();

router.get('/search', requireAuth, foodController.search);
router.get('/:id', requireAuth, foodController.getById);

router.get('/me/favorites', requireAuth, foodController.getFavorites);
router.post('/me/favorites', requireAuth, validateBody(schemas.favoriteFood), foodController.addFavorite);
router.delete('/me/favorites/:foodId', requireAuth, foodController.removeFavorite);

export default router;
