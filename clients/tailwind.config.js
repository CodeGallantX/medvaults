/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0076D6',
          600: '#0066c0',
          700: '#0056a3',
        },
        health: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#1CBF73',
          600: '#16a34a',
          700: '#15803d',
        },
        alert: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#E63946',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#F59E0B',
          600: '#d97706',
          700: '#b45309',
        },
        background: {
          light: '#F9FAFB',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        'figtree': ['Figtree', 'sans-serif'],
        'figtree-semibold': ['Figtree-SemiBold', 'sans-serif'],
        'figtree-medium': ['Figtree-Medium', 'sans-serif'],
      },
      borderRadius: {
        'default': '12px',
        'card': '16px',
        'button': '8px',
      },
    },
  },
  plugins: [],
}