import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
          dim: '#E2E8F0',
        },
        border: {
          base: '#E5E9F0',
          hover: '#CBD5E1',
          subtle: '#F1F5F9',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        // Exact Noble Emerald Palette from Reference Mockup
        primary: {
          DEFAULT: '#047857',
          deep: '#005d42',
          emerald: '#059669',
          container: '#047857',
          'on-container': '#FFFFFF',
          mint: '#10B981',
          light: '#ECFDF5',
          'border-light': '#A7F3D0',
        },
        // Pipeline Stage Semantic Colors
        stage: {
          1: {
            DEFAULT: '#7C3AED',
            chip: '#F5F3FF',
            text: '#6D28D9',
          },
          2: {
            DEFAULT: '#059669',
            chip: '#ECFDF5',
            text: '#047857',
          },
          3: {
            DEFAULT: '#D97706',
            chip: '#FFFBEB',
            text: '#B45309',
          },
          4: {
            DEFAULT: '#4F46E5',
            chip: '#EEF2FF',
            text: '#4338CA',
          },
          5: {
            DEFAULT: '#047857',
            chip: '#D1FAE5',
            text: '#065F46',
          },
          urgent: {
            DEFAULT: '#E11D48',
            chip: '#FFF1F2',
            text: '#BE123C',
          },
        },
        error: {
          DEFAULT: '#E11D48',
          container: '#FFF1F2',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-outfit)', 'var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['2.75rem', { lineHeight: '3.15rem', letterSpacing: '-0.035em', fontWeight: '800' }],
        'headline-lg': ['2rem', { lineHeight: '2.45rem', letterSpacing: '-0.03em', fontWeight: '700' }],
        'headline-md': ['1.375rem', { lineHeight: '1.85rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.55rem', letterSpacing: '-0.015em', fontWeight: '700' }],
        'title-md': ['1rem', { lineHeight: '1.45rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['0.9375rem', { lineHeight: '1.55rem', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.45rem', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.005em', fontWeight: '600' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-sm': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.04em', fontWeight: '700' }],
      },
      boxShadow: {
        card: '0 2px 10px -2px rgba(15, 23, 42, 0.04), 0 1px 3px -1px rgba(15, 23, 42, 0.02)',
        hover: '0 14px 30px -6px rgba(4, 120, 87, 0.08), 0 6px 14px -4px rgba(15, 23, 42, 0.05)',
        modal: '0 24px 48px -12px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
        primary: '0 4px 14px -2px rgba(4, 120, 87, 0.35), 0 1px 2px 0 rgba(4, 120, 87, 0.2)',
        mobile: '0 8px 24px -4px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
