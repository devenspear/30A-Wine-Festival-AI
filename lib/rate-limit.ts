import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { config } from './config';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Rate limiting disabled.'
    );
    return null;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(
      config.RATE_LIMIT_REQUESTS,
      config.RATE_LIMIT_WINDOW
    ),
    prefix: '30a-wine-festival',
  });

  return ratelimit;
}

export async function rateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const rl = getRatelimit();

  if (!rl) {
    // Allow all requests if rate limiting is not configured (local dev)
    return {
      success: true,
      limit: config.RATE_LIMIT_REQUESTS,
      remaining: config.RATE_LIMIT_REQUESTS,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await rl.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('[rate-limit] Error checking rate limit:', error);
    // Fail open: allow the request if rate limiting errors
    return {
      success: true,
      limit: config.RATE_LIMIT_REQUESTS,
      remaining: config.RATE_LIMIT_REQUESTS,
      reset: Date.now() + 60000,
    };
  }
}
