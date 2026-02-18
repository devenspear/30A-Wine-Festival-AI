import { Index } from '@upstash/vector';
import { config } from './config';

type VectorMetadata = Record<string, unknown>;

let index: Index | null = null;

function getIndex(): Index | null {
  if (index) return index;

  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[vector-store] UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN not set. Vector search disabled.'
    );
    return null;
  }

  index = new Index({ url, token });
  return index;
}

/**
 * Query the vector index using Upstash's built-in embedding (data field).
 * Supports hybrid search (vector + BM25) when the index is configured for it.
 */
export async function queryVector(
  text: string,
  topK: number = config.VECTOR_TOP_K,
  filter?: string
): Promise<
  Array<{
    id: string | number;
    score: number;
    metadata?: VectorMetadata;
    data?: string;
  }>
> {
  const idx = getIndex();
  if (!idx) {
    return [];
  }

  try {
    const results = await idx.query<VectorMetadata>({
      data: text,
      topK,
      includeMetadata: true,
      includeData: true,
      ...(filter ? { filter } : {}),
    });

    return results;
  } catch (error) {
    console.error('[vector-store] Query failed:', error);
    return [];
  }
}

/**
 * Upsert a document into the vector index.
 * Uses Upstash's data field for automatic server-side embedding.
 */
export async function upsertVector(
  id: string,
  data: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const idx = getIndex();
  if (!idx) {
    console.warn('[vector-store] Cannot upsert: vector store not configured.');
    return;
  }

  try {
    await idx.upsert({
      id,
      data,
      metadata,
    });
  } catch (error) {
    console.error('[vector-store] Upsert failed:', error);
    throw error;
  }
}
