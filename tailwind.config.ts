import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B4CF5',
        'primary-light': '#7B6CF7',
        accent: '#A8E63D',
        'accent-dark': '#8BC42D',
        'surface-bg': '#0F0E17',
        'surface-card': '#1A1828',
        'surface-elevated': '#242235',
        'surface-border': 'rgba(255,255,255,0.06)',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9B99B5',
        'text-muted': '#5C5A72',
        success: '#2DD4BF',
        danger: '#FF4C4C',
        warning: '#FFAB00',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '12px',
        input: '10px',
        pill: '100px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(91,76,245,0.4)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
