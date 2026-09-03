/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 10px -1px rgba(15, 23, 42, 0.02)',
        'premium-hover': '0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
