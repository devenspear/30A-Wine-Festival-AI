export const config = {
  // Site identity
  SITE_NAME: '30A Wine Festival AI Concierge',
  SITE_DESCRIPTION:
    'Your AI guide to the 14th Annual 30A Wine Festival at Alys Beach',

  // Event details
  EVENT_NAME: '30A Wine Festival',
  EVENT_DATES: 'February 18-22, 2026',
  EVENT_LOCATION: 'Alys Beach, Florida',

  // Contact information
  CONTACT_EMAIL: 'events@alysbeach.com',
  CONTACT_PHONE: '(850) 745-2951',
  SOCIAL_INSTAGRAM: '@30awinefest',
  WEBSITE_URL: 'https://www.30awinefestival.com',

  // Charity
  CHARITY_NAME: "Children's Volunteer Health Network (CVHN)",

  // AI model configuration
  MODEL_ID: 'claude-sonnet-4-5-20250514',
  MAX_MESSAGES_PER_SESSION: 50,
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,

  // Rate limiting
  RATE_LIMIT_REQUESTS: 20,
  RATE_LIMIT_WINDOW: '1 m' as const,

  // Lifecycle
  ACTIVE_UNTIL: '2026-03-01',

  // Vector search
  VECTOR_TOP_K: 5,
} as const;
