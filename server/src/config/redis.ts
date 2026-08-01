import { Redis } from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// In-Memory Fallback Cache for offline/test environments
class InMemoryCacheStore {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const val = (current ? parseInt(current, 10) : 0) + 1;
    await this.set(key, val.toString());
    return val;
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    const hashKey = `${key}:${field}`;
    const current = await this.get(hashKey);
    const val = (current ? parseInt(current, 10) : 0) + increment;
    await this.set(hashKey, val.toString());
    return val;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const prefix = `${key}:`;
    for (const [k, v] of this.store.entries()) {
      if (k.startsWith(prefix) && (!v.expiresAt || Date.now() <= v.expiresAt)) {
        const field = k.substring(prefix.length);
        result[field] = v.value;
      }
    }
    return result;
  }
}

const memoryFallback = new InMemoryCacheStore();

let isRedisConnected = false;
let redisClientInstance: Redis | null = null;

try {
  redisClientInstance = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Do not hang server if Redis is unreachable
  });

  redisClientInstance.on('connect', () => {
    isRedisConnected = true;
    logger.info(`Redis client connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
  });

  redisClientInstance.on('error', (err) => {
    isRedisConnected = false;
    logger.warn(`Redis connection unavailable (${err.message}). Using In-Memory Cache Store fallback.`);
  });
} catch (_err) {
  isRedisConnected = false;
  logger.warn('Failed to initialize Redis client. Using In-Memory Cache Store fallback.');
}

/**
 * Enterprise Production Redis Cache Interface
 */
export const redisCache = {
  isOnline: () => isRedisConnected,

  get: async (key: string): Promise<string | null> => {
    if (isRedisConnected && redisClientInstance) {
      try {
        return await redisClientInstance.get(key);
      } catch (_err) {
        return await memoryFallback.get(key);
      }
    }
    return await memoryFallback.get(key);
  },

  set: async (key: string, value: string, ttlSeconds?: number): Promise<string> => {
    if (isRedisConnected && redisClientInstance) {
      try {
        if (ttlSeconds) {
          return await redisClientInstance.set(key, value, 'EX', ttlSeconds);
        }
        return await redisClientInstance.set(key, value);
      } catch (_err) {
        return await memoryFallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
      }
    }
    return await memoryFallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
  },

  del: async (...keys: string[]): Promise<number> => {
    if (keys.length === 0) return 0;
    if (isRedisConnected && redisClientInstance) {
      try {
        return await redisClientInstance.del(...keys);
      } catch (_err) {
        return await memoryFallback.del(...keys);
      }
    }
    return await memoryFallback.del(...keys);
  },

  invalidatePattern: async (pattern: string): Promise<void> => {
    if (isRedisConnected && redisClientInstance) {
      try {
        const matchingKeys = await redisClientInstance.keys(pattern);
        if (matchingKeys.length > 0) {
          await redisClientInstance.del(...matchingKeys);
        }
        return;
      } catch (_err) {
        // Fallback to memory
      }
    }
    const matchingKeys = await memoryFallback.keys(pattern);
    if (matchingKeys.length > 0) {
      await memoryFallback.del(...matchingKeys);
    }
  },

  hincrby: async (key: string, field: string, increment = 1): Promise<number> => {
    if (isRedisConnected && redisClientInstance) {
      try {
        return await redisClientInstance.hincrby(key, field, increment);
      } catch (_err) {
        return await memoryFallback.hincrby(key, field, increment);
      }
    }
    return await memoryFallback.hincrby(key, field, increment);
  },

  hgetall: async (key: string): Promise<Record<string, string>> => {
    if (isRedisConnected && redisClientInstance) {
      try {
        return await redisClientInstance.hgetall(key);
      } catch (_err) {
        return await memoryFallback.hgetall(key);
      }
    }
    return await memoryFallback.hgetall(key);
  },
};

export default redisCache;
