import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { createErrorResponse, ErrorCode } from "@/lib/errors";
import { logger } from "@/lib/logger";

// Initialize Redis client
// NOTE: Add these to your .env.local:
// UPSTASH_REDIS_REST_URL=your_url_here
// UPSTASH_REDIS_REST_TOKEN=your_token_here

let redis: Redis | null = null;
let ratelimiters: {
  strict: Ratelimit | null;
  moderate: Ratelimit | null;
  relaxed: Ratelimit | null;
} = {
  strict: null,
  moderate: null,
  relaxed: null,
};

// Initialize Redis and rate limiters only if environment variables are set
function initRateLimiters() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      // Strict rate limit - for mutations (create/update/delete)
      ratelimiters.strict = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
        analytics: true,
        prefix: "@ratelimit/strict",
      });

      // Moderate rate limit - for authenticated reads
      ratelimiters.moderate = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
        analytics: true,
        prefix: "@ratelimit/moderate",
      });

      // Relaxed rate limit - for public reads
      ratelimiters.relaxed = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
        analytics: true,
        prefix: "@ratelimit/relaxed",
      });

      logger.info("Rate limiters initialized");
    } catch (error) {
      logger.error("Failed to initialize rate limiters", { error });
    }
  }
}

// Initialize on module load
initRateLimiters();

export type RateLimitTier = "strict" | "moderate" | "relaxed";

/**
 * Rate limit check for API routes
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param tier - Rate limit tier (strict/moderate/relaxed)
 * @returns NextResponse with 429 error if rate limited, null if allowed
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = "moderate"
): Promise<NextResponse | null> {
  // If Redis is not configured, skip rate limiting (dev mode)
  if (!redis || !ratelimiters[tier]) {
    if (process.env.NODE_ENV === "development") {
      logger.warn("Rate limiting disabled - Redis not configured");
    }
    return null;
  }

  try {
    const { success, limit, reset, remaining } = await ratelimiters[tier]!.limit(identifier);

    if (!success) {
      return createErrorResponse({
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        details: {
          limit,
          remaining: 0,
          reset: new Date(reset).toISOString(),
        },
      });
    }

    return null;
  } catch (error) {
    logger.error("Rate limit check error", { error });
    // On error, allow the request (fail open)
    return null;
  }
}

/**
 * Get rate limit identifier from request
 * Prioritizes user ID, falls back to IP address
 */
export function getRateLimitIdentifier(userId?: string, ipAddress?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ipAddress) {
    return `ip:${ipAddress}`;
  }
  return "anonymous";
}

/**
 * Extract IP address from request headers
 */
export function getIpAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}
