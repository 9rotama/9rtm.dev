import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  define: {
    __BUILD_TIME__: JSON.stringify(
      new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    ),
  },
  server: {
    allowedHosts: true,
  },
});
