import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sora)", "system-ui", "sans-serif"],
        sora: ["var(--font-sora)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
