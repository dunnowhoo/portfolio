import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

// Disalin 1:1 dari konfigurasi Tailwind CDN di index.html lama (Tailwind v3)
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc', // Apple Blue
        'background-light': '#ffffff',
        'background-dark': '#f5f5f7', // Apple Gray
        'text-main': '#1d1d1f', // Apple Text Black
        'text-secondary': '#86868b',
        'glass-border': 'rgba(255, 255, 255, 0.6)',
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        jp: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '0.5rem', lg: '0.75rem', xl: '1.25rem', '2xl': '1.75rem', full: '9999px' },
      boxShadow: {
        soft: '0 4px 24px rgba(0, 0, 0, 0.04)',
        hover: '0 12px 32px rgba(0, 0, 0, 0.08)',
        liquid: '0 20px 40px rgba(0, 0, 0, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [forms, containerQueries],
};

export default config;
