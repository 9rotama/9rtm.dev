import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { threlteStudio } from "@threlte/studio/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [threlteStudio(), tailwindcss(), sveltekit()],
});
