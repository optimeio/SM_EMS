/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#DC2C2B',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2C2B',
          600: '#C52221',
          700: '#A91B1A',
          800: '#8A1514',
          900: '#690F0E',
          glow: 'rgba(220, 44, 43, 0.2)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 10px -1px rgba(15, 23, 42, 0.02)',
        'premium-hover': '0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
        'brand': '0 4px 14px 0 rgba(220, 44, 43, 0.3)',
      }
    },
  },
  plugins: [],
}
