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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffd',
          300: '#7cc2fc',
          400: '#389ffa',
          500: '#0e7ff4',
          600: '#0261d7',
          700: '#034da9',
          800: '#07428b',
          900: '#0c3872',
          950: '#08234a',
        },
      },
    },
  },
  plugins: [],
}
