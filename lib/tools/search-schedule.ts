import { tool } from 'ai';
import { z } from 'zod';
import eventsData from '@/data/events.json';

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

const events = eventsData as EventEntry[];

function formatEvent(event: EventEntry): string {
  const lines: string[] = [];
  lines.push(`Event: ${event.name}`);
  lines.push(`Date: ${event.day}, ${event.date}`);

  if (event.timeStart && event.timeEnd) {
    lines.push(`Time: ${event.timeStart} - ${event.timeEnd}`);
  } else {
    lines.push('Time: To be announced');
  }

  if (event.venue) {
    lines.push(`Venue: ${event.venue}`);
  } else {
    lines.push('Venue: To be announced');
  }

  if (event.price !== null) {
    lines.push(`Price: $${event.price} (total with fees: $${event.totalWithFees})`);
  } else {
    lines.push('Price: To be announced');
  }

  lines.push(`Status: ${event.status}`);
  lines.push(`Dress Code: ${event.dressCode}`);
  lines.push(`Description: ${event.description}`);

  if (event.presenter) {
    lines.push(`Presenter: ${event.presenter}`);
  }
  if (event.performer) {
    lines.push(`Performer: ${event.performer}`);
  }
  if (event.theme) {
    lines.push(`Theme: ${event.theme}`);
  }
  if (event.croquetTournamentAddOn) {
    lines.push(`Croquet Tournament Add-On: $${event.croquetTournamentAddOn}`);
  }

  lines.push(`Highlights: ${event.highlights.join('; ')}`);
  lines.push(`URL: ${event.url}`);

  return lines.join('\n');
}

export const searchSchedule = tool({
  description:
    'Search the festival schedule for event times, dates, venues, prices, and availability. Use this for any question about what events are happening, when they are, what they cost, or whether tickets are available.',
  parameters: z.object({
    query: z
      .string()
      .describe('The search query about events or schedule'),
  }),
  execute: async ({ query }: { query: string }) => {
    const q = query.toLowerCase();

    // Check for day-specific queries
    const dayKeywords: Record<string, string> = {
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      'feb 18': 'Wednesday',
      'feb 19': 'Thursday',
      'feb 20': 'Friday',
      'feb 21': 'Saturday',
      'feb 22': 'Sunday',
      'february 18': 'Wednesday',
      'february 19': 'Thursday',
      'february 20': 'Friday',
      'february 21': 'Saturday',
      'february 22': 'Sunday',
    };

    // Check for availability queries
    if (
      q.includes('available') ||
      q.includes('ticket') ||
      q.includes('sold out') ||
      q.includes('buy') ||
      q.includes('purchase') ||
      q.includes('still')
    ) {
      const available = events.filter(
        (e) => e.status === 'AVAILABLE'
      );
      const soldOut = events.filter(
        (e) => e.status === 'SOLD OUT'
      );

      let result = 'TICKET AVAILABILITY SUMMARY:\n\n';

      if (available.length > 0) {
        result += 'AVAILABLE:\n';
        for (const event of available) {
          result += formatEvent(event) + '\n\n';
        }
      }

      result += `SOLD OUT (${soldOut.length} events):\n`;
      for (const event of soldOut) {
        result += `- ${event.name} (${event.day}, ${event.date})\n`;
      }

      return result;
    }

    // Check for "today" or "tomorrow" queries
    if (q.includes('today') || q.includes('tomorrow') || q.includes('tonight')) {
      // Return all events so the LLM can match against today's date from the system prompt
      return events.map(formatEvent).join('\n\n---\n\n');
    }

    // Check for day-based queries
    for (const [keyword, day] of Object.entries(dayKeywords)) {
      if (q.includes(keyword)) {
        const dayEvents = events.filter((e) => e.day === day);
        if (dayEvents.length === 0) {
          return `No events found on ${day}.`;
        }
        return dayEvents.map(formatEvent).join('\n\n---\n\n');
      }
    }

    // Search by event name or keyword matching
    const matchingEvents = events.filter((event) => {
      const searchableText = [
        event.name,
        event.description,
        event.venue,
        event.day,
        event.presenter,
        event.performer,
        event.theme,
        ...event.highlights,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // Split query into words and check if any match
      const queryWords = q.split(/\s+/).filter((w: string) => w.length > 2);
      return queryWords.some((word: string) => searchableText.includes(word));
    });

    if (matchingEvents.length === 0) {
      // Return all events as a fallback so the LLM has full context
      return 'No exact match found. Here is the full schedule:\n\n' +
        events.map(formatEvent).join('\n\n---\n\n');
    }

    return matchingEvents.map(formatEvent).join('\n\n---\n\n');
  },
});
