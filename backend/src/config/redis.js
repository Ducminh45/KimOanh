const redis = require('redis');
require('dotenv').config();

let client = null;

const connectRedis = async () => {
  try {
    if (!process.env.REDIS_HOST) {
      console.log('⚠️  Redis not configured, caching disabled');
      return null;
    }

    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    return null;
  }
};

// Cache helper functions
const cache = {
  async get(key) {
    if (!client) return null;
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async set(key, value, expirationInSeconds = 3600) {
    if (!client) return false;
    try {
      await client.setEx(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  async del(key) {
    if (!client) return false;
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  async clear(pattern = '*') {
    if (!client) return false;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis clear error:', error);
      return false;
    }
  },
};

module.exports = {
  connectRedis,
  cache,
  client: () => client,
};
