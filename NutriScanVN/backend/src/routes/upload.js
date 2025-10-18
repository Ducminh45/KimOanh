import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';
import { uploadController } from '../controllers/uploadController.js';

const router = Router();

router.post('/base64', requireAuth, validateBody(Joi.object({ imageBase64: Joi.string().pattern(/^[A-Za-z0-9+/=]+$/).required(), extension: Joi.string().max(5).optional() })), uploadController.uploadBase64);

export default router;
