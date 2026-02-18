import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wine: {
          50: 'var(--color-wine-50)',
          100: 'var(--color-wine-100)',
          200: 'var(--color-wine-200)',
          300: 'var(--color-wine-300)',
          400: 'var(--color-wine-400)',
          500: 'var(--color-wine-500)',
          600: 'var(--color-wine-600)',
          700: 'var(--color-wine-700)',
          800: 'var(--color-wine-800)',
          900: 'var(--color-wine-900)',
        },
        gold: {
          50: 'var(--color-gold-50)',
          100: 'var(--color-gold-100)',
          200: 'var(--color-gold-200)',
          300: 'var(--color-gold-300)',
          400: 'var(--color-gold-400)',
          500: 'var(--color-gold-500)',
          600: 'var(--color-gold-600)',
          700: 'var(--color-gold-700)',
          800: 'var(--color-gold-800)',
          900: 'var(--color-gold-900)',
        },
        navy: {
          50: 'var(--color-navy-50)',
          100: 'var(--color-navy-100)',
          200: 'var(--color-navy-200)',
          500: 'var(--color-navy-500)',
          800: 'var(--color-navy-800)',
          900: 'var(--color-navy-900)',
          950: 'var(--color-navy-950)',
        },
        sand: {
          50: 'var(--color-sand-50)',
          100: 'var(--color-sand-100)',
          200: 'var(--color-sand-200)',
          300: 'var(--color-sand-300)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
