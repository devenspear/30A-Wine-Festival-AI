import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[analytics] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Analytics disabled.'
    );
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

const PREFIX = '30a-wine:analytics';

/**
 * Track a new chat request.
 */
export async function trackChatRequest(sessionId: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const pipeline = client.pipeline();

    // Increment total message count
    pipeline.hincrby(`${PREFIX}:totals`, 'messages', 1);

    // Track unique sessions using a sorted set (score = timestamp)
    pipeline.zadd(`${PREFIX}:sessions`, {
      score: Date.now(),
      member: sessionId,
    });

    // Track daily message count
    pipeline.hincrby(`${PREFIX}:daily:${today}`, 'messages', 1);

    // Track daily unique sessions
    pipeline.sadd(`${PREFIX}:daily-sessions:${today}`, sessionId);

    await pipeline.exec();
  } catch (error) {
    console.error('[analytics] Failed to track chat request:', error);
  }
}

/**
 * Track a chat response including token usage and query category.
 */
export async function trackChatResponse(params: {
  sessionId: string;
  category?: string;
  inputTokens?: number;
  outputTokens?: number;
}): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const pipeline = client.pipeline();

    // Track token usage
    if (params.inputTokens) {
      pipeline.hincrby(`${PREFIX}:totals`, 'inputTokens', params.inputTokens);
      pipeline.hincrby(`${PREFIX}:daily:${today}`, 'inputTokens', params.inputTokens);
    }
    if (params.outputTokens) {
      pipeline.hincrby(`${PREFIX}:totals`, 'outputTokens', params.outputTokens);
      pipeline.hincrby(`${PREFIX}:daily:${today}`, 'outputTokens', params.outputTokens);
    }

    // Track query category
    if (params.category) {
      pipeline.hincrby(`${PREFIX}:categories`, params.category, 1);
      pipeline.hincrby(
        `${PREFIX}:daily-categories:${today}`,
        params.category,
        1
      );
    }

    await pipeline.exec();
  } catch (error) {
    console.error('[analytics] Failed to track chat response:', error);
  }
}

/**
 * Get real-time analytics stats.
 */
export async function getRealTimeStats(): Promise<{
  totalMessages: number;
  totalSessions: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  todayMessages: number;
  todaySessions: number;
  categories: Record<string, number>;
} | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totals,
      sessionCount,
      dailyStats,
      dailySessionCount,
      categories,
    ] = await Promise.all([
      client.hgetall(`${PREFIX}:totals`),
      client.zcard(`${PREFIX}:sessions`),
      client.hgetall(`${PREFIX}:daily:${today}`),
      client.scard(`${PREFIX}:daily-sessions:${today}`),
      client.hgetall(`${PREFIX}:categories`),
    ]);

    return {
      totalMessages: Number(totals?.messages ?? 0),
      totalSessions: sessionCount,
      totalInputTokens: Number(totals?.inputTokens ?? 0),
      totalOutputTokens: Number(totals?.outputTokens ?? 0),
      todayMessages: Number(dailyStats?.messages ?? 0),
      todaySessions: dailySessionCount,
      categories: Object.fromEntries(
        Object.entries(categories ?? {}).map(([k, v]) => [k, Number(v)])
      ),
    };
  } catch (error) {
    console.error('[analytics] Failed to get real-time stats:', error);
    return null;
  }
}

/**
 * Clean up analytics data older than the specified number of days.
 */
export async function cleanupOldAnalytics(daysOld: number = 30): Promise<number> {
  const client = getRedis();
  if (!client) return 0;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTimestamp = cutoffDate.getTime();

    // Remove old sessions from the sorted set
    const removedSessions = await client.zremrangebyscore(
      `${PREFIX}:sessions`,
      0,
      cutoffTimestamp
    );

    // Clean up old daily keys by iterating back from the cutoff
    let cleanedKeys = 0;
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const dailyPrefixes = [
      `${PREFIX}:daily:`,
      `${PREFIX}:daily-sessions:`,
      `${PREFIX}:daily-categories:`,
    ];

    for (const prefix of dailyPrefixes) {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await client.scan(cursor, {
          match: `${prefix}*`,
          count: 100,
        });
        cursor = Number(nextCursor);

        for (const key of keys) {
          const dateStr = key.replace(prefix, '');
          if (dateStr < cutoffDateStr) {
            await client.del(key);
            cleanedKeys++;
          }
        }
      } while (cursor !== 0);
    }

    return removedSessions + cleanedKeys;
  } catch (error) {
    console.error('[analytics] Failed to cleanup old analytics:', error);
    return 0;
  }
}
