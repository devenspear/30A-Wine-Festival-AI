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
    <div className="flex flex-col h-dvh" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <header
        className="glass-header sticky top-0 z-30 flex items-center justify-between px-4"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-wine-700), var(--color-wine-900))',
              boxShadow: '0 2px 8px rgba(139, 34, 82, 0.25)',
            }}
          >
            <span className="text-white text-lg">{'\uD83C\uDF77'}</span>
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              30A Wine Festival
            </h1>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              letterSpacing: '0.04em',
              fontWeight: 500,
            }}>
              AI Concierge
            </p>
          </div>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center justify-center"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Open settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto" style={{ paddingTop: '20px', paddingBottom: '12px' }}>
        <div style={{ maxWidth: 'var(--chat-max-width)', marginLeft: 'auto', marginRight: 'auto' }}>
          {/* Welcome */}
          {messages.length === 0 && (
            <div className="px-5 text-center" style={{ paddingTop: '32px', paddingBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '48px' }}>{'\uD83C\uDF77'}</span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                lineHeight: 1.2,
              }}>
                Welcome to the<br />30A Wine Festival
              </h2>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '340px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Your AI concierge for the 14th Annual 30A Wine Festival at Alys Beach.
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

          {/* Messages */}
          <div className="space-y-3">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role as 'user' | 'assistant'}
                content={msg.content}
              />
            ))}
          </div>

          {/* Follow-up */}
          {messages.length === 2 && !isLoading && (
            <div style={{ marginTop: '16px' }}>
              <SuggestedQuestions
                questions={FOLLOW_UP_SUGGESTIONS}
                onSelect={handleSuggestionSelect}
              />
            </div>
          )}

          {/* Typing */}
          {isLoading && (
            <div style={{ marginTop: '12px' }}>
              <TypingIndicator />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4" style={{ marginTop: '12px' }}>
              <div style={{
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                fontSize: 'var(--font-size-sm)',
                background: 'var(--badge-soldout-bg)',
                color: 'var(--badge-soldout-text)',
                border: '1px solid var(--badge-soldout-border)',
              }}>
                {error.message.includes('429')
                  ? "You're sending messages too quickly. Please wait a moment."
                  : error.message.includes('503') || error.message.includes('unavailable')
                  ? 'The AI concierge is temporarily unavailable. Please try again in a few minutes.'
                  : 'Something went wrong. Please try again or contact events@alysbeach.com.'}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 z-20 safe-bottom input-bar" style={{ padding: '10px 16px 12px' }}>
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2.5"
          style={{ maxWidth: 'var(--chat-max-width)', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the festival..."
            rows={1}
            className="chat-input flex-1 resize-none"
            style={{ maxHeight: '120px', minHeight: '44px', padding: '10px 18px' }}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="send-button flex-shrink-0"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        <div
          className="text-center footer-text"
          style={{
            maxWidth: 'var(--chat-max-width)',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '8px',
          }}
        >
          Benefiting{' '}
          <a href="https://www.30awinefestival.com" target="_blank" rel="noopener noreferrer">
            CVHN
          </a>
          {' '}| v{version}
        </div>
      </div>

      <SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
