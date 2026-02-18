'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState, useCallback } from 'react';
import ChatMessage from '@/components/ChatMessage';
import SuggestedQuestions from '@/components/SuggestedQuestions';
import TypingIndicator from '@/components/TypingIndicator';
import SettingsMenu from '@/components/SettingsMenu';

const INITIAL_SUGGESTIONS = [
  { emoji: '\uD83C\uDF77', text: "What's happening today?" },
  { emoji: '\uD83C\uDFAB', text: 'Which events still have tickets?' },
  { emoji: '\uD83D\uDC57', text: 'What should I wear?' },
  { emoji: '\uD83D\uDDFA\uFE0F', text: 'How do I get to Alys Beach?' },
];

const FOLLOW_UP_SUGGESTIONS = [
  { emoji: '\uD83C\uDF7E', text: 'Tell me about the Grand Tasting' },
  { emoji: '\uD83E\uDD5B', text: "What's the Oysters + Champagne event?" },
  { emoji: '\u2764\uFE0F', text: 'Who benefits from the festival?' },
  { emoji: '\uD83C\uDFB6', text: "What's the Bourbon, Beer & Butts event?" },
];

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem('wine-ai-session');
      if (existing) return existing;
      const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('wine-ai-session', id);
      return id;
    }
    return 'session_ssr';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: '/api/chat',
    body: { sessionId },
    onFinish: () => {
      inputRef.current?.focus();
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages.length]);

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('wine-ai-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
    const savedFont = localStorage.getItem('wine-ai-font-size');
    if (savedFont) {
      const map: Record<string, string> = { small: '14px', medium: '16px', large: '18px' };
      document.documentElement.style.setProperty('--font-size-base', map[savedFont] || '16px');
    }
  }, []);

  const handleSuggestionSelect = (question: string) => {
    setInput(question);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form && input.trim()) {
        form.requestSubmit();
      }
    }
  };

  const version = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    ? `1.0.${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.substring(0, 7)}`
    : '1.0.dev';

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header
        className="glass-header sticky top-0 z-30 flex items-center justify-between px-4"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--color-wine-700), var(--color-wine-900))' }}
          >
            <span className="text-white text-lg">{'\uD83C\uDF77'}</span>
          </div>
          <div>
            <h1
              className="leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              30A Wine Festival
            </h1>
            <p
              className="leading-tight"
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              AI Concierge
            </p>
          </div>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-xl hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Open settings"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto py-4">
        <div
          className="space-y-4"
          style={{ maxWidth: 'var(--chat-max-width)', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="mb-5">
                <span className="text-5xl">{'\uD83C\uDF77'}</span>
              </div>
              <h2
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                Welcome to the 30A Wine Festival
              </h2>
              <p
                className="max-w-md mx-auto mb-8"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                I&apos;m your AI concierge for the 14th Annual 30A Wine Festival
                at Alys Beach. Ask me about events, schedules, venues, dress code,
                or anything about the festival.
              </p>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && messages.length === 0 && (
            <SuggestedQuestions
              questions={INITIAL_SUGGESTIONS}
              onSelect={handleSuggestionSelect}
            />
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role as 'user' | 'assistant'}
              content={msg.content}
            />
          ))}

          {/* Follow-up suggestions after first exchange */}
          {messages.length === 2 && !isLoading && (
            <SuggestedQuestions
              questions={FOLLOW_UP_SUGGESTIONS}
              onSelect={handleSuggestionSelect}
            />
          )}

          {/* Loading */}
          {isLoading && <TypingIndicator />}

          {/* Error */}
          {error && (
            <div className="px-4">
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'var(--badge-soldout-bg)',
                  color: 'var(--badge-soldout-text)',
                  border: '1px solid var(--badge-soldout-border)',
                }}
              >
                {error.message.includes('429')
                  ? "You're sending messages too quickly. Please wait a moment and try again."
                  : 'Something went wrong. Please try again or contact events@alysbeach.com for help.'}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area — Glassmorphism bar */}
      <div className="sticky bottom-0 z-20 px-4 pt-3 pb-3 safe-bottom input-bar-glass">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2"
          style={{ maxWidth: 'var(--chat-max-width)', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the festival..."
            rows={1}
            className="chat-input flex-1 px-4 py-2.5 resize-none"
            style={{ maxHeight: '120px', minHeight: '44px' }}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="send-button flex-shrink-0"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        {/* Footer */}
        <div
          className="mt-2 text-center footer-text"
          style={{ maxWidth: 'var(--chat-max-width)', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <span>
            Benefiting{' '}
            <a href="https://www.30awinefestival.com" target="_blank" rel="noopener noreferrer">
              CVHN
            </a>
            {' '}| v{version}
          </span>
        </div>
      </div>

      {/* Settings */}
      <SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
