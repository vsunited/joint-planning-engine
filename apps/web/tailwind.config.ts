import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Tactical Joint Purple & Military Palettes
        joint: {
          950: '#1e0d2b',
          900: '#2c1240',
          800: '#431c61',
          700: '#5e2787',
          600: '#7b34b0',
          500: '#9b47db',
          400: '#ba6cf2',
          300: '#d79fff',
          100: '#f4e6ff',
        },
        military: {
          950: '#090d13',
          900: '#0e141e',
          850: '#131b28',
          800: '#1b2434',
          700: '#2b384e',
          600: '#3e4f6d',
          500: '#576c91',
        },
      },
    },
  },
  plugins: [],
};
export default config;
