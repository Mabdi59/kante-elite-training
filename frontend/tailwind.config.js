/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#1a1a1a',
          border: '#222222',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'amber': '0 4px 24px rgba(245, 158, 11, 0.25)',
        'amber-lg': '0 8px 40px rgba(245, 158, 11, 0.35)',
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(ellipse at center, #1a0a00 0%, transparent 65%)',
        'radial-hero': 'radial-gradient(ellipse at top left, #1a0a00 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}
