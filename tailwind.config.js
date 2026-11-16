/** @type {import('tailwindcss').Config} */
// Anthropic / Claude theme. We remap Tailwind's cool grays (slate) to warm
// greys and the accent (blue + violet) to Claude clay, so existing utility
// classes adopt the brand without touching every component.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#141413',
        // Warm greys (brand: dark #141413, mid #b0aea5, light-grey #e8e6dc, light #faf9f5)
        slate: {
          50: '#faf9f5', 100: '#f1efe7', 200: '#e8e6dc', 300: '#d7d4c8', 400: '#b0aea5',
          500: '#78766d', 600: '#585650', 700: '#403e39', 800: '#2a2925', 900: '#141413',
        },
        // Claude clay — the single accent (replaces blue + violet)
        blue: {
          50: '#faf1ec', 100: '#f6dfd4', 200: '#eec3b0', 300: '#e4a184', 400: '#dd8a68',
          500: '#d97757', 600: '#a84e33', 700: '#883f27', 800: '#6b3220', 900: '#4f261a',
        },
        violet: {
          50: '#faf1ec', 100: '#f6dfd4', 200: '#eec3b0', 300: '#e4a184', 400: '#dd8a68',
          500: '#d97757', 600: '#a84e33', 700: '#883f27', 800: '#6b3220', 900: '#4f261a',
        },
        // Warm brand green for success / low priority
        emerald: {
          50: '#f0f2e9', 100: '#dfe4cf', 200: '#c3cda6', 300: '#a3b27e', 400: '#889a60',
          500: '#6f8249', 600: '#5f7040', 700: '#4c5a34', 800: '#3b451f', 900: '#2b331a',
        },
      },
      keyframes: {
        toast: { from: { opacity: '0', transform: 'translate(-50%, 8px)' }, to: { opacity: '1', transform: 'translate(-50%, 0)' } },
      },
    },
  },
  plugins: [],
};
