import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validateBody, schemas } from '../middleware/validation.js';
import { authLimiter, tightAuthLimiter } from '../middleware/security.js';

const router = Router();

router.post('/register', tightAuthLimiter, validateBody(schemas.register), authController.register);
router.post('/login', tightAuthLimiter, validateBody(schemas.login), authController.login);
router.post('/refresh', authLimiter, validateBody(schemas.refresh), authController.refresh);
router.post('/forgot-password', tightAuthLimiter, validateBody(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', tightAuthLimiter, validateBody(schemas.resetPassword), authController.resetPassword);
router.get('/verify-email', authLimiter, authController.verifyEmail);

export default router;
