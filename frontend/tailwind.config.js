/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c', // Deep dark
        surface: '#141416', // Slightly lighter for cards
        surfaceHover: '#1c1c1f',
        border: '#2a2a2e',
        primary: {
          DEFAULT: '#3b82f6', // Blue
          glow: 'rgba(59, 130, 246, 0.5)',
        },
        accent: {
          DEFAULT: '#8b5cf6', // Violet
          glow: 'rgba(139, 92, 246, 0.5)',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
