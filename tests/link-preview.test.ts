import { mkdtemp, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { compile as compileMdsvex } from "mdsvex";
import sharp from "sharp";
import { compile as compileSvelte } from "svelte/compiler";
import { expect, it } from "vitest";
import rehypeLinkPreview, {
  transformLinkPreviewTree,
} from "../src/lib/link-preview/rehype-link-preview.ts";
import {
  getLinkPreview,
  isPrivateAddress,
  parseOpenGraphHtml,
  resolveHttpUrl,
} from "../src/lib/link-preview/ogp.ts";

it("validates HTTP URLs and rejects private destinations", () => {
  expect(resolveHttpUrl("mailto:test@example.com")).toBeNull();
  expect(resolveHttpUrl("#section", "https://9rtm.dev/article")).toBeNull();
  expect(resolveHttpUrl("http://localhost:5173")).toBeNull();
  expect(resolveHttpUrl("http://127.0.0.1:8080")).toBeNull();
  expect(resolveHttpUrl("http://[::1]/")).toBeNull();
  expect(isPrivateAddress("169.254.169.254")).toBe(true);
  expect(isPrivateAddress("10.0.0.1")).toBe(true);
  expect(isPrivateAddress("198.18.0.1")).toBe(true);
  expect(isPrivateAddress("::ffff:127.0.0.1")).toBe(true);
  expect(isPrivateAddress("2001:db8::1")).toBe(true);
  expect(isPrivateAddress("8.8.8.8")).toBe(false);
  expect(isPrivateAddress("2001:4860:4860::8888")).toBe(false);
  expect(resolveHttpUrl("/notes/example", "https://9rtm.dev")?.href).toBe(
    "https://9rtm.dev/notes/example",
  );
});

it("extracts OGP metadata in the documented priority order", () => {
  const metadata = parseOpenGraphHtml(`
    <html><head>
      <title>HTML title</title>
      <meta property="og:title" content="OG title">
      <meta name="twitter:title" content="Twitter title">
      <meta name="description" content="Description">
      <meta property="og:image:secure_url" content="https://example.com/secure.png">
      <meta property="og:image" content="https://example.com/image.png">
      <link rel="icon" href="/icon.svg">
    </head><body><script>ignored()</script></body></html>
  `);
  expect(metadata.title).toBe("OG title");
  expect(metadata.description).toBe("Description");
  expect(metadata.imageUrls).toEqual([
    "https://example.com/secure.png",
    "https://example.com/image.png",
  ]);
  expect(metadata.iconUrl).toBe("/icon.svg");
});

it("fetches and caches metadata and optimized WebP assets", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "9rtm-link-preview-"));
  const cacheDir = path.join(root, "cache");
  const staticDir = path.join(root, "static");
  const png = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 3,
      background: { r: 20, g: 40, b: 60 },
    },
  })
    .png()
    .toBuffer();
  let calls = 0;
  const fetchImpl = async (input: string | URL) => {
    calls += 1;
    if (String(input).endsWith("/image.png")) {
      return new Response(png, {
        headers: { "content-type": "image/png" },
      });
    }
    return new Response(
      `
      <html><head>
        <meta property="og:title" content="Fetched title">
        <meta property="og:description" content="Fetched description">
        <meta property="og:image" content="/image.png">
      </head></html>
    `,
      { headers: { "content-type": "text/html" } },
    );
  };
  const options = {
    baseUrl: "https://example.com",
    cacheDir,
    staticDir,
    fetch: fetchImpl,
    resolveDns: false,
    now: () => 1_000,
  };

  const first = await getLinkPreview("https://example.com/article", options);
  expect(first.title).toBe("Fetched title");
  expect(first.description).toBe("Fetched description");
  expect(first.image ?? "").toMatch(/^\/link-previews\/.+\.webp$/);
  expect(calls).toBe(2);
  const generatedFile = path.join(staticDir, path.basename(first.image ?? ""));
  expect((await stat(generatedFile)).isFile()).toBe(true);
  expect((await readFile(generatedFile)).subarray(0, 4).toString("hex")).toBe(
    "52494646",
  );

  const second = await getLinkPreview("https://example.com/article", options);
  expect(second).toEqual(first);
  expect(calls).toBe(2);
  expect((await readdir(cacheDir)).some((name) => name.endsWith(".json"))).toBe(
    true,
  );
});

it("classifies standalone paragraphs as cards and nested links as mentions", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "9rtm-link-preview-hast-"));
  const tree = {
    type: "root" as const,
    children: [
      {
        type: "element" as const,
        tagName: "p",
        properties: {},
        children: [
          {
            type: "element" as const,
            tagName: "a",
            properties: { href: "https://example.com/card" },
            children: [
              { type: "text" as const, value: "https://example.com/card" },
            ],
          },
        ],
      },
      {
        type: "element" as const,
        tagName: "ul",
        properties: {},
        children: [
          {
            type: "element" as const,
            tagName: "li",
            properties: {},
            children: [
              {
                type: "element" as const,
                tagName: "a",
                properties: { href: "https://example.com/list" },
                children: [{ type: "text" as const, value: "Named link" }],
              },
            ],
          },
        ],
      },
    ],
  };
  const fetchImpl = async () =>
    new Response(
      "<html><head><meta property='og:title' content='Example'></head></html>",
      { headers: { "content-type": "text/html" } },
    );
  await transformLinkPreviewTree(tree, {
    baseUrl: "https://9rtm.dev",
    cacheDir: path.join(root, "cache"),
    staticDir: path.join(root, "static"),
    fetch: fetchImpl,
    resolveDns: false,
  });

  type TestElement = {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: TestElement[];
  };
  const children = tree.children as unknown as TestElement[];
  expect(children[0].type).toBe("element");
  expect(children[0].tagName).toBe("LinkPreview");
  expect(children[0].properties?.variant).toBe("card");
  const listLink = children[1].children?.[0].children?.[0];
  expect(listLink).toBeDefined();
  if (!listLink) return;
  expect(listLink.type).toBe("element");
  expect(listLink.tagName).toBe("LinkPreview");
  expect(listLink.properties?.variant).toBe("inline");
  expect(listLink.properties?.label).toBe("Named link");
});

it("keeps non-standalone structures inline and preserves non-HTTP links", async () => {
  const root = await mkdtemp(
    path.join(tmpdir(), "9rtm-link-preview-structure-"),
  );
  const anchor = (href: string, label = href) => ({
    type: "element" as const,
    tagName: "a",
    properties: { href },
    children: [{ type: "text" as const, value: label }],
  });
  const tree = {
    type: "root" as const,
    children: [
      {
        type: "element" as const,
        tagName: "p",
        properties: {},
        children: [
          anchor("https://example.com/first", "First"),
          { type: "text" as const, value: " and " },
          anchor("https://example.com/second"),
        ],
      },
      {
        type: "element" as const,
        tagName: "blockquote",
        properties: {},
        children: [
          {
            type: "element" as const,
            tagName: "p",
            properties: {},
            children: [anchor("https://example.com/quote", "Quote")],
          },
        ],
      },
      {
        type: "element" as const,
        tagName: "h2",
        properties: {},
        children: [anchor("https://example.com/heading", "Heading")],
      },
      {
        type: "element" as const,
        tagName: "p",
        properties: {},
        children: [anchor("/notes/relative")],
      },
      {
        type: "element" as const,
        tagName: "p",
        properties: {},
        children: [
          anchor("mailto:hello@example.com", "mail"),
          { type: "text" as const, value: " " },
          anchor("tel:+810000000000", "phone"),
          { type: "text" as const, value: " " },
          anchor("#section", "section"),
        ],
      },
    ],
  };
  const fetchImpl = async () =>
    new Response("<html><head><title>Fetched</title></head></html>", {
      headers: { "content-type": "text/html" },
    });

  await transformLinkPreviewTree(tree, {
    baseUrl: "https://9rtm.dev",
    cacheDir: path.join(root, "cache"),
    staticDir: path.join(root, "static"),
    fetch: fetchImpl,
    resolveDns: false,
  });

  type TestNode = {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: TestNode[];
  };
  const children = tree.children as unknown as TestNode[];
  const paragraph = children[0];
  expect(paragraph.tagName).toBe("p");
  expect(paragraph.children?.[0].tagName).toBe("LinkPreview");
  expect(paragraph.children?.[2].tagName).toBe("LinkPreview");

  expect(children[1].tagName).toBe("blockquote");
  expect(children[1].children?.[0].children?.[0].tagName).toBe("LinkPreview");
  expect(children[2].tagName).toBe("h2");
  expect(children[2].children?.[0].tagName).toBe("LinkPreview");

  const relative = children[3];
  expect(relative.tagName).toBe("LinkPreview");
  expect(relative.properties?.variant).toBe("card");
  expect(relative.properties?.href).toBe("/notes/relative");
  expect(relative.properties?.external).toBeUndefined();

  const unchanged = children[4].children ?? [];
  expect(unchanged[0].tagName).toBe("a");
  expect(unchanged[2].tagName).toBe("a");
  expect(unchanged[4].tagName).toBe("a");
});

it("uses named labels only as fallback titles and truncates bare titles", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "9rtm-link-preview-labels-"));
  const tree = {
    type: "root" as const,
    children: [
      {
        type: "element" as const,
        tagName: "p",
        properties: {},
        children: [
          {
            type: "element" as const,
            tagName: "a",
            properties: { href: "https://example.com/named" },
            children: [{ type: "text" as const, value: "Named fallback" }],
          },
          { type: "text" as const, value: " " },
          {
            type: "element" as const,
            tagName: "a",
            properties: { href: "https://example.com/bare" },
            children: [
              { type: "text" as const, value: "https://example.com/bare" },
            ],
          },
        ],
      },
    ],
  };
  const fetchImpl = async (input: string | URL) => {
    const title = String(input).endsWith("/named")
      ? "<title></title>"
      : `<title>${"A".repeat(50)}</title>`;
    return new Response(`<html><head>${title}</head></html>`, {
      headers: { "content-type": "text/html" },
    });
  };

  await transformLinkPreviewTree(tree, {
    baseUrl: "https://9rtm.dev",
    cacheDir: path.join(root, "cache"),
    staticDir: path.join(root, "static"),
    fetch: fetchImpl,
    resolveDns: false,
  });

  type TestNode = {
    properties?: Record<string, unknown>;
  };
  const links = tree.children[0].children as unknown as TestNode[];
  const named = links[0];
  const bare = links[2];
  expect(named.properties?.title).toBe("Named fallback");
  expect(named.properties?.label).toBe("Named fallback");
  expect(bare.properties?.label).toBeUndefined();
  expect(bare.properties?.title).toBe(
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  );
});

it("validates redirects, enforces the redirect limit, and refreshes stale cache", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "9rtm-link-preview-network-"));
  const baseOptions = {
    baseUrl: "https://example.com",
    staticDir: path.join(root, "static"),
    resolveDns: false,
  };

  const safeRequests: string[] = [];
  const safe = await getLinkPreview("https://example.com/start", {
    ...baseOptions,
    cacheDir: path.join(root, "safe-cache"),
    fetch: async (input: string | URL) => {
      const href = String(input);
      safeRequests.push(href);
      if (href.endsWith("/start")) {
        return new Response(null, {
          status: 302,
          headers: { location: "/final" },
        });
      }
      return new Response("<title>Redirected</title>", {
        headers: { "content-type": "text/html" },
      });
    },
  });
  expect(safe.title).toBe("Redirected");
  expect(safeRequests).toEqual([
    "https://example.com/start",
    "https://example.com/final",
  ]);

  const unsafeRequests: string[] = [];
  const unsafe = await getLinkPreview("https://example.com/unsafe", {
    ...baseOptions,
    cacheDir: path.join(root, "unsafe-cache"),
    fetch: async (input: string | URL) => {
      unsafeRequests.push(String(input));
      return new Response(null, {
        status: 302,
        headers: { location: "http://127.0.0.1/private" },
      });
    },
  });
  expect(unsafe.title).toBe("example.com");
  expect(unsafeRequests).toEqual(["https://example.com/unsafe"]);

  const limitedRequests: string[] = [];
  const limited = await getLinkPreview("https://example.com/hop-0", {
    ...baseOptions,
    cacheDir: path.join(root, "limited-cache"),
    fetch: async (input: string | URL) => {
      const href = String(input);
      limitedRequests.push(href);
      const hop = Number.parseInt(href.split("/hop-")[1] ?? "0", 10);
      return new Response(null, {
        status: 302,
        headers: { location: `/hop-${hop + 1}` },
      });
    },
  });
  expect(limited.title).toBe("example.com");
  expect(limitedRequests.length).toBe(6);

  let now = 1_000;
  let currentTitle = "Fresh title";
  let calls = 0;
  const staleOptions = {
    ...baseOptions,
    cacheDir: path.join(root, "stale-cache"),
    now: () => now,
    fetch: async () => {
      calls += 1;
      return new Response(`<title>${currentTitle}</title>`, {
        headers: { "content-type": "text/html" },
      });
    },
  };
  expect(
    (await getLinkPreview("https://example.com/stale", staleOptions)).title,
  ).toBe("Fresh title");
  currentTitle = "Refreshed title";
  now += 24 * 60 * 60 * 1000 + 1;
  expect(
    (await getLinkPreview("https://example.com/stale", staleOptions)).title,
  ).toBe("Refreshed title");
  expect(calls).toBe(2);
});

it("revalidates DNS when opening the connection", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "9rtm-link-preview-dns-"));
  let lookups = 0;
  const preview = await getLinkPreview("https://example.com/rebinding", {
    cacheDir: path.join(root, "cache"),
    staticDir: path.join(root, "static"),
    lookup: async () => {
      lookups += 1;
      return [{ address: lookups === 1 ? "8.8.8.8" : "127.0.0.1", family: 4 }];
    },
  });

  expect(lookups).toBe(2);
  expect(preview.title).toBe("example.com");
});

it("omits image URLs when generated files cannot be published", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "9rtm-link-preview-image-"));
  const blocker = path.join(root, "blocker");
  await writeFile(blocker, "not a directory");
  const png = await sharp({
    create: {
      width: 1,
      height: 1,
      channels: 3,
      background: "black",
    },
  })
    .png()
    .toBuffer();
  const preview = await getLinkPreview("https://example.com/article", {
    cacheDir: path.join(root, "cache"),
    staticDir: path.join(blocker, "static"),
    fetch: async (input) =>
      String(input).endsWith("image.png")
        ? new Response(png, { headers: { "content-type": "image/png" } })
        : new Response(
            '<meta property="og:image" content="https://example.com/image.png">',
            { headers: { "content-type": "text/html" } },
          ),
    resolveDns: false,
  });

  expect(preview.image).toBeUndefined();
});

it("escapes remote metadata before mdsvex emits Svelte attributes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "9rtm-link-preview-escape-"));
  const compiled = await compileMdsvex(
    '[A & " < > { }](https://example.com/?a=1&b=2)',
    {
      rehypePlugins: [
        rehypeLinkPreview({
          baseUrl: "https://9rtm.dev",
          cacheDir: path.join(root, "cache"),
          staticDir: path.join(root, "static"),
          fetch: async () =>
            new Response(
              `<html><head>
                  <meta property="og:title" content="Title &quot;quoted&quot; &lt;tag&gt; &#123;expr&#125; &amp; more">
                  <meta property="og:description" content="Description &quot;quoted&quot; &lt;tag&gt; &#123;expr&#125; &amp; more">
                  <meta property="og:site_name" content="Site &quot;name&quot; &lt;tag&gt; &#123;expr&#125; &amp; more">
                  <link rel="icon" href="https://example.com/icon?x=1&amp;y=2">
                </head></html>`,
              { headers: { "content-type": "text/html" } },
            ),
          resolveDns: false,
        }),
      ],
    },
  );
  expect(compiled).toBeTruthy();
  if (!compiled) throw new Error("Expected mdsvex compilation result");

  expect(compiled.code).toMatch(
    /title="Title &quot;quoted&quot; &lt;tag&gt; &#123;expr&#125; &amp; more"/,
  );
  expect(compiled.code).toMatch(/label="A &amp; ” &lt; &gt; &#123; &#125;"/);
  expect(() =>
    compileSvelte(compiled.code, { generate: "server" }),
  ).not.toThrow();
});
