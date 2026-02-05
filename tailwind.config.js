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
        surface: {
          50: '#1a1a1a',
          100: '#171717',
          200: '#141414',
          300: '#0f0f0f',
          400: '#0a0a0a',
          500: '#050505',
        },
        border: {
          DEFAULT: '#262626',
          hover: '#404040',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
