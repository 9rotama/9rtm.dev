import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { threlteStudio } from "@threlte/studio/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [threlteStudio(), tailwindcss(), sveltekit()],
  define: {
    __BUILD_TIME__: JSON.stringify(
      new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    ),
  },
});
