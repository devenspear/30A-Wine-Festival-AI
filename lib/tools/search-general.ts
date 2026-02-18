import { tool } from 'ai';
import { z } from 'zod';
import { queryVector } from '@/lib/vector-store';
import { config } from '@/lib/config';

export const searchGeneral = tool({
  description:
    'Search general knowledge about the festival, charity (CVHN), Alys Beach history, sponsors, participants, or other background information not covered by schedule, venue, or FAQ searches. Uses the vector database for semantic search.',
  parameters: z.object({
    query: z
      .string()
      .describe(
        'The search query about festival history, charity, sponsors, participants, or general information'
      ),
  }),
  execute: async ({ query }: { query: string }) => {
    const results = await queryVector(query, config.VECTOR_TOP_K);

    if (results.length === 0) {
      return `No specific results found in the knowledge base for "${query}". Here is some general information:

The 30A Wine Festival is in its 14th year at Alys Beach, Florida. It is a five-day celebration of wine, spirits, and culinary arts held February 18-22, 2026. All proceeds benefit the Children's Volunteer Health Network (CVHN), which provides free dental and vision care to underserved children in Walton and Okaloosa Counties.

For more detailed information, visit ${config.WEBSITE_URL} or contact ${config.CONTACT_EMAIL} / ${config.CONTACT_PHONE}.`;
    }

    const formattedResults = results
      .map((result, index) => {
        const metadata = result.metadata || {};
        const lines: string[] = [];

        lines.push(`Result ${index + 1} (relevance: ${result.score.toFixed(3)}):`);

        if (metadata.title) {
          lines.push(`Title: ${metadata.title}`);
        }
        if (metadata.category) {
          lines.push(`Category: ${metadata.category}`);
        }
        if (metadata.source) {
          lines.push(`Source: ${metadata.source}`);
        }

        // Use data field (the original text) or metadata content
        const content = result.data || (metadata.content as string);
        if (content) {
          lines.push(`Content: ${content}`);
        }

        if (metadata.url) {
          lines.push(`URL: ${metadata.url}`);
        }

        return lines.join('\n');
      })
      .join('\n\n---\n\n');

    return formattedResults;
  },
});
