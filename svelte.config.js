import { fileURLToPath } from "node:url";
import path from "node:path";
import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { escapeSvelte, mdsvex } from "mdsvex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { createHighlighter } from "shiki";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const highlightTheme = "catppuccin-mocha";

const highlighter = await createHighlighter({
  themes: [highlightTheme],
  langs: [
    "javascript",
    "typescript",
    "svelte",
    "html",
    "css",
    "json",
    "markdown",
    "bash",
    "shell",
    "yaml",
    "dockerfile",
  ],
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: [".md"],
  layout: {
    _: path.join(__dirname, "src/routes/notes/_content/mdsvex-layout.svelte"),
  },
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug],
  highlight: {
    highlighter: async (code, lang = "text") => {
      const html = escapeSvelte(
        highlighter.codeToHtml(code, { lang, theme: highlightTheme }),
      );
      const escapedCode = code
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$")
        .replace(/{/g, "\\{");
      return `<Components.CodeBlock lang="${lang}" code={\`${escapedCode}\`}>{@html \`${html}\` }</Components.CodeBlock>`;
    },
  },
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".md"],
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
  kit: {
    adapter: adapter(),
  },
};

export default config;
