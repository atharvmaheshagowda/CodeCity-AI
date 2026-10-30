/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#070b16',
        void: '#030712',
        surface: {
          DEFAULT: '#0c1322',
          glass: 'rgba(12, 19, 34, 0.76)',
          raised: '#111a2e',
          overlay: '#18233c',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-focus': 'rgba(6, 182, 212, 0.45)',
        },
        accent: {
          cyan: '#06b6d4',
          sky: '#38bdf8',
          blue: '#3b82f6',
          teal: '#14b8a6',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          crimson: '#ff1e42',
          violet: '#8b5cf6',
          purple: '#c084fc',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f43f5e',
          critical: '#ff1e42',
        },
        hop: {
          1: '#38bdf8',
          2: '#c084fc',
          3: '#fb7185',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 24px -2px rgba(6, 182, 212, 0.4)',
        'glow-rose': '0 0 24px -2px rgba(244, 63, 94, 0.4)',
        'glow-emerald': '0 0 24px -2px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 24px -2px rgba(245, 158, 11, 0.35)',
        'glow-violet': '0 0 24px -2px rgba(192, 132, 252, 0.4)',
        'glass-panel': '0 16px 36px -4px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        'glass-card': '0 8px 24px -4px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
        md: '16px',
        lg: '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideLeft 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shockwave': 'shockwave 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shockwave: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
