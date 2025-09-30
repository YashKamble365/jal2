/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'dark': {
          'bg': '#111818',
          'panel': '#1a2222',
          'card': '#1f2b2b',
        },
        'teal': {
          'accent': '#2dd4bf',
          'light': '#5eead4',
        },
        'text': {
          'primary': '#ffffff',
          'secondary': '#9ca3af',
          'muted': '#6b7280',
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'cta': '0 4px 20px rgba(45, 212, 191, 0.3)',
      }
    },
  },
  plugins: [],
}
