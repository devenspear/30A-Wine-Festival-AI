import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { config } from '@/lib/config';
import { getSystemPrompt } from '@/lib/system-prompt';
import { festivalTools } from '@/lib/tools';
import { rateLimit } from '@/lib/rate-limit';
import { trackChatRequest, trackChatResponse } from '@/lib/analytics';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > config.MAX_MESSAGES_PER_SESSION) {
      return new Response(
        JSON.stringify({
          error: `Session limit of ${config.MAX_MESSAGES_PER_SESSION} messages reached. Please start a new conversation.`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit by IP
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? 'unknown';
    const rateLimitResult = await rateLimit(ip);

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'You are sending messages too quickly. Please wait a moment and try again.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      );
    }

    const currentSessionId = sessionId || `anon-${ip}-${Date.now()}`;
    trackChatRequest(currentSessionId).catch(() => {});

    const today = new Date().toISOString().split('T')[0];

    const result = streamText({
      model: anthropic(config.MODEL_ID),
      system: getSystemPrompt(today),
      messages,
      tools: festivalTools,
      maxTokens: config.MAX_TOKENS,
      temperature: config.TEMPERATURE,
      maxSteps: 3,
      onFinish: async ({ usage }) => {
        trackChatResponse({
          sessionId: currentSessionId,
          inputTokens: usage.promptTokens,
          outputTokens: usage.completionTokens,
        }).catch(() => {});
      },
    });

    return result.toDataStreamResponse({
      headers: {
        'X-Session-ID': currentSessionId,
      },
    });
  } catch (error) {
    console.error('[chat] Error:', error);

    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
