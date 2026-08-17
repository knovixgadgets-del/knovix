/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefaf8',
          100: '#d3f1ec',
          200: '#a6e3d8',
          300: '#6fd0bf',
          400: '#38b6a1',
          500: '#0f8f7e',
          600: '#0c7367',
          700: '#0a5c53',
          800: '#0a4a44',
          900: '#093c38'
        },
        ink: {
          900: '#0b1220',
          800: '#111a2b'
        },
        amber: {
          400: '#f5a623'
        }
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.06), 0 1px 8px rgba(11,18,32,0.04)'
      }
    }
  },
  plugins: []
}
