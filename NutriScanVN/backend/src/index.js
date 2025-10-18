import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './services/logger.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import foodRoutes from './routes/food.js';
import progressRoutes from './routes/progress.js';
import aiRoutes from './routes/ai.js';
import diaryRoutes from './routes/diary.js';
import billingRoutes from './routes/billing.js';
import socialRoutes from './routes/social.js';
import challengesRoutes from './routes/challenges.js';
import uploadRoutes from './routes/upload.js';
import path from 'path';
import recipesRoutes from './routes/recipes.js';
import shoppingRoutes from './routes/shopping.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(helmet());

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/uploads', (req, res, next) => {
  // serve static uploaded images
  const p = path.join(process.cwd(), 'NutriScanVN/backend/uploads');
  return express.static(p)(req, res, next);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  logger.info(`NutriScanVN backend listening on port ${port}`);
});
