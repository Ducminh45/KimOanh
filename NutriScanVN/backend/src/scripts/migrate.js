import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';
import { logger } from '../services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlFile(relativePath) {
  const fullPath = path.join(__dirname, '../../', 'database', relativePath);
  const sql = await readFile(fullPath, 'utf8');
  await query(sql);
}

(async () => {
  try {
    logger.info('Running database migrations...');
    await runSqlFile('schema.sql');
    logger.info('Schema applied');
    try { await runSqlFile('recipes.sql'); logger.info('Recipes schema applied'); } catch {}
    try { await runSqlFile('shopping.sql'); logger.info('Shopping schema applied'); } catch {}
    try {
      await runSqlFile('seeds.sql');
      logger.info('Seeds applied');
    } catch (seedErr) {
      logger.warn('Seeding failed or skipped', { error: seedErr.message });
    }
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed', { error: err.message, stack: err.stack });
    process.exit(1);
  }
})();
