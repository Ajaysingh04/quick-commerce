/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#0F172A',
          600: '#0b1220',
          700: '#080f1b',
        },
        accent: {
          emerald: '#10B981',
          mint: '#ECFDF5',
          yellow: '#F59E0B',
          rose: '#F43F5E',
        },
        slate: {
          950: '#0F172A',
        },
        darkBg: {
          default: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        },
        lightBg: {
          default: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 20px 60px rgba(15, 23, 42, 0.12)',
        soft: '0 12px 35px rgba(15, 23, 42, 0.08)',
        glass: '0 8px 32px 0 rgba(15, 23, 42, 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.15)' },
          '50%': { boxShadow: '0 0 0 18px rgba(16, 185, 129, 0.02)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
