/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Brand colours: deep brown "ink", saffron gold and chilli red on a warm cream background
      colors: {
        cream: '#FBF6EE',
        ink: {
          DEFAULT: '#1E1410',
          soft: '#5B4A40',
        },
        saffron: {
          50: '#FFF7E8',
          100: '#FDEBC5',
          200: '#FAD68A',
          400: '#F2B441',
          500: '#E89B19',
          600: '#C97D0A',
          700: '#9E5F0B',
        },
        chili: {
          50: '#FDF1EE',
          100: '#FADBD3',
          500: '#C73E1D',
          600: '#A83216',
          700: '#862713',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 32px -14px rgba(30, 20, 16, 0.28)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
