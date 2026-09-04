import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Trust Ledger Design Tokens
        brand: {
          primary: '#2C2B73',
          'primary-hover': '#3A38A0',
          secondary: '#5B5E8C',
          lime: '#C4FF4D',
          'lime-active': '#AEE83A',
        },
        bg: {
          base: '#0A0B1C',
          surface: '#14152E',
          raised: '#1D1F3D',
        },
        text: {
          main: '#EEF0FA',
          muted: '#A7ABC9',
        },
        status: {
          trust: '#2FBF8F',
          success: '#2FBF8F',
          warning: '#F5A623',
          error: '#E5484D',
        },
        // Semantic mappings
        background: '#0A0B1C',
        surface: '#14152E',
        'surface-raised': '#1D1F3D',
        primary: {
          DEFAULT: '#2C2B73',
          hover: '#3A38A0',
        },
        secondary: '#5B5E8C',
        accent: {
          DEFAULT: '#C4FF4D',
          active: '#AEE83A',
        },
        muted: '#A7ABC9',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        full: '999px',
      },
    },
  },
  plugins: [],
} satisfies Config;

