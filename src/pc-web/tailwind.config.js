/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1978e5',
        'background-light': '#f6f7f8',
        'background-dark': '#111821',
        ink: '#132238',
        mist: '#eef3fb',
        brand: '#0f766e',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 45px rgba(19, 34, 56, 0.12)',
        'primary/5': '0 20px 45px rgba(25, 120, 229, 0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
