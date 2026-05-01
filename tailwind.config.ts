import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#86ef86',
          light: '#b9f9b9',
          dark: '#4caf50',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
