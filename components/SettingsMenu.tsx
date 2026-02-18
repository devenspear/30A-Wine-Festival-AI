'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

const fontSizeMap: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    const savedTheme = localStorage.getItem('wine-ai-theme') as Theme | null;
    const savedFontSize = localStorage.getItem('wine-ai-font-size') as FontSize | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedFontSize) setFontSize(savedFontSize);
  }, []);

  useEffect(() => {
    localStorage.setItem('wine-ai-theme', theme);
    const root = document.documentElement;

    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('wine-ai-font-size', fontSize);
    document.documentElement.style.setProperty('--font-size-base', fontSizeMap[fontSize]);
  }, [fontSize]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-72 z-50 p-6 flex flex-col gap-6"
            style={{
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-lg)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Settings
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Close settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Theme */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Theme
              </label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all"
                    style={{
                      background: theme === t ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: theme === t ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${theme === t ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Font Size
              </label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as FontSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all"
                    style={{
                      background: fontSize === s ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: fontSize === s ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${fontSize === s ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                All proceeds benefit the Children&apos;s Volunteer Health Network (CVHN).
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
