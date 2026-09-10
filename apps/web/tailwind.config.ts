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
        military: {
          900: '#141c14',
          800: '#1f2b1f',
          700: '#2f3e2f',
          600: '#425642',
          500: '#587358',
          400: '#7a967a',
          300: '#a3baa3',
          100: '#e1ebe1',
        },
      },
    },
  },
  plugins: [],
};
export default config;
