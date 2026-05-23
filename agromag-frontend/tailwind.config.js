/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'haverts': {
          'base': 'rgb(var(--color-base) / <alpha-value>)',
          'primary': 'rgb(var(--color-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
          'accent': 'rgb(var(--color-accent) / <alpha-value>)',
          'contrast': 'rgb(var(--color-contrast) / <alpha-value>)',
        },
        'agro': {
          'forest': 'rgb(var(--color-primary) / <alpha-value>)',
          'emerald': 'rgb(var(--color-secondary) / <alpha-value>)',
          'light': 'rgb(var(--color-base) / <alpha-value>)',
          'soft': 'rgb(var(--color-secondary) / <alpha-value>)',
          'dark': 'rgb(var(--color-primary) / <alpha-value>)',
        }
      },
      // ... (Deja el resto de tu config igual: fontFamily, borderRadius, etc.)
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-strong': '0 0 30px rgba(16, 185, 129, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-left))',
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  plugins: [],
}