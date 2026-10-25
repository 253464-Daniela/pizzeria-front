/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E53E3E',
          'red-dark': '#9B1C1C',
          'red-deep': '#7F1D1D',
          yellow: '#ECC94B',
          gold: '#D97706',
          cream: '#FFFDF9',
          warm: '#FDFBF7',
          stone: '#2D3748',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
