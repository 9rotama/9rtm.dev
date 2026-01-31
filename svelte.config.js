import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { escapeSvelte, mdsvex } from "mdsvex";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
      // "javascript:example.js" → ["javascript", "example.js"]
      const colonIndex = lang.indexOf(":");
      const hasFilename = colonIndex !== -1;
      const actualLang = hasFilename ? lang.slice(0, colonIndex) : lang;
      const filename = hasFilename ? lang.slice(colonIndex + 1) : undefined;

      const html = escapeSvelte(
        highlighter.codeToHtml(code, {
          lang: actualLang,
          theme: highlightTheme,
          structure: "inline",
        }),
      );
      const escapedCode = code
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$")
        .replace(/{/g, "\\{");
      const filenameAttr = filename ? ` filename="${filename}"` : "";
      return `<Components.CodeBlock lang="${actualLang}"${filenameAttr} code={\`${escapedCode}\`}>{@html \`${html}\` }</Components.CodeBlock>`;
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
