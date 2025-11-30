/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },// tương đương #dc2626
        primary: {
          DEFAULT: '#007BFF',
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#007BFF',
          600: '#0056CC',
          700: '#004199',
          800: '#002C66',
          900: '#001633'
        },
        secondary: {
          DEFAULT: '#F8F9FA',
          50: '#FFFFFF',
          100: '#F8F9FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#212529'
        }
      }
    }
  }
}
