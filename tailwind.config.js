/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          black: '#1a1a1a',
          white: '#ffffff',
          purple: '#722ed1',
          gold: '#faad14',
        },
        rarity: {
          common: '#6b7280',
          rare: '#3b82f6',
          epic: '#8b5cf6',
          legendary: '#f59e0b',
        },
      },
      animation: {
        'skill-glow': 'skill-glow 2s ease-in-out infinite',
        'stone-place': 'stone-place 0.3s ease-out',
      },
      keyframes: {
        'skill-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147,51,234,0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(147,51,234,0.8)' },
        },
        'stone-place': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
