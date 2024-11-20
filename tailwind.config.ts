import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "rgb(8 6 9)",
          card: "rgb(201 85 255)",
        },
        text: {
          body: "rgb(230 220 230)",
        },
        accent: "rgb(235 102 255)",
        border: {
          snsLink: "rgb(201 150 255 / 12%)",
        },
        light: "rgb(255 220 255)",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        slideUp: "slideUp 400ms ease 200ms both",
      },
    },
  },
  plugins: [],
} satisfies Config;
