import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

/**
 * Cache Configuration
 */
const CACHE_TTL = {
  PRODUCTS: 60 * 5, // 5 minutes
  CATEGORIES: 60 * 15, // 15 minutes
  PRODUCT_DETAIL: 60 * 10, // 10 minutes
  USER_DATA: 60 * 2, // 2 minutes
} as const;

/**
 * Initialize Redis client for caching
 * Uses same Upstash Redis as rate limiting
 */
let redis: Redis | null = null;

function initRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      logger.info("Redis cache initialized");
    } catch (error) {
      logger.error("Failed to initialize Redis cache", { error });
    }
  }
}

// Initialize on module load
initRedis();

/**
 * Check if caching is enabled
 */
function isCacheEnabled(): boolean {
  return redis !== null && process.env.NODE_ENV !== "test";
}

/**
 * Generate cache key with namespace
 */
function getCacheKey(namespace: string, identifier: string): string {
  return `cache:${namespace}:${identifier}`;
}

/**
 * Get value from cache
 * @param namespace - Cache namespace (products, categories, etc.)
 * @param key - Unique identifier
 * @returns Cached value or null if not found/expired
 */
export async function getFromCache<T>(
  namespace: string,
  key: string
): Promise<T | null> {
  if (!isCacheEnabled()) {
    return null;
  }

  try {
    const cacheKey = getCacheKey(namespace, key);
    const cached = await redis!.get(cacheKey);
    
    if (cached) {
      logger.debug("Cache HIT", { key: cacheKey });
      return cached as T;
    }
    
    logger.debug("Cache MISS", { key: cacheKey });
    return null;
  } catch (error) {
    logger.error("Cache read error", { error });
    return null; // Fail gracefully
  }
}

/**
 * Set value in cache with TTL
 * @param namespace - Cache namespace
 * @param key - Unique identifier
 * @param value - Data to cache
 * @param ttl - Time to live in seconds (optional, uses namespace default)
 */
export async function setCache<T>(
  namespace: string,
  key: string,
  value: T,
  ttl?: number
): Promise<void> {
  if (!isCacheEnabled()) {
    return;
  }

  try {
    const cacheKey = getCacheKey(namespace, key);
    const cacheTTL = ttl || CACHE_TTL.PRODUCTS; // Default TTL
    
    await redis!.set(cacheKey, value, { ex: cacheTTL });
    logger.debug("Cache SET", { key: cacheKey, ttl: cacheTTL });
  } catch (error) {
    logger.error("Cache write error", { error });
    // Fail gracefully - don't break the request
  }
}

/**
 * Delete value from cache
 * @param namespace - Cache namespace
 * @param key - Unique identifier
 */
export async function deleteFromCache(
  namespace: string,
  key: string
): Promise<void> {
  if (!isCacheEnabled()) {
    return;
  }

  try {
    const cacheKey = getCacheKey(namespace, key);
    await redis!.del(cacheKey);
    logger.debug("Cache DELETE", { key: cacheKey });
  } catch (error) {
    logger.error("Cache delete error", { error });
  }
}

/**
 * Delete multiple keys matching a pattern
 * Uses SCAN instead of KEYS to avoid blocking Redis in production
 * @param pattern - Redis key pattern (e.g., "cache:products:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!isCacheEnabled()) {
    return;
  }

  try {
    let scanCursor = 0;
    let totalDeleted = 0;

    do {
      // SCAN is non-blocking unlike KEYS which can lock Redis
      const result: [string, string[]] = await redis!.scan(scanCursor, {
        match: pattern,
        count: 100,
      });
      scanCursor = parseInt(result[0], 10);
      const keys = result[1];

      if (keys.length > 0) {
        await redis!.del(...keys);
        totalDeleted += keys.length;
      }
    } while (scanCursor !== 0);

    if (totalDeleted > 0) {
      logger.debug("Cache INVALIDATE", { pattern, totalDeleted });
    }
  } catch (error) {
    logger.error("Cache invalidation error", { error });
  }
}

/**
 * Invalidate all cache for a namespace
 * @param namespace - Cache namespace to clear
 */
export async function invalidateNamespace(namespace: string): Promise<void> {
  await invalidateCachePattern(`cache:${namespace}:*`);
}

/**
 * Cache decorator for async functions
 * Automatically caches function result
 */
export function withCache<T>(
  namespace: string,
  keyFn: (...args: any[]) => string,
  ttl?: number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const cacheKey = keyFn(...args);
      
      // Try to get from cache
      const cached = await getFromCache<T>(namespace, cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original function
      const result = await originalMethod.apply(this, args);

      // Cache the result
      await setCache(namespace, cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Get or set cache with a fallback function
 * Common pattern: check cache, if miss execute query and cache result
 */
export async function getOrSet<T>(
  namespace: string,
  key: string,
  fallback: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try cache first
  const cached = await getFromCache<T>(namespace, key);
  if (cached !== null) {
    return cached;
  }

  // Execute fallback
  const result = await fallback();

  // Cache the result
  await setCache(namespace, key, result, ttl);

  return result;
}

// Export TTL constants for use in routes
export { CACHE_TTL };
