import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        parchment: "var(--color-parchment)",
        vermilion: "var(--color-vermilion)",
        gold: "var(--color-gold)",
      },
      fontFamily: { sans: ["var(--font-ui)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
