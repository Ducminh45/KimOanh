import dotenv from 'dotenv';
import pg from 'pg';
import { newDb } from 'pg-mem';
import { logger } from '../services/logger.js';

dotenv.config();

const { Pool } = pg;

let pool;

if (process.env.PG_INMEMORY === 'true') {
  const mem = newDb({ autoCreateForeignKeyIndices: true });
  const adapter = mem.adapters.createPg();
  pool = new adapter.Pool();
  logger.warn('Using in-memory Postgres (pg-mem). Not for production.');
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'nutriscan',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    max: 10,
    idleTimeoutMillis: 30000
  });

  pool.on('error', (err) => {
    logger.error('Unexpected PG pool error', { error: err.message });
  });
}

export async function query(sql, params = []) {
  const start = Date.now();
  const res = await pool.query(sql, params);
  const durationMs = Date.now() - start;
  logger.debug('Executed query', { rows: res.rowCount, durationMs });
  return res;
}

export async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  client.query = async (...args) => query(...args);
  client.release = () => release();

  return client;
}
