import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#EAB308', // Primary Golden Yellow
          600: '#CA8A04', // Deep Golden Yellow
          700: '#A16207',
          800: '#854D0E', // Deep Amber
          900: '#713F12',
        },
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // Primary Navy Contrast
          950: '#020617',
        },
        accent: {
          gold: '#F59E0B',
          amber: '#D97706',
          emerald: '#10B981',
          sky: '#0284C7',
          purple: '#9333EA',
          rose: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-sora)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(234, 179, 8, 0.12)',
        'glass-hover': '0 16px 48px 0 rgba(234, 179, 8, 0.25)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 20px 35px -10px rgba(202, 138, 4, 0.25), 0 10px 20px -5px rgba(15, 23, 42, 0.05)',
        'button-glow': '0 8px 24px -4px rgba(234, 179, 8, 0.6)',
        'button-glow-hover': '0 12px 32px -4px rgba(234, 179, 8, 0.8)',
        'gold-glow': '0 0 40px rgba(234, 179, 8, 0.45)',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 30s linear infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(35px, -40px) scale(1.12)' },
          '66%': { transform: 'translate(-25px, 25px) scale(0.92)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(234, 179, 8, 0.8))' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
