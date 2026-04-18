/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c3d0ff',
          300: '#9db0ff',
          400: '#7080ff',
          500: '#4d55f5',
          600: '#3d3de8',
          700: '#3030cc',
          800: '#2828a5',
          900: '#252582',
        },
        surface: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a26',
          600: '#22223a',
          500: '#2e2e4a',
        }
      },
    },
  },
  plugins: [],
}
