// REDIS DISABLED - NOT CONNECTING TO REDIS SERVER

import { type RedisClientType } from "redis";

// Mock Redis client that does nothing
class MockRedisClient {
  async set(key: string, value: string): Promise<string | null> {
    console.log(`[MOCK REDIS] SET ${key} = ${value}`);
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    console.log(`[MOCK REDIS] GET ${key} - returning null (cache miss)`);
    return null;
  }

  async del(key: string): Promise<number> {
    console.log(`[MOCK REDIS] DEL ${key}`);
    return 1;
  }

  async exists(key: string): Promise<number> {
    console.log(`[MOCK REDIS] EXISTS ${key} - returning 0 (not found)`);
    return 0;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async connect(): Promise<void> {
    console.log('[MOCK REDIS] Connected (no-op)');
  }

  async quit(): Promise<void> {
    console.log('[MOCK REDIS] Disconnected (no-op)');
  }

  on(event: string, listener: (...args: any[]) => void): void {
    console.log(`[MOCK REDIS] Event listener for ${event} (no-op)`);
  }
}

// Always return mock client since Redis is disabled
let redisClient: RedisClientType | null = new MockRedisClient() as any;

/**
 * Initialize Redis connection (disabled - returns mock client)
 */
const connectRedis = async (): Promise<RedisClientType> => {
  console.log('[REDIS DISABLED] Using mock Redis client');
  return redisClient as RedisClientType;
};

/**
 * Get Redis client instance (returns mock client)
 */
const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    return await connectRedis();
  }
  return redisClient;
};

/**
 * Close Redis connection (no-op)
 */
const closeRedis = async (): Promise<void> => {
  console.log('[MOCK REDIS] Close connection (no-op)');
};

/**
 * Cache utility functions (using mock Redis)
 */
export const cacheSet = async (key: string, value: any, ttl?: number): Promise<void> => {
  const client = await getRedisClient();
  const serializedValue = JSON.stringify(value);
  await client.set(key, serializedValue);
};

export const cacheGet = async (key: string): Promise<any | null> => {
  const client = await getRedisClient();
  const value = await client.get(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
};

export const cacheDel = async (key: string): Promise<boolean> => {
  const client = await getRedisClient();
  const result = await client.del(key);
  return result > 0;
};

export const cacheExists = async (key: string): Promise<boolean> => {
  const client = await getRedisClient();
  const result = await client.exists(key);
  return result > 0;
};

// Export the client getter and connection management
export { getRedisClient, closeRedis };
export default getRedisClient;