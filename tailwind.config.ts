import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          950: "#0a2e20",
          900: "#0f3d26",
          700: "#15803d",
          600: "#1a9c4a",
          50: "#f0f9f2",
        },
        gold: {
          500: "#f2b705",
          600: "#d99e00",
        },
        ink: {
          DEFAULT: "#12201a",
          soft: "#4b5d55",
        },
        line: "#e4ece6",
        cream: "#faf8f2",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
