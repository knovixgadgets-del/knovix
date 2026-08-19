/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1fbfc',
          100: '#d6f3f3',
          200: '#a7e5e7',
          300: '#6fd3d5',
          400: '#34bcbf',
          500: '#0a9599',
          600: '#08797c', // primary brand teal (logo, buttons, links, prices)
          700: '#076264',
          800: '#084f51',
          900: '#074143'
        },
        ink: {
          900: '#182127', // footer / darkest UI (measured from footer bg)
          800: '#272c31'  // heading text (measured from "Smart Gadgets" copy)
        },
        amber: {
          400: '#fab816' // star rating gold
        }
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(24,33,39,0.06), 0 1px 8px rgba(24,33,39,0.04)'
      }
    }
  },
  plugins: []
}