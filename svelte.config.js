import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { escapeSvelte, mdsvex } from "mdsvex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { createHighlighter } from "shiki";

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
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "append",
        properties: {
          className: ["heading-link"],
          ariaLabel: "link to section",
          title: "link to section",
        },
        content: {
          type: "text",
          value: "🔗",
        },
      },
    ],
  ],
  highlight: {
    highlighter: async (code, lang = "text") => {
      const html = escapeSvelte(
        highlighter.codeToHtml(code, { lang, theme: highlightTheme }),
      );
      return `{@html \`${html}\` }`;
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
