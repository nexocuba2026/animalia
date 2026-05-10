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
        naranja: {
          500: '#ff9800',
          600: '#fb8c00',
        },
      },
    },
  },
  plugins: [],
}