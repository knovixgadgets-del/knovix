/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#fce588',
          300: '#fad855',
          400: '#f8cd2e',
          500: '#f6c20d',
          600: '#eab308', // primary gold-yellow (logo, buttons, links, prices)
          700: '#b58a04',
          800: '#8a6a05',
          900: '#5c4703'
        },
        ink: {
          900: '#0d0d0d', // near-black for footer / darkest UI
          800: '#1a1a1a'  // heading text, tuned to sit with the black/yellow palette
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
        card: '0 1px 2px rgba(15,37,48,0.06), 0 1px 8px rgba(15,37,48,0.05)'
      }
    }
  },
  plugins: []
}