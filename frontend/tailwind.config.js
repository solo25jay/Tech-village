/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tech Village brand palette, from the logo colour system.
        navy: '#071A5C',
        indigo: '#4318D1',
        electric: '#087BEB',
        cyan: '#08BFE0',
        teal: '#10CDBA',
        green: '#12C985',
        surface: {
          light: '#F7F9FC',
          dark: '#06132F',
        },
      },
      backgroundImage: {
        'gradient-purple-blue': 'linear-gradient(90deg, #4318D1 0%, #087BEB 100%)',
        'gradient-blue-cyan': 'linear-gradient(90deg, #087BEB 0%, #08BFE0 100%)',
        'gradient-cyan-teal': 'linear-gradient(90deg, #08BFE0 0%, #10CDBA 100%)',
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        card: '0 2px 10px 0 rgb(7 26 92 / 0.06)',
      },
    },
  },
  plugins: [],
};
