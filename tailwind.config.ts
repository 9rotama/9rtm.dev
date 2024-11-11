import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      bg: {
        primary: "rgb(8 6 9)",
      },
      text: {
        body: "rgb(230 220 230)",
      },
      accent: "rgb(235 102 255)",
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
