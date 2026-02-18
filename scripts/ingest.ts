/**
 * 30A Wine Festival AI — Data Ingestion Script
 *
 * Loads data from JSON files and upserts into Upstash Vector.
 * Uses the `data` field for server-side embedding (no OpenAI key required).
 *
 * Usage: pnpm ingest
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

interface EventEntry {
  id: string;
  name: string;
  date: string;
  day: string;
  timeStart: string | null;
  timeEnd: string | null;
  venue: string | null;
  description: string;
  price: number | null;
  totalWithFees: number | null;
  status: string;
  dressCode: string;
  highlights: string[];
  url: string;
  presenter?: string | null;
  performer?: string | null;
  theme?: string;
  croquetTournamentAddOn?: number;
}

interface GeneralEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  url: string;
}

interface VenueEntry {
  id: string;
  name: string;
  description: string;
  location: string;
  events: string[];
  parkingNotes?: string;
  directions?: string;
}

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

async function main() {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    console.error('Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN');
    console.error('Set these in .env.local before running ingestion.');
    process.exit(1);
  }

  const index = new Index({ url, token });

  console.log('Starting ingestion into Upstash Vector...\n');

  let totalUpserted = 0;

  // --- Events ---
  console.log(`Ingesting ${(eventsData as EventEntry[]).length} events...`);
  for (const event of eventsData as EventEntry[]) {
    const textContent = [
      `Event: ${event.name}`,
      `Date: ${event.day}, ${event.date}`,
      event.timeStart && event.timeEnd ? `Time: ${event.timeStart} - ${event.timeEnd}` : '',
      event.venue ? `Venue: ${event.venue}` : '',
      `Status: ${event.status}`,
      event.price !== null ? `Price: $${event.price} (total with fees: $${event.totalWithFees})` : '',
      `Dress Code: ${event.dressCode}`,
      `Description: ${event.description}`,
      event.presenter ? `Presenter: ${event.presenter}` : '',
      event.performer ? `Performer: ${event.performer}` : '',
      event.theme ? `Theme: ${event.theme}` : '',
      `Highlights: ${event.highlights.join('; ')}`,
    ]
      .filter(Boolean)
      .join('\n');

    await index.upsert({
      id: `event-${event.id}`,
      data: textContent,
      metadata: {
        type: 'event',
        name: event.name,
        date: event.date,
        day: event.day,
        status: event.status,
        url: event.url,
      },
    });
    totalUpserted++;
    process.stdout.write(`  [${totalUpserted}] ${event.name}\n`);
  }

  // --- Venues ---
  console.log(`\nIngesting ${(venuesData as VenueEntry[]).length} venues...`);
  for (const venue of venuesData as VenueEntry[]) {
    const textContent = [
      `Venue: ${venue.name}`,
      `Location: ${venue.location}`,
      `Description: ${venue.description}`,
      `Events: ${venue.events.join(', ')}`,
      venue.parkingNotes ? `Parking: ${venue.parkingNotes}` : '',
      venue.directions ? `Directions: ${venue.directions}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await index.upsert({
      id: `venue-${venue.id}`,
      data: textContent,
      metadata: {
        type: 'venue',
        name: venue.name,
        location: venue.location,
      },
    });
    totalUpserted++;
    process.stdout.write(`  [${totalUpserted}] ${venue.name}\n`);
  }

  // --- FAQ ---
  console.log(`\nIngesting ${(faqData as FAQEntry[]).length} FAQ entries...`);
  for (const faq of faqData as FAQEntry[]) {
    const textContent = [
      `Question: ${faq.question}`,
      `Answer: ${faq.answer}`,
      `Category: ${faq.category}`,
      `Keywords: ${faq.keywords.join(', ')}`,
    ].join('\n');

    await index.upsert({
      id: `faq-${faq.id}`,
      data: textContent,
      metadata: {
        type: 'faq',
        question: faq.question,
        category: faq.category,
      },
    });
    totalUpserted++;
    process.stdout.write(`  [${totalUpserted}] ${faq.question}\n`);
  }

  // --- General Knowledge ---
  console.log(`\nIngesting ${(generalData as GeneralEntry[]).length} general entries...`);
  for (const entry of generalData as GeneralEntry[]) {
    await index.upsert({
      id: `general-${entry.id}`,
      data: entry.content,
      metadata: {
        type: 'general',
        title: entry.title,
        category: entry.category,
        url: entry.url,
      },
    });
    totalUpserted++;
    process.stdout.write(`  [${totalUpserted}] ${entry.title}\n`);
  }

  console.log(`\nIngestion complete. ${totalUpserted} documents upserted.`);
}

main().catch((error) => {
  console.error('Ingestion failed:', error);
  process.exit(1);
});
