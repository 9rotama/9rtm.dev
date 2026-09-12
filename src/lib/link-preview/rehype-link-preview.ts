import {
  DEFAULT_LINK_PREVIEW_BASE_URL,
  getLinkPreview,
  resolveHttpUrl,
  validateHttpUrl,
  type LinkPreviewData,
  type LinkPreviewOptions,
} from "./ogp.ts";
import type { Plugin } from "unified";
import type { Node } from "unist";

type TextNode = { type: "text"; value: string };
type ElementNode = {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
};
type RootNode = { type: "root"; children: HastNode[] };
type HastNode =
  | TextNode
  | ElementNode
  | { type: "comment" | "doctype" | "raw"; [key: string]: unknown };
type ParentNode = RootNode | ElementNode;

export type RehypeLinkPreviewOptions = LinkPreviewOptions;

function getSafeBaseUrl(value?: string): string {
  const validation = validateHttpUrl(value ?? DEFAULT_LINK_PREVIEW_BASE_URL);
  return validation.valid ? validation.url.href : DEFAULT_LINK_PREVIEW_BASE_URL;
}

function isElement(node: HastNode): node is ElementNode {
  return node.type === "element";
}

function textContent(node: HastNode): string {
  if (node.type === "text") return node.value;
  if (!isElement(node)) return "";
  return node.children.map(textContent).join("");
}

function normaliseText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeSvelteAttribute(value: string): string {
  // mdsvex's attribute serializer does not escape custom component values.
  // Encode the HTML and Svelte-sensitive characters before it emits markup.
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/{/g, "&#123;")
    .replace(/}/g, "&#125;");
}

function restoreMdsvexHref(value: string): string {
  return value.replace(/%7B/gi, "{").replace(/%7D/gi, "}");
}

function isStandaloneParagraph(parent: ParentNode, node: ElementNode): boolean {
  if (parent.type !== "root" || node.tagName !== "p") return false;
  const children = node.children;
  const meaningfulChildren = children.filter((child) => {
    return child.type !== "text" || normaliseText(child.value) !== "";
  });
  return (
    meaningfulChildren.length === 1 &&
    isElement(meaningfulChildren[0]) &&
    meaningfulChildren[0].tagName === "a"
  );
}

function isBareLink(
  label: string,
  href: string,
  resolvedHref: URL,
  baseUrl: string,
): boolean {
  const normalisedLabel = normaliseText(label);
  if (!normalisedLabel) return true;
  if (normalisedLabel === href.trim()) return true;
  const resolvedLabel = resolveHttpUrl(normalisedLabel, baseUrl);
  return resolvedLabel?.href === resolvedHref.href;
}

function createPreviewNode(
  variant: "inline" | "card",
  href: string,
  preview: LinkPreviewData,
  external: boolean,
  label?: string,
): ElementNode {
  const properties: Record<string, unknown> = {
    variant,
    href: escapeSvelteAttribute(href),
    title: escapeSvelteAttribute(preview.title),
    siteName: escapeSvelteAttribute(preview.siteName),
  };
  if (preview.description)
    properties.description = escapeSvelteAttribute(preview.description);
  if (preview.image) properties.image = escapeSvelteAttribute(preview.image);
  if (preview.icon) properties.icon = escapeSvelteAttribute(preview.icon);
  if (label) properties.label = escapeSvelteAttribute(label);
  if (external) properties.external = true;
  return { type: "element", tagName: "LinkPreview", properties, children: [] };
}

type LinkRecord = {
  node: ElementNode;
  parent: ParentNode;
  standaloneParagraph: ElementNode | null;
  href: string;
  resolvedHref: URL;
  label: string;
};

function collectLinks(
  node: ParentNode,
  links: LinkRecord[],
  baseUrl: string,
  parentParent?: ParentNode,
): void {
  for (const child of node.children) {
    if (isElement(child) && child.tagName === "a") {
      const encodedHref = child.properties?.href;
      if (typeof encodedHref === "string") {
        const href = restoreMdsvexHref(encodedHref);
        const resolvedHref = resolveHttpUrl(href, baseUrl);
        if (resolvedHref) {
          const standaloneParagraph =
            node.type === "element" &&
            node.tagName === "p" &&
            parentParent?.type === "root" &&
            isStandaloneParagraph(parentParent, node)
              ? node
              : null;
          links.push({
            node: child,
            parent: standaloneParagraph && parentParent ? parentParent : node,
            standaloneParagraph,
            href,
            resolvedHref,
            label: normaliseText(textContent(child)),
          });
        }
      }
    }

    if (isElement(child)) {
      collectLinks(child, links, baseUrl, node);
    }
  }
}

function replaceChild(
  parent: ParentNode,
  oldNode: HastNode,
  newNode: HastNode,
): void {
  const index = parent.children.indexOf(oldNode);
  if (index !== -1) parent.children[index] = newNode;
}

/**
 * Resolve Markdown HTTP links during mdsvex's async rehype phase. The custom
 * component name is mapped to Components.LinkPreview by mdsvex's layout pass.
 */
export async function transformLinkPreviewTree(
  tree: RootNode,
  options: RehypeLinkPreviewOptions = {},
): Promise<RootNode> {
  const baseUrl = getSafeBaseUrl(options.baseUrl);
  const previewOptions = { ...options, baseUrl };
  const baseOrigin = new URL(baseUrl).origin;

  const links: LinkRecord[] = [];
  collectLinks(tree, links, baseUrl);
  if (links.length === 0) return tree;

  const previews = await Promise.all(
    links.map(async (link) => {
      const bare = isBareLink(
        link.label,
        link.href,
        link.resolvedHref,
        baseUrl,
      );
      const preview = await getLinkPreview(
        link.href,
        previewOptions,
        bare ? undefined : link.label,
      );
      return { link, preview, bare };
    }),
  );

  for (const { link, preview, bare } of previews) {
    const external = link.resolvedHref.origin !== baseOrigin;
    if (link.standaloneParagraph) {
      replaceChild(
        link.parent,
        link.standaloneParagraph,
        createPreviewNode("card", link.href, preview, external, link.label),
      );
    } else {
      replaceChild(
        link.parent,
        link.node,
        createPreviewNode(
          "inline",
          link.href,
          preview,
          external,
          bare ? undefined : link.label,
        ),
      );
    }
  }
  return tree;
}

export function rehypeLinkPreview(
  options: RehypeLinkPreviewOptions = {},
): Plugin<[], Node, Node> {
  return function attacher() {
    return (tree: Node) => {
      if (tree.type !== "root" || !Array.isArray((tree as RootNode).children)) {
        return tree;
      }
      return transformLinkPreviewTree(tree as RootNode, options);
    };
  };
}

export default rehypeLinkPreview;
