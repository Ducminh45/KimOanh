import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';
import { socialController } from '../controllers/socialController.js';

const router = Router();

router.get('/feed', requireAuth, socialController.feed);
router.post('/posts', requireAuth, validateBody(Joi.object({ content: Joi.string().allow('', null), imageUrl: Joi.string().uri().allow(null) })), socialController.createPost);
router.post('/posts/:postId/like', requireAuth, socialController.like);
router.delete('/posts/:postId/like', requireAuth, socialController.unlike);
router.post('/posts/:postId/comments', requireAuth, validateBody(Joi.object({ content: Joi.string().min(1).required() })), socialController.comment);

export default router;
