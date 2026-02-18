# Product Requirements Document
# 30A Wine Festival AI Concierge

**Version:** 1.0.0
**Date:** February 17, 2026
**Author:** Deven Spear + Claude Opus 4.6
**Client:** Alys Beach (The Alys Foundation)
**Event:** 14th Annual 30A Wine Festival
**Event Dates:** February 18-22, 2026
**Target Launch:** February 18, 2026 (Day 1 of festival)

---

## 1. Executive Summary

Build an AI-powered concierge chatbot for the 30A Wine Festival at Alys Beach, Florida. The chatbot will serve as an intelligent guide for ~1,000 attendees, answering questions about the schedule, events, venues, tickets, logistics, dress code, parking, and more.

This is an evolution of the **Crafted AI Chatbot** (craftedai.web0101.com) built for the CRAFTED 2025 event in November 2025. The new version incorporates significant architectural improvements:

- **True vector search** replacing keyword-based text matching
- **Agentic RAG** with specialized tools instead of one-size-fits-all search
- **Hybrid search** (vector + BM25) for proper noun accuracy
- **Claude Sonnet 4.6** (released today) replacing Claude 3.5 Haiku
- **Rich UI** with event cards, streaming responses, and contextual suggestions
- **Modern, beautiful design** reflecting Alys Beach's Mediterranean luxury aesthetic

---

## 2. Background & Context

### 2.1 The Event
The 30A Wine Festival is a five-day celebration of wine, spirits, and culinary arts in the planned community of Alys Beach on Scenic Highway 30A in Northwest Florida. Now in its 14th year, the festival is underwritten by The Alys Foundation with all proceeds benefiting the Children's Volunteer Health Network (CVHN), which provides free dental and vision care to underserved children in Walton and Okaloosa Counties.

### 2.2 The Predecessor (Crafted AI)
The Crafted AI chatbot was built in December 2025 for CRAFTED 2025 at Alys Beach. Key architecture:
- **Tech:** Next.js 16 + React 19 + Tailwind CSS 4 on Vercel
- **LLM:** Claude 3.5 Haiku via Vercel AI SDK
- **RAG:** Keyword-based text search (no vector embeddings)
- **Data:** 97KB JSON file with 50 pages of scraped content
- **Features:** Streaming chat, dark/light mode, analytics via Vercel KV, rate limiting via Upstash
- **Repo:** github.com/devenspear/Crafted25-AIChatbot

### 2.3 What We're Improving
| Aspect | Crafted AI (Dec 2025) | 30A Wine Festival AI (Feb 2026) |
|--------|----------------------|----------------------------------|
| Search | Keyword matching (+100 exact, +10 keyword) | True vector embeddings + BM25 hybrid search |
| Architecture | Monolithic RAG pipeline | Agentic RAG with specialized tools |
| LLM | Claude 3.5 Haiku | Claude Sonnet 4.6 (Opus-level quality, Sonnet pricing) |
| Vector DB | None (JSON text search) | Upstash Vector (serverless, edge-native) |
| Embeddings | None | OpenAI text-embedding-3-large (1536 dims) |
| UI | Basic chat bubbles | Rich event cards, source citations, contextual suggestions |
| Data ingestion | Manual JSON assembly | Automated scraping with Playwright + structured ingestion |
| Analytics | Vercel KV (Redis) | Vercel KV (carried forward, proven) |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals
1. **Serve festival attendees** with accurate, instant answers about schedule, venues, tickets, dress code, parking, and logistics
2. **Enhance the attendee experience** with a sophisticated, on-brand AI concierge
3. **Demonstrate AI capability** to Alys Beach as a client deliverable
4. **Reduce support burden** on event staff by deflecting common questions to the chatbot

### 3.2 Success Metrics
| Metric | Target |
|--------|--------|
| Uptime during festival (Feb 18-22) | 99.9% |
| Average response time (first token) | < 1 second |
| Answer accuracy (spot-checked) | > 95% |
| User sessions during festival | 200+ |
| Average messages per session | 3+ |
| Mobile usability (Lighthouse score) | 90+ |

---

## 4. Technical Architecture

### 4.1 Stack Overview

```
Frontend (Vercel Edge)
├── Next.js 16 (App Router)
├── React 19
├── Tailwind CSS 4
├── Vercel AI SDK (useChat + streaming)
└── Framer Motion (animations)

Backend (Vercel Serverless)
├── Claude Sonnet 4.6 (via @ai-sdk/anthropic)
├── Agentic RAG (tool-based retrieval)
├── Upstash Vector (hybrid search: vector + BM25)
├── OpenAI text-embedding-3-large (embeddings)
├── Vercel KV (analytics + sessions)
└── Upstash Ratelimit (abuse prevention)

Data Pipeline
├── Playwright (browser-based scraping of Wix site)
├── Content extraction + cleaning
├── Recursive chunking (512 tokens, 100 token overlap)
├── Embedding generation (OpenAI)
├── Upstash Vector ingestion (with metadata)
└── Structured data extraction (schedule, venues, prices)
```

### 4.2 Agentic RAG Architecture

Instead of a single RAG pipeline, the LLM has access to specialized tools and decides which to call based on the user's question:

```
User: "What time is the Gospel Brunch?"
  → Claude calls: searchSchedule("Gospel Brunch")
  → Returns: structured event data (time, venue, price, status)
  → Claude formats: natural language response with event card

User: "What should I wear to the Grand Tasting?"
  → Claude calls: searchFAQ("dress code Grand Tasting")
  → Returns: dress code guidelines for Saturday
  → Claude formats: friendly style advice

User: "Tell me about the charity"
  → Claude calls: searchGeneral("charity beneficiary CVHN")
  → Returns: CVHN mission, impact stats, Tyler's story
  → Claude formats: heartfelt description with key stats

User: "What's still available?"
  → Claude calls: searchSchedule("available tickets")
  → Returns: all events with availability status
  → Claude formats: summary table showing sold out vs available
```

**Tool Definitions:**

| Tool | Purpose | Data Source |
|------|---------|-------------|
| `searchSchedule` | Event times, dates, venues, prices, availability | Structured event data |
| `searchVenues` | Venue descriptions, locations, directions | Venue metadata |
| `searchFAQ` | Logistics, parking, dress code, policies, weather | FAQ content chunks |
| `searchGeneral` | General info, history, charity, sponsors, participants | Full vector search |

### 4.3 Vector Database (Upstash Vector)

**Why Upstash Vector:**
- Serverless (no infrastructure to manage)
- Edge-native (works from Vercel Edge Functions)
- Built-in hybrid search (vector + BM25, no extra config)
- REST API (no binary dependencies)
- Free tier: 10,000 vectors (more than enough for ~200 chunks)
- Pay-per-use beyond free tier (pennies/month at this scale)
- DiskANN algorithm for accuracy

**Schema:**
```typescript
// Each vector entry
{
  id: string,                    // "event-gospel-brunch" or "faq-dress-code-001"
  vector: number[],              // 1536-dim embedding
  metadata: {
    source: "event" | "venue" | "faq" | "general",
    category: string,            // "schedule", "logistics", "charity", etc.
    title: string,               // Document/section title
    url: string,                 // Source URL
    content: string,             // Full text chunk (for BM25 + display)
    eventDate?: string,          // ISO date if event-related
    eventTime?: string,          // Time range if event-related
    venue?: string,              // Venue name if applicable
    price?: number,              // Price if applicable
    soldOut?: boolean,           // Availability status
  }
}
```

### 4.4 Embedding Strategy

**Model:** OpenAI text-embedding-3-large
- 1536 dimensions (using Matryoshka reduction from 3072 for storage efficiency)
- 8,192 token context window
- Excellent retrieval accuracy for English content
- $0.13/1M tokens (~$0.01 for entire festival dataset)

**Chunking:**
- Recursive character splitting at 512 tokens
- 100 token overlap between chunks
- Contextual header prepended: `"Source: [title] | Section: [heading] | URL: [url]"`
- Structured events stored as individual records (not chunked)

### 4.5 Hybrid Search Flow

```
User Query
    ↓
Embed query (OpenAI text-embedding-3-large)
    ↓
Upstash Vector hybrid search:
  ├── Vector similarity (cosine) → semantic matches
  └── BM25 keyword search → exact term matches
    ↓
Reciprocal Rank Fusion (built into Upstash)
    ↓
Top 5 results with metadata
    ↓
Formatted context → Claude Sonnet 4.6
    ↓
Streaming response to user
```

---

## 5. Data Pipeline

### 5.1 Content Sources

The 30A Wine Festival website (30awinefestival.com) is built on Wix Thunderbolt, which renders all content client-side. Standard HTTP fetching returns only framework code.

**Scraping Strategy:** Use Playwright (headless Chromium) to render pages and extract visible content.

### 5.2 Pages to Scrape

| Page | URL | Content Type |
|------|-----|-------------|
| Homepage | `/` | Overview, dates, location |
| About | `/about` | History, mission, CVHN |
| FAQ | `/about/faq/` | Logistics, policies, dress code |
| Schedule | `/schedule` | Event listing |
| Wine Dinner | `/events/wine-dinner` | Event details |
| Oysters + Champagne | `/events/oysters-+-champagne` | Event details |
| Tapas & Tequila | `/events/tapas-&-tequila` | Event details |
| Mixology Seminar | `/events/mixology-seminar` | Event details |
| Bourbon, Beer & Butts | `/events/bourbon,-beer-&-butts` | Event details |
| Grand Tasting | `/events/grand-tasting` | Event details |
| Gospel Brunch | `/events/gospel-brunch` | Event details |
| Rose & Croquet | `/events/rose-&-croquet` | Event details |
| Participants | `/participants` | Wineries, chefs, distilleries |
| Sponsors | `/sponsors` | Sponsor list |
| Auction | `/auction` | Silent auction details |
| Map | `/map` | Venue locations |
| Gallery | `/gallery` | Photo gallery |

### 5.3 Supplementary Data (Already Gathered)

From third-party sources (30a.com, BigTickets, Garden & Gun, SoWal, Alys Beach official site), we have already gathered:

- Full event schedule with dates, times, venues, and prices
- Ticket availability status (most events SOLD OUT)
- Dress code guidelines per event
- Parking and directions
- CVHN charity details and impact statistics
- Alys Beach architectural and venue context
- Historical festival information

This supplementary data will be merged with scraped content to ensure completeness.

### 5.4 Data Ingestion Pipeline

```
1. Playwright scrape → raw HTML per page
2. Content extraction → clean text + metadata
3. Manual supplementation → add gathered data for gaps
4. Structured data extraction → events, venues, FAQ as JSON
5. Text chunking → recursive 512-token chunks with headers
6. Embedding generation → OpenAI text-embedding-3-large
7. Upstash Vector upsert → vectors + metadata
8. Verification → query each event name, check results
```

### 5.5 Structured Event Data

In addition to vector search, a structured JSON dataset will be maintained for precise schedule lookups:

```json
{
  "events": [
    {
      "name": "Wine Dinner",
      "date": "2026-02-18",
      "day": "Wednesday",
      "time": "6:00 PM - 9:00 PM",
      "venue": "Red Loggia at Caliza Restaurant",
      "description": "Four-course meal with exceptional fine wines...",
      "price": 350,
      "totalWithFees": 367.47,
      "status": "SOLD OUT",
      "dressCode": "Elegant evening wear",
      "highlights": ["Four-course meal", "Fine wine pairings", "Intimate setting"]
    }
  ]
}
```

This powers the `searchSchedule` tool directly (no embedding needed for structured lookups).

---

## 6. Feature Specification

### 6.1 Core Features (MVP - Launch Day)

#### F1: Streaming AI Chat
- Real-time token-by-token streaming responses
- Claude Sonnet 4.6 as the LLM
- Agentic RAG with 4 specialized tools
- Conversation history maintained per session
- Max 50 messages per session

#### F2: Smart Suggested Questions
- 4 contextual starter questions on first load:
  - "What's happening today?" (day-aware)
  - "Which events still have tickets?"
  - "What should I wear?"
  - "How do I get to Alys Beach?"
- After each response, show 2-3 contextual follow-up suggestions
- Suggestions update based on conversation context

#### F3: Rich Event Cards
- When answering about specific events, render a styled card:
  - Event name, date, time, venue
  - Price and availability badge (SOLD OUT / AVAILABLE)
  - Brief description
  - Dress code hint
- Cards are generated via Generative UI (Vercel AI SDK tool results rendered as React components)

#### F4: Day-Aware Intelligence
- The system prompt includes today's date
- "What's happening today?" returns the correct day's events
- "What's tomorrow?" works correctly
- After the festival ends, switches to "The festival has concluded" messaging

#### F5: Source Citations
- Each answer includes a subtle footnote linking to the source page on 30awinefestival.com
- Builds trust and drives traffic to the official site
- Format: `[1] 30awinefestival.com/events/grand-tasting`

#### F6: Mobile-First Design
- Primary use case: attendees on phones at the venue
- Touch-optimized input and buttons
- No horizontal scrolling
- Fast load on 4G/LTE
- iOS safe area handling (notch, home indicator)

#### F7: Rate Limiting
- 20 requests/minute per IP (chat)
- Upstash Ratelimit (carried forward from Crafted AI)
- Graceful error message on rate limit hit

#### F8: Analytics Dashboard
- Admin-only dashboard (password protected)
- Real-time metrics: active sessions, messages, popular questions
- Query categorization (schedule, logistics, tickets, general)
- Token usage and cost tracking
- Carried forward from Crafted AI with improvements

### 6.2 Enhanced Features (Day 1 if time permits)

#### F9: Ticket Availability Awareness
- Clearly communicate which events are sold out
- Highlight Tapas & Tequila as the only available event
- Suggest contacting events@alysbeach.com for waitlist inquiries

#### F10: Weather Integration
- Fetch current/forecast weather for Alys Beach area
- Proactively mention weather when answering logistics questions
- "It's expected to be 68F and sunny tomorrow — perfect for the outdoor Grand Tasting"

#### F11: Venue Map Link
- When mentioning a venue, include a link to the map page
- "The Gospel Brunch is at Gulf Green. [View Map](https://www.30awinefestival.com/map)"

#### F12: Dark/Light Theme
- Automatic based on system preference
- Manual toggle in settings
- Carried forward from Crafted AI

### 6.3 Future Features (Post-Festival)

#### F13: Photo Upload + Vision
- Users can upload photos ("What venue is this?")
- Claude Sonnet 4.6 vision capabilities for photo identification
- Useful for wayfinding at the festival

#### F14: Multi-Language Support
- Spanish and French translation for international attendees
- Claude handles this natively, just needs system prompt instruction

#### F15: Feedback Collection
- Thumbs up/down on each response
- Optional comment field
- Data stored in Vercel KV for post-festival analysis

---

## 7. System Prompt Design

The system prompt establishes the AI's personality, knowledge boundaries, and response formatting:

```
You are the 30A Wine Festival AI Concierge — a knowledgeable, warm, and
sophisticated guide for the 14th Annual 30A Wine Festival at Alys Beach, Florida
(February 18-22, 2026).

PERSONALITY:
- Southern hospitality with coastal elegance
- Enthusiastic but not overly casual
- Knowledgeable like a seasoned event coordinator
- Warm and welcoming, reflecting the spirit of Alys Beach
- Occasionally mention the charitable mission (CVHN) when natural

KNOWLEDGE BOUNDARIES:
- ONLY answer questions about the 30A Wine Festival, Alys Beach, and related logistics
- If asked about unrelated topics, politely redirect: "I'm your 30A Wine Festival
  concierge — I'd love to help with anything about the festival, events, or Alys Beach!"
- Never fabricate information. If unsure, say so and suggest contacting
  events@alysbeach.com or calling (850) 745-2951

RESPONSE FORMAT:
- Keep responses concise (2-4 sentences for simple questions, more for detailed ones)
- Use plain text — no markdown asterisks or bold formatting
- Include source citations as numbered footnotes when referencing specific data
- For schedule questions, present information clearly with times and venues
- Mention ticket availability status (most events are SOLD OUT)
- For dress code questions, be specific to the event day

TODAY'S DATE: {dynamically injected}
CURRENT TIME: {dynamically injected}

RELEVANT CONTEXT:
{injected by agentic RAG tools}
```

---

## 8. UI/UX Design

### 8.1 Design Philosophy
The chatbot should feel like a natural extension of the 30A Wine Festival brand — coastal luxury, Mediterranean elegance, and Southern warmth. Not a generic chatbot, but a bespoke digital concierge.

### 8.2 Color Palette

| Token | Color | Usage |
|-------|-------|-------|
| `--primary` | `#1a1a2e` | Deep navy — headers, primary text |
| `--accent` | `#8B2252` | Wine burgundy — buttons, links, highlights |
| `--accent-light` | `#C4A35A` | Gold — badges, accents, borders |
| `--bg-primary` | `#FAFAF8` | Warm white — main background |
| `--bg-secondary` | `#F0EDE6` | Warm sand — cards, input area |
| `--bg-chat-user` | `#8B2252` | Wine burgundy — user message bubbles |
| `--bg-chat-ai` | `#FFFFFF` | White — AI message bubbles |
| `--text-primary` | `#1a1a2e` | Deep navy — body text |
| `--text-secondary` | `#6B7280` | Warm gray — secondary text |
| `--success` | `#059669` | Green — available badges |
| `--danger` | `#DC2626` | Red — sold out badges |

Dark mode inverts appropriately with deep navy background and light text.

### 8.3 Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Brand name / Header | `Playfair Display` (serif) | 700 | 24px |
| Event card titles | `Playfair Display` (serif) | 600 | 18px |
| Body text / Chat | `Inter` (sans-serif) | 400 | 16px |
| UI labels / Meta | `Inter` (sans-serif) | 500 | 14px |
| Footnotes / Citations | `Inter` (sans-serif) | 400 | 12px |

Note: Per Mr. Spear's preference, no serif fonts for body text. Playfair Display used only for brand headers and event titles to match the festival's elegant positioning. All body/chat text uses Inter (sans-serif).

### 8.4 Layout

```
┌─────────────────────────────────┐
│  🍷 30A WINE FESTIVAL           │  ← Fixed header, glassmorphic
│     AI Concierge                │
├─────────────────────────────────┤
│                                 │
│  Welcome! I'm your AI          │  ← Welcome message
│  concierge for the 14th        │
│  Annual 30A Wine Festival.     │
│                                 │
│  ┌──────────┐ ┌──────────┐    │  ← Suggested questions (2x2 grid)
│  │ Today's  │ │ Tickets  │    │
│  │ Events   │ │ Available│    │
│  └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐    │
│  │ What to  │ │ Getting  │    │
│  │ Wear     │ │ There    │    │
│  └──────────┘ └──────────┘    │
│                                 │
│  ┌─────────────────────────┐   │  ← Event card (when triggered)
│  │ 🍷 Grand Tasting        │   │
│  │ Sat, Feb 21 | 3:30-6:30│   │
│  │ South Charles Street    │   │
│  │ $472.23 | ● SOLD OUT   │   │
│  │ 80+ wines, India theme  │   │
│  └─────────────────────────┘   │
│                                 │
│         User message      ───► │  ← Right-aligned, wine burgundy
│                                 │
│  ◄── AI response with          │  ← Left-aligned, white card
│      streaming text...          │
│      [1] 30awinefestival.com   │
│                                 │
├─────────────────────────────────┤
│  ┌───────────────────────┐ ➤  │  ← Fixed input bar
│  │ Ask about the festival │    │
│  └───────────────────────┘     │
│  Benefiting CVHN | v1.0.0      │  ← Footer with charity mention
└─────────────────────────────────┘
```

### 8.5 Animations
- Messages fade in with subtle slide-up (Framer Motion)
- Typing indicator: three dots pulse animation
- Event cards: gentle scale-in on appearance
- Suggested questions: stagger-in animation on load
- Theme transition: smooth color crossfade

### 8.6 Responsive Breakpoints
- **Mobile (default):** 320-767px — single column, full-width cards
- **Tablet:** 768-1023px — slightly wider chat area, same layout
- **Desktop:** 1024px+ — centered chat container (max 720px), subtle background pattern

---

## 9. Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...              # Claude Sonnet 4.6
OPENAI_API_KEY=sk-...                      # text-embedding-3-large
UPSTASH_VECTOR_REST_URL=https://...        # Upstash Vector endpoint
UPSTASH_VECTOR_REST_TOKEN=...              # Upstash Vector auth token

# Analytics (Vercel KV)
KV_REST_API_URL=https://...                # Vercel KV Redis URL
KV_REST_API_TOKEN=...                      # Vercel KV auth token

# Rate Limiting (can reuse KV or separate Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...         # Rate limit store
UPSTASH_REDIS_REST_TOKEN=...               # Rate limit auth

# Admin
ADMIN_PASSWORD=...                          # Analytics dashboard access

# Optional
CRON_SECRET=...                             # Vercel cron job auth
NEXT_PUBLIC_SITE_URL=https://...           # Public URL for meta tags
```

---

## 10. Deployment Plan

### 10.1 Infrastructure Setup
1. Create new Vercel project: `30a-wine-festival-ai`
2. Create Upstash Vector index (1536 dimensions, cosine similarity, hybrid search enabled)
3. Create Vercel KV store (or reuse existing)
4. Configure environment variables
5. Set up custom domain (TBD — e.g., `ai.30awinefestival.com` or `30awine.web0101.com`)

### 10.2 Build & Deploy Pipeline
1. Push to GitHub repo `devenspear/30A-Wine-Festival-AI`
2. Vercel auto-deploys from `main` branch
3. Preview deployments on feature branches
4. Version bumped before every push (`npm version patch`)

### 10.3 Launch Timeline

| Phase | Task | Target |
|-------|------|--------|
| **Phase 1** | Scaffold project, set up infra | Feb 17 evening |
| **Phase 2** | Scrape content, build vector DB | Feb 17 evening |
| **Phase 3** | Build chat API with agentic RAG | Feb 17 evening |
| **Phase 4** | Build UI | Feb 17-18 |
| **Phase 5** | Test, fix, polish | Feb 18 morning |
| **Phase 6** | Deploy to production | Feb 18 |
| **Phase 7** | Monitor during festival | Feb 18-22 |

---

## 11. Data Accuracy & Quality Assurance

Per CLAUDE.md mandatory rules:

### 11.1 No Fake Data
- Every data point displayed to users must come from the scraped dataset or verified sources
- If data is missing (e.g., Mixology Seminar time), display "Contact events@alysbeach.com for details"
- Never show placeholder prices, times, or availability

### 11.2 Verification Checklist
Before launch:
- [ ] Query every event by name — correct details returned?
- [ ] Ask "What's happening [day]?" for each day — correct schedule?
- [ ] Ask about sold out events — correctly shows SOLD OUT?
- [ ] Ask about Tapas & Tequila — correctly shows AVAILABLE?
- [ ] Ask dress code questions — correct per-event guidance?
- [ ] Ask about parking — correct directions?
- [ ] Ask about CVHN — accurate stats?
- [ ] Ask unrelated question — properly redirected?
- [ ] Mobile test on iPhone — layout correct, no cropping?
- [ ] Rate limit test — hits limit at 20 req/min?

### 11.3 Content Gaps
These items could not be scraped from the Wix site and need manual verification or Playwright scraping:
- Full participant list (wineries, chefs, distilleries)
- Complete sponsor list with tiers
- Auction items and bidding details
- Mixology Seminar pricing and exact time
- Interactive venue map details

**Mitigation:** For any content gap, the chatbot will direct users to the relevant page on 30awinefestival.com or suggest calling (850) 745-2951.

---

## 12. Cost Estimates

### 12.1 Monthly Infrastructure
| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Hobby/Pro) | $0-20/mo | Already on Pro plan |
| Claude Sonnet 4.6 | ~$5-15/mo | ~1000 msgs/day during festival week |
| OpenAI Embeddings | < $0.01 | One-time ingestion cost |
| Upstash Vector | $0 | Free tier (10K vectors) |
| Upstash Redis (rate limit) | $0 | Free tier |
| Vercel KV | $0 | Free tier |
| **Total** | **~$5-35/mo** | Primarily LLM API costs |

### 12.2 Per-Message Cost
- Embedding query: ~$0.00001
- Claude Sonnet 4.6 (input + output): ~$0.003-0.01
- Vector search: $0 (included in free tier)
- **Total per message: ~$0.01**

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Wix scraping fails | Medium | High | Supplementary data already gathered from 15+ third-party sources |
| Inaccurate event info | Low | High | Verification checklist, source citations, contact fallback |
| API rate limits hit | Low | Medium | Upstash rate limiting, graceful error messages |
| High traffic spike | Low | Medium | Vercel Edge scales automatically, Upstash serverless |
| Content gaps | Medium | Medium | Direct to official site, provide phone number |
| Festival changes (cancellation, time change) | Low | High | Admin can update structured data and re-ingest |

---

## 14. Repository Structure

```
30A-Wine-Festival-AI/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Main chat endpoint (agentic RAG)
│   │   ├── admin/
│   │   │   └── analytics/route.ts # Analytics dashboard API
│   │   └── cron/
│   │       └── cleanup/route.ts   # Daily analytics cleanup
│   ├── page.tsx                    # Chat UI
│   ├── layout.tsx                  # Root layout + metadata
│   └── globals.css                 # Tailwind + custom styles
├── components/
│   ├── ChatMessage.tsx             # Message bubble component
│   ├── EventCard.tsx               # Rich event card component
│   ├── SuggestedQuestions.tsx       # Starter/follow-up suggestions
│   ├── SettingsMenu.tsx            # Theme/font settings
│   └── TypingIndicator.tsx         # Loading animation
├── lib/
│   ├── tools/
│   │   ├── search-schedule.ts     # Schedule lookup tool
│   │   ├── search-venues.ts       # Venue search tool
│   │   ├── search-faq.ts          # FAQ search tool
│   │   └── search-general.ts      # General vector search tool
│   ├── vector-store.ts            # Upstash Vector client
│   ├── embeddings.ts              # OpenAI embedding helper
│   ├── system-prompt.ts           # System prompt builder
│   ├── event-data.ts              # Structured event data
│   ├── analytics.ts               # Vercel KV analytics
│   ├── rate-limit.ts              # Upstash rate limiting
│   └── kv-client.ts               # KV Redis client
├── scripts/
│   ├── scrape.ts                  # Playwright scraper for Wix site
│   ├── ingest.ts                  # Vector DB ingestion pipeline
│   ├── verify.ts                  # Data verification queries
│   └── combine-data.ts            # Data merging/transformation
├── data/
│   ├── events.json                # Structured event data
│   ├── venues.json                # Venue information
│   ├── faq.json                   # FAQ content
│   ├── scraped/                   # Raw scraped content
│   └── supplementary/             # Third-party gathered data
├── public/
│   ├── favicon.ico
│   └── og-image.png               # Social share image
├── PRD.md                          # This document
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── vercel.json
├── .env.example
└── .gitignore
```

---

## 15. Open Questions

1. **Custom domain:** Should the chatbot live at `ai.30awinefestival.com` (requires DNS access from Alys Beach) or a web0101.com subdomain?
2. **Participant data:** Can Alys Beach provide the full participant list, or do we need to scrape it via Playwright?
3. **Branding assets:** Does Mr. Spear have access to the 30A Wine Festival logo and brand assets, or should we use text-based branding?
4. **Auction integration:** Should the chatbot link to the auction platform, or just mention it exists?
5. **Post-festival use:** Should the chatbot remain active after Feb 22, or be archived?

---

## 16. Approval

This PRD is ready for Mr. Spear's review and approval. Upon approval, development begins immediately with the goal of launching before or during the first day of the festival (February 18, 2026).

**Key decisions needed:**
- [ ] Approve architecture (Agentic RAG + Upstash Vector + Sonnet 4.6)
- [ ] Approve color palette and design direction
- [ ] Confirm domain/URL for deployment
- [ ] Confirm which content gaps are acceptable vs. must-fix
- [ ] Approve launch timeline

---

*Document generated by Claude Opus 4.6 for Mr. Spear*
*February 17, 2026*
