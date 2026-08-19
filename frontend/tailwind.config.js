/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff0f5',
          100: '#ffe4ee',
          200: '#ffcce1',
          300: '#ff99c8',
          400: '#ff66af',
          500: '#fc2779', // Nykaa primary
          600: '#e01662',
          700: '#be0e4d',
        },
        darkBg: {
          default: '#fff1f2', // replacing dark mode with light pink variants
          card: '#ffffff',
          border: '#ffe4e6',
        },
        lightBg: {
          default: '#fafafa',
          card: '#ffffff',
          border: '#f4f4f5',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 8px 30px rgba(0, 0, 0, 0.04)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      keyframes: {
        move: {
          '0%, 49.99%': { opacity: '0', zIndex: '1' },
          '50%, 100%': { opacity: '1', zIndex: '5' },
        }
      },
      animation: {
        move: 'move 0.6s ease-in-out',
      }
    },
  },
  plugins: [],
}
