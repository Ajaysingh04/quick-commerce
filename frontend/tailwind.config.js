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
          50: '#eefcf4',
          100: '#d7f7e3',
          200: '#b2edca',
          300: '#7ddfae',
          400: '#46c78e',
          500: '#046A47', // Grocery Primary Green
          600: '#035538',
          700: '#02402a',
        },
        accent: {
          yellow: '#F5B300',
          mint: '#E6F4EA',
        },
        darkBg: {
          default: '#f8f9fa', // clean light gray
          card: '#ffffff',
          border: '#e5e7eb',
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
