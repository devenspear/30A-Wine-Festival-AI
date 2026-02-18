import { tool } from 'ai';
import { z } from 'zod';

// FAQ data embedded directly. Will be replaced with JSON import once data/faq.json is created.
interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const faqData: FAQEntry[] = [
  {
    id: 'faq-dress-code-general',
    question: 'What should I wear to the festival events?',
    answer:
      'Dress codes vary by event. Wine Dinner: Elegant evening attire. Oysters + Champagne: Smart casual to dressy. Tapas & Tequila: Smart casual. Mixology Seminar: Smart casual. Bourbon, Beer & Butts: Casual, comfortable attire. Grand Tasting: Elevated cocktail attire — embrace the India/South Asia theme with colorful and elegant pieces. Gospel Brunch: Sunday brunch attire, smart casual. Rose & Croquet: All white attire is encouraged for this elegant garden party closing event.',
    category: 'dress-code',
    keywords: [
      'wear', 'dress', 'attire', 'outfit', 'clothes', 'clothing',
      'dress code', 'dresscode', 'white', 'formal', 'casual',
    ],
  },
  {
    id: 'faq-parking',
    question: 'Where do I park for the festival?',
    answer:
      'Parking at Alys Beach is limited, especially during festival events. We strongly recommend ride-sharing services like Uber or Lyft. If you drive, limited street parking is available along Scenic Highway 30A. Arrive early to secure a spot. Some events may offer valet parking — check the specific event details. Festival shuttles may also be available.',
    category: 'logistics',
    keywords: [
      'park', 'parking', 'car', 'drive', 'driving', 'uber', 'lyft',
      'shuttle', 'valet', 'transportation', 'ride',
    ],
  },
  {
    id: 'faq-tickets',
    question: 'How do I get tickets?',
    answer:
      'Tickets are available at 30awinefestival.com. Please note that most events for 2026 are currently SOLD OUT. Tapas & Tequila (Thursday, Feb 19) is currently the only event with tickets still available at $275 ($288.91 with fees). The Mixology Seminar (Friday, Feb 20) may also have availability — check the website for the latest status. For waitlist inquiries on sold-out events, contact events@alysbeach.com.',
    category: 'tickets',
    keywords: [
      'ticket', 'tickets', 'buy', 'purchase', 'sold out', 'soldout',
      'available', 'price', 'cost', 'how much', 'waitlist', 'wait list',
    ],
  },
  {
    id: 'faq-charity',
    question: 'What charity does the festival benefit?',
    answer:
      "All proceeds from the 30A Wine Festival benefit the Children's Volunteer Health Network (CVHN). CVHN provides free dental and vision care to underserved children in Walton and Okaloosa Counties in Northwest Florida. Since its founding, CVHN has provided thousands of children with essential health services they might not otherwise receive. By attending the festival, guests directly support this vital mission.",
    category: 'charity',
    keywords: [
      'charity', 'cvhn', 'children', 'volunteer', 'health', 'donate',
      'donation', 'benefit', 'proceeds', 'cause', 'nonprofit', 'non-profit',
      'dental', 'vision',
    ],
  },
  {
    id: 'faq-weather',
    question: 'What is the weather like during the festival?',
    answer:
      'The festival takes place in mid-to-late February in Northwest Florida. Expect temperatures in the 50s to 60s Fahrenheit during the day, with cooler evenings in the 40s to 50s. Rain is possible, so bring a light jacket or wrap for outdoor events. The Grand Tasting and other outdoor events proceed rain or shine. Check your weather app closer to the event for the latest forecast.',
    category: 'logistics',
    keywords: [
      'weather', 'temperature', 'rain', 'cold', 'warm', 'jacket',
      'umbrella', 'forecast', 'climate',
    ],
  },
  {
    id: 'faq-age-restriction',
    question: 'Is there an age requirement for the festival?',
    answer:
      'The 30A Wine Festival events that include alcohol service are 21 and over only. Valid photo ID is required for entry. Some family-friendly activities may be available in Alys Beach during the festival week, but the main ticketed events are adults-only.',
    category: 'logistics',
    keywords: [
      'age', 'old', 'children', 'kids', 'minor', 'id', 'identification',
      '21', 'adult', 'family',
    ],
  },
  {
    id: 'faq-refund',
    question: 'Can I get a refund on my tickets?',
    answer:
      'For ticket refund inquiries, please contact events@alysbeach.com or call (850) 745-2951. Refund policies may vary by event. We recommend reaching out as soon as possible if you need to make changes to your reservation.',
    category: 'tickets',
    keywords: [
      'refund', 'cancel', 'cancellation', 'exchange', 'transfer',
      'return', 'money back',
    ],
  },
  {
    id: 'faq-accommodation',
    question: 'Where should I stay during the festival?',
    answer:
      'Alys Beach and the surrounding 30A area offer a variety of accommodations. Options include vacation rentals in Alys Beach, nearby Rosemary Beach, and Seaside. Hotels are also available in the Destin and Panama City Beach areas (a 20-40 minute drive). We recommend booking early as accommodations fill up during festival week. Check VRBO, Airbnb, or local rental agencies like 30A Luxury Vacations for availability.',
    category: 'logistics',
    keywords: [
      'stay', 'hotel', 'accommodation', 'lodging', 'rental', 'airbnb',
      'vrbo', 'sleep', 'where to stay', 'book', 'room', 'house',
    ],
  },
  {
    id: 'faq-alys-beach',
    question: 'What is Alys Beach?',
    answer:
      'Alys Beach is a master-planned community on Scenic Highway 30A in Northwest Florida, located between Panama City Beach and Destin. Known for its striking white Bermuda-inspired architecture, courtyards, and beautiful Gulf-front setting, Alys Beach is one of the premier communities on the Emerald Coast. The town features restaurants, shops, pools, and pristine beaches. It has been the home of the 30A Wine Festival since the event\'s inception.',
    category: 'general',
    keywords: [
      'alys beach', 'alys', 'beach', '30a', 'where', 'location',
      'about', 'community', 'town', 'florida',
    ],
  },
  {
    id: 'faq-grand-tasting-theme',
    question: 'What is the theme of the 2026 Grand Tasting?',
    answer:
      'The 2026 Grand Tasting theme celebrates the flavors and culture of India and South Asia. Guests are encouraged to incorporate the theme into their attire with colorful and elegant pieces. The Grand Tasting takes place on Saturday, February 21 from 3:30 PM to 6:30 PM along South Charles Street to Gulf Green.',
    category: 'events',
    keywords: [
      'theme', 'india', 'south asia', 'grand tasting', 'saturday',
      'culture', 'dress', 'attire',
    ],
  },
];

export const searchFAQ = tool({
  description:
    'Search frequently asked questions about the festival including dress code, parking, tickets, weather, accommodations, age requirements, and general logistics. Use this for practical questions about attending the festival.',
  parameters: z.object({
    query: z
      .string()
      .describe('The search query about festival logistics, dress code, parking, or other FAQ topics'),
  }),
  execute: async ({ query }: { query: string }) => {
    const q = query.toLowerCase();

    // Score each FAQ entry based on keyword matches
    const scored = faqData.map((faq) => {
      let score = 0;

      // Check keyword matches
      for (const keyword of faq.keywords) {
        if (q.includes(keyword.toLowerCase())) {
          score += keyword.includes(' ') ? 3 : 1; // Multi-word keywords score higher
        }
      }

      // Check question text match
      const questionWords = faq.question.toLowerCase().split(/\s+/);
      const queryWords = q.split(/\s+/).filter((w: string) => w.length > 2);
      for (const qw of queryWords) {
        if (questionWords.some((w: string) => w.includes(qw))) {
          score += 1;
        }
      }

      // Check answer text match
      const answerLower = faq.answer.toLowerCase();
      for (const qw of queryWords) {
        if (answerLower.includes(qw)) {
          score += 0.5;
        }
      }

      return { faq, score };
    });

    // Sort by score and take top 3
    const topResults = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (topResults.length === 0) {
      return 'No matching FAQ entries found for this query. For specific questions, contact events@alysbeach.com or call (850) 745-2951.';
    }

    return topResults
      .map(({ faq }) => {
        return `Q: ${faq.question}\nA: ${faq.answer}\nCategory: ${faq.category}`;
      })
      .join('\n\n---\n\n');
  },
});
