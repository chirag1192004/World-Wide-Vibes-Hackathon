/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'civic-bg': '#0a0a0f',
        'civic-panel': '#13131a',
        'civic-red': '#ff3b30',
        'civic-yellow': '#ffd60a',
        'civic-green': '#30d158',
        'civic-text-primary': '#f5f5f7',
        'civic-text-secondary': '#8e8e93',
        'civic-border': '#2c2c3a',
      },
      boxShadow: {
        'glow-red': '0 0 15px rgba(255,59,48,0.3)',
        'glow-yellow': '0 0 15px rgba(255,214,10,0.3)',
        'glow-green': '0 0 15px rgba(48,209,88,0.3)',
      }
    },
  },
  plugins: [],
}
