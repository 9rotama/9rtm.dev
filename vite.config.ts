import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { linkPreviewBuildPlugin } from "./src/lib/link-preview/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      enhancedImages(),
      tailwindcss(),
      linkPreviewBuildPlugin({ baseUrl: env.PUBLIC_BASE_URL }),
      sveltekit(),
    ],
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
      fs: {
        allow: ["contents"],
      },
    },
  };
});
