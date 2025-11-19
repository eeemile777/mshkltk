/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Rubik"', 'sans-serif'],
        arabic: ['"Cairo"', 'sans-serif'],
        display: ['"Inter"', '"Rubik"', 'sans-serif'],
      },
      colors: {
        // Light Palette
        'teal': '#00BFA6',
        'mango': '#FFA62B',
        'navy': '#0D3B66',
        'sand': '#F4EDEA',
        'sky': '#4BA3C3',
        'coral': '#FF5A5F',
        'text-primary': '#102027',
        'text-secondary': '#4B5B67',
        'card': '#FFFFFF',
        'muted': '#F8F6F4',
        'border-light': '#E6E0DC',
        // Dark Palette
        'bg-dark': '#121212',
        'surface-dark': '#1E2A38',
        'teal-dark': '#00D2B5',
        'mango-dark': '#FFB84D',
        'cyan-dark': '#5BC0EB',
        'coral-dark': '#FF767B',
        'text-primary-dark': '#E7EDF3',
        'text-secondary-dark': '#B0B8C1',
        'border-dark': '#273445',
      },
      borderRadius: {
        'xl': '1rem', // 16px
        '2xl': '1.5rem',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #FFA62B, 0 0 10px #FFA62B, 0 0 15px #FFA62B' },
          '50%': { boxShadow: '0 0 10px #FFA62B, 0 0 20px #FFA62B, 0 0 30px #FFA62B' },
        },
        'elegant-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'subtle-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 191, 166, 0.4), 0 0 16px rgba(0, 191, 166, 0.2)' },
          '50%': { boxShadow: '0 0 16px rgba(0, 191, 166, 0.6), 0 0 24px rgba(0, 191, 166, 0.4)' },
        },
        'badge-appear': {
          '0%': { transform: 'scale(0.5) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in-scale': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        'elegant-spin': 'elegant-spin 1s linear infinite',
        'subtle-glow': 'subtle-glow 2.5s ease-in-out infinite',
        'badge-appear': 'badge-appear 0.5s ease-out forwards',
        shimmer: 'shimmer 2s infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in-scale': 'fade-in-scale 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
