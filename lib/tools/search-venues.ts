import { tool } from 'ai';
import { z } from 'zod';

// Venue data is embedded here since venues.json may not exist yet.
// This will be replaced with a JSON import once data/venues.json is created.
interface VenueEntry {
  id: string;
  name: string;
  description: string;
  location: string;
  events: string[];
  parkingNotes?: string;
  directions?: string;
  mapUrl?: string;
}

const venues: VenueEntry[] = [
  {
    id: 'caliza-red-loggia',
    name: 'Red Loggia at Caliza Restaurant',
    description:
      'An iconic dining venue within Alys Beach, the Red Loggia at Caliza Restaurant features stunning architecture and an intimate atmosphere perfect for upscale wine dinners.',
    location: 'Caliza Restaurant, Alys Beach',
    events: ['Wine Dinner'],
    parkingNotes:
      'Valet parking may be available. Street parking along 30A is limited; consider ride-sharing.',
    directions:
      'Located within the Caliza Pool & Restaurant complex in the heart of Alys Beach.',
  },
  {
    id: 'arboleda-park',
    name: 'Arboleda Park',
    description:
      'A beautiful park space in Alys Beach, Arboleda Park provides a scenic outdoor setting surrounded by the community\'s signature white architecture.',
    location: 'Arboleda Park, Alys Beach',
    events: ['Oysters + Champagne'],
    parkingNotes:
      'Limited on-site parking. Shuttle or ride-share recommended for evening events.',
  },
  {
    id: 'papilio-park',
    name: 'Papilio Park',
    description:
      'A vibrant gathering space in Alys Beach, Papilio Park hosts lively events with room for entertainment and open-air dining.',
    location: 'Papilio Park, Alys Beach',
    events: ['Tapas & Tequila'],
  },
  {
    id: 'central-park',
    name: 'Central Park',
    description:
      'The central green space of Alys Beach, Central Park is a versatile outdoor venue that hosts some of the festival\'s largest and most popular events.',
    location: 'Central Park, Alys Beach',
    events: ['Bourbon, Beer & Butts', 'Rose & Croquet'],
    parkingNotes:
      'Nearby street parking available. Expect higher traffic during Bourbon, Beer & Butts and Rose & Croquet.',
  },
  {
    id: 'south-charles-gulf-green',
    name: 'South Charles Street to Gulf Green',
    description:
      'A stunning stretch from South Charles Street down to Gulf Green along the coast, this venue corridor hosts the Grand Tasting — the festival\'s flagship event. The walkable route features dozens of wine, spirit, and food stations.',
    location: 'South Charles Street to Gulf Green, Alys Beach',
    events: ['Grand Tasting'],
    parkingNotes:
      'Very limited parking. Shuttle service and ride-sharing strongly recommended for the Grand Tasting.',
  },
  {
    id: 'gulf-green',
    name: 'Gulf Green',
    description:
      'A beautiful oceanside green space at the southern edge of Alys Beach, Gulf Green offers stunning Gulf views and serves as the venue for the beloved Gospel Brunch.',
    location: 'Gulf Green, Alys Beach',
    events: ['Gospel Brunch'],
    parkingNotes:
      'Limited parking near Gulf Green. Arrive early or use ride-sharing services.',
  },
];

function formatVenue(venue: VenueEntry): string {
  const lines: string[] = [];
  lines.push(`Venue: ${venue.name}`);
  lines.push(`Location: ${venue.location}`);
  lines.push(`Description: ${venue.description}`);
  lines.push(`Events Held Here: ${venue.events.join(', ')}`);

  if (venue.parkingNotes) {
    lines.push(`Parking: ${venue.parkingNotes}`);
  }
  if (venue.directions) {
    lines.push(`Directions: ${venue.directions}`);
  }
  if (venue.mapUrl) {
    lines.push(`Map: ${venue.mapUrl}`);
  }

  return lines.join('\n');
}

export const searchVenues = tool({
  description:
    'Search for venue information including location descriptions, directions, and parking details. Use this when someone asks about where an event is held, how to get there, or parking.',
  parameters: z.object({
    query: z
      .string()
      .describe('The search query about venues, directions, or parking'),
  }),
  execute: async ({ query }: { query: string }) => {
    const q = query.toLowerCase();

    // Check for parking-specific queries
    if (q.includes('parking') || q.includes('park') || q.includes('drive') || q.includes('car')) {
      const venuesWithParking = venues.filter((v) => v.parkingNotes);
      if (venuesWithParking.length > 0) {
        let result = 'PARKING INFORMATION:\n\n';
        result +=
          'General: Parking at Alys Beach is limited, especially during festival events. Ride-sharing services (Uber/Lyft) and festival shuttles are strongly recommended. If driving, arrive early to secure street parking along 30A.\n\n';
        for (const venue of venuesWithParking) {
          result += `${venue.name}: ${venue.parkingNotes}\n\n`;
        }
        return result;
      }
    }

    // Check for directions / how to get there
    if (
      q.includes('direction') ||
      q.includes('how to get') ||
      q.includes('where is') ||
      q.includes('located') ||
      q.includes('address') ||
      q.includes('map')
    ) {
      let result =
        'GETTING TO ALYS BEACH:\n\nAlys Beach is located along Scenic Highway 30A in Northwest Florida, between Panama City Beach and Destin. The address is Alys Beach, FL 32461.\n\n';
      result += 'VENUE LOCATIONS:\n\n';
      for (const venue of venues) {
        result += formatVenue(venue) + '\n\n';
      }
      result +=
        'For an interactive map, visit: https://www.30awinefestival.com/map';
      return result;
    }

    // Search by venue name or event name
    const matchingVenues = venues.filter((venue) => {
      const searchableText = [
        venue.name,
        venue.description,
        venue.location,
        ...venue.events,
      ]
        .join(' ')
        .toLowerCase();

      const queryWords = q.split(/\s+/).filter((w: string) => w.length > 2);
      return queryWords.some((word: string) => searchableText.includes(word));
    });

    if (matchingVenues.length === 0) {
      return (
        'All festival events take place within Alys Beach, Florida along Scenic Highway 30A.\n\n' +
        venues.map(formatVenue).join('\n\n---\n\n')
      );
    }

    return matchingVenues.map(formatVenue).join('\n\n---\n\n');
  },
});
