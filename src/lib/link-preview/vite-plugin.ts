import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import type { Plugin } from "vite";
import { prefetchLinkPreviews, resolveHttpUrl } from "./ogp.ts";
import {
  DEFAULT_LINK_PREVIEW_BASE_URL,
  DEFAULT_LINK_PREVIEW_STATIC_DIR,
} from "./constants.ts";
import type { LinkPreviewOptions } from "./types.ts";

type MarkdownNode = {
  type?: string;
  url?: string;
  children?: MarkdownNode[];
};

export type LinkPreviewBuildPluginOptions = LinkPreviewOptions & {
  contentDir?: string;
};

function collectMarkdownLinks(node: MarkdownNode, links: string[]): void {
  if (node.type === "link" && typeof node.url === "string") {
    links.push(node.url);
  }
  for (const child of node.children ?? []) collectMarkdownLinks(child, links);
}

export function extractMarkdownLinks(markdown: string): string[] {
  try {
    const tree = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .parse(markdown) as MarkdownNode;
    const links: string[] = [];
    collectMarkdownLinks(tree, links);
    return links;
  } catch {
    return [];
  }
}

async function readMarkdownLinks(
  contentDir: string,
  baseUrl: string,
): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(contentDir, {
      recursive: true,
      withFileTypes: true,
    });
  } catch {
    return [];
  }

  const links = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && /\.(?:md|svx)$/.test(entry.name))
      .map(async (entry) => {
        try {
          const markdown = await readFile(
            path.join(entry.parentPath, entry.name),
            "utf8",
          );
          return extractMarkdownLinks(markdown).filter((href) =>
            resolveHttpUrl(href, baseUrl),
          );
        } catch {
          return [];
        }
      }),
  );
  return [...new Set(links.flat())];
}

/**
 * Prefetch every note link before Svelte starts compiling modules and emit the
 * generated WebP files as Vite assets. The plugin is build-only; development
 * requests are initiated by the async mdsvex transform for changed notes.
 */
export function linkPreviewBuildPlugin(
  options: LinkPreviewBuildPluginOptions = {},
): Plugin {
  const configuredBaseUrl = options.baseUrl ?? DEFAULT_LINK_PREVIEW_BASE_URL;
  const baseUrl =
    resolveHttpUrl(configuredBaseUrl)?.href ?? DEFAULT_LINK_PREVIEW_BASE_URL;
  const staticDir = options.staticDir ?? DEFAULT_LINK_PREVIEW_STATIC_DIR;
  let previews = new Map<string, { image?: string }>();

  return {
    name: "link-preview-build",
    apply: "build",
    async buildStart() {
      const contentDir = path.resolve(options.contentDir ?? "contents/notes");
      const hrefs = await readMarkdownLinks(contentDir, baseUrl);
      const result = await prefetchLinkPreviews(hrefs, {
        ...options,
        baseUrl,
        staticDir,
      });
      previews = new Map(
        [...result.entries()].map(([href, preview]) => [
          href,
          { image: preview.image },
        ]),
      );
    },
    async generateBundle(_outputOptions, bundle) {
      for (const preview of previews.values()) {
        if (!preview.image) continue;
        const publicPath = preview.image.replace(/^\/+/, "");
        if (
          Object.values(bundle).some((asset) => asset.fileName === publicPath)
        ) {
          continue;
        }
        const filePath = path.join(staticDir, path.basename(publicPath));
        try {
          const source = await readFile(filePath);
          this.emitFile({ type: "asset", fileName: publicPath, source });
        } catch {
          // The card remains useful without an image if the cache filesystem is unavailable.
        }
      }
    },
  };
}

export default linkPreviewBuildPlugin;
