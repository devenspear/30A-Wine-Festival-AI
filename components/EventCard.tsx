'use client';

import { motion } from 'framer-motion';

interface EventCardProps {
  name: string;
  date: string;
  day: string;
  timeStart: string | null;
  timeEnd: string | null;
  venue: string | null;
  price: number | null;
  totalWithFees: number | null;
  status: string;
  dressCode: string | null;
  highlights: string[];
  presenter: string | null;
}

export default function EventCard({
  name,
  day,
  timeStart,
  timeEnd,
  venue,
  price,
  status,
  dressCode,
  highlights,
  presenter,
}: EventCardProps) {
  const isAvailable = status === 'AVAILABLE';

  return (
    <motion.div
      className="event-card my-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Header with gold accent bar */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderBottom: '2px solid var(--color-gold-400)' }}
      >
        <h3
          className="font-semibold"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-on-card)',
          }}
        >
          {name}
        </h3>
        <span className={isAvailable ? 'badge-available' : 'badge-soldout'}>
          {status}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        {/* Date & Time */}
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{day}{timeStart ? ` | ${timeStart}` : ''}{timeEnd ? ` - ${timeEnd}` : ''}</span>
        </div>

        {/* Venue */}
        {venue && (
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{venue}</span>
          </div>
        )}

        {/* Price */}
        {price !== null && (
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>${price} per person</span>
          </div>
        )}

        {/* Presenter */}
        {presenter && (
          <div
            className="text-xs italic pt-1"
            style={{ color: 'var(--color-gold-600)' }}
          >
            {presenter}
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {highlights.map((h, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Dress Code */}
        {dressCode && (
          <div
            className="text-xs pt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Dress code: {dressCode}
          </div>
        )}
      </div>
    </motion.div>
  );
}
