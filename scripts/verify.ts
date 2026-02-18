/**
 * 30A Wine Festival AI — Verification Script
 *
 * Verifies data integrity and vector store functionality.
 *
 * Usage: pnpm verify
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { Index } from '@upstash/vector';
import eventsData from '../data/events.json';
import generalData from '../data/general.json';
import venuesData from '../data/venues.json';
import faqData from '../data/faq.json';

async function main() {
  console.log('=== 30A Wine Festival AI — Verification ===\n');

  // --- Step 1: Verify data files ---
  console.log('1. DATA FILE VERIFICATION\n');

  const events = eventsData as Array<{ id: string; name: string; status: string; date: string }>;
  const venues = venuesData as Array<{ id: string; name: string }>;
  const faqs = faqData as Array<{ id: string; question: string }>;
  const general = generalData as Array<{ id: string; title: string }>;

  console.log(`  Events:  ${events.length} entries`);
  for (const e of events) {
    console.log(`    - ${e.name} (${e.date}) — ${e.status}`);
  }

  console.log(`  Venues:  ${venues.length} entries`);
  for (const v of venues) {
    console.log(`    - ${v.name}`);
  }

  console.log(`  FAQs:    ${faqs.length} entries`);
  for (const f of faqs) {
    console.log(`    - ${f.question}`);
  }

  console.log(`  General: ${general.length} entries`);
  for (const g of general) {
    console.log(`    - ${g.title}`);
  }

  const totalLocal = events.length + venues.length + faqs.length + general.length;
  console.log(`\n  Total local data: ${totalLocal} entries\n`);

  // --- Step 2: Verify vector store ---
  console.log('2. VECTOR STORE VERIFICATION\n');

  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    console.warn('  SKIPPED: UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN not set.');
    console.warn('  Vector store verification requires these environment variables.');
    console.log('\n  The chatbot will still work without vector search — it uses');
    console.log('  structured tool-based search for events, venues, and FAQs.');
    console.log('  Vector search is only needed for the general knowledge tool.\n');
  } else {
    const index = new Index({ url, token });

    try {
      const info = await index.info();
      console.log(`  Index dimensions: ${info.dimension}`);
      console.log(`  Index vector count: ${info.vectorCount}`);
      console.log(`  Index pending count: ${info.pendingVectorCount}`);

      // Test queries
      const testQueries = [
        'What is the Grand Tasting?',
        'Where is Alys Beach?',
        'What charity does the festival support?',
        'What should I wear?',
        'How do I get tickets?',
      ];

      console.log('\n  Test Queries:');
      for (const query of testQueries) {
        try {
          const results = await index.query({
            data: query,
            topK: 3,
            includeMetadata: true,
          });

          console.log(`\n  Q: "${query}"`);
          if (results.length === 0) {
            console.log('    No results found.');
          } else {
            for (const result of results) {
              const meta = result.metadata as Record<string, unknown>;
              const title = meta?.title || meta?.name || meta?.question || result.id;
              console.log(`    - [${result.score.toFixed(3)}] ${title}`);
            }
          }
        } catch (error) {
          console.error(`    Query failed: ${error}`);
        }
      }
    } catch (error) {
      console.error(`  Vector store error: ${error}`);
    }
  }

  // --- Step 3: Verify configuration ---
  console.log('\n3. CONFIGURATION VERIFICATION\n');

  const requiredEnvVars = ['OPENAI_API_KEY'];
  const optionalEnvVars = [
    'UPSTASH_VECTOR_REST_URL',
    'UPSTASH_VECTOR_REST_TOKEN',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'ADMIN_PASSWORD',
    'CRON_SECRET',
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`  [OK] ${envVar} is set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`  [MISSING] ${envVar} — REQUIRED for the chatbot to work`);
    }
  }

  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`  [OK] ${envVar} is set`);
    } else {
      console.log(`  [--] ${envVar} — optional, feature disabled`);
    }
  }

  console.log('\n=== Verification Complete ===');
}

main().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
