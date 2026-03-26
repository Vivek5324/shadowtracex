/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0a0a',
          dark: '#111111',
          green: '#00ff41',
          red: '#ff003c',
          blue: '#00f0ff',
          gray: '#222222',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'blink': 'blink 1s step-end infinite',
        'crt-flicker': 'crtFlicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 2s linear infinite',
        'alarm': 'alarm 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        crtFlicker: {
          '0%': { opacity: '0.95' },
          '100%': { opacity: '1' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        glitch: {
          '2%, 64%': { transform: 'translate(2px, 0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px, 0) skew(0deg)' },
          '62%': { transform: 'translate(0, 0) skew(5deg)' },
        },
        alarm: {
          '0%, 100%': { backgroundColor: 'rgba(255, 0, 60, 0.1)', borderColor: 'rgba(255, 0, 60, 0.5)', boxShadow: 'inset 0 0 20px rgba(255,0,0,0.2)' },
          '50%': { backgroundColor: 'rgba(255, 0, 60, 0.3)', borderColor: 'rgba(255, 0, 60, 1)', boxShadow: 'inset 0 0 40px rgba(255,0,0,0.6)' },
        }
      }
    },
  },
  plugins: [],
}
