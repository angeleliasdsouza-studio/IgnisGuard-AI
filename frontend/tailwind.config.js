/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy':    { 900: '#0d1117', 800: '#161b22', 700: '#21262d', 600: '#30363d' },
        'sidebar': '#111827',
        'card':    '#1f2937',
        'border':  '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
