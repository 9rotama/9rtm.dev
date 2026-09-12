import { mkdtemp, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import test from "node:test";
import { compile as compileMdsvex } from "mdsvex";
import sharp from "sharp";
import { compile as compileSvelte } from "svelte/compiler";
import rehypeLinkPreview, {
  transformLinkPreviewTree,
} from "../src/lib/link-preview/rehype-link-preview.ts";
import {
  getLinkPreview,
  isPrivateAddress,
  parseOpenGraphHtml,
  resolveHttpUrl,
  truncateTitle,
} from "../src/lib/link-preview/ogp.ts";

test("validates HTTP URLs and rejects private destinations", () => {
  assert.equal(resolveHttpUrl("mailto:test@example.com"), null);
  assert.equal(resolveHttpUrl("#section", "https://9rtm.dev/article"), null);
  assert.equal(resolveHttpUrl("http://localhost:5173"), null);
  assert.equal(resolveHttpUrl("http://127.0.0.1:8080"), null);
  assert.equal(resolveHttpUrl("http://[::1]/"), null);
  assert.equal(isPrivateAddress("169.254.169.254"), true);
  assert.equal(isPrivateAddress("10.0.0.1"), true);
  assert.equal(
    resolveHttpUrl("/notes/example", "https://9rtm.dev")?.href,
    "https://9rtm.dev/notes/example",
  );
});

test("extracts OGP metadata in the documented priority order", () => {
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
  assert.equal(metadata.title, "OG title");
  assert.equal(metadata.description, "Description");
  assert.deepEqual(metadata.imageUrls, [
    "https://example.com/secure.png",
    "https://example.com/image.png",
  ]);
  assert.equal(metadata.iconUrl, "/icon.svg");
  assert.equal(truncateTitle("あ".repeat(41)).length, 40);
});

test("fetches and caches metadata and optimized WebP assets", async () => {
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
  assert.equal(first.title, "Fetched title");
  assert.equal(first.description, "Fetched description");
  assert.match(first.image ?? "", /^\/link-previews\/.+\.webp$/);
  assert.equal(calls, 2);
  const generatedFile = path.join(staticDir, path.basename(first.image ?? ""));
  assert.equal((await stat(generatedFile)).isFile(), true);
  assert.equal(
    (await readFile(generatedFile)).subarray(0, 4).toString("hex"),
    "52494646",
  );

  const second = await getLinkPreview("https://example.com/article", options);
  assert.deepEqual(second, first);
  assert.equal(calls, 2);
  assert.ok((await readdir(cacheDir)).some((name) => name.endsWith(".json")));
});

test("classifies standalone paragraphs as cards and nested links as mentions", async () => {
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
  assert.equal(children[0].type, "element");
  assert.equal(children[0].tagName, "LinkPreview");
  assert.equal(children[0].properties?.variant, "card");
  const listLink = children[1].children?.[0].children?.[0];
  assert.ok(listLink);
  assert.equal(listLink.type, "element");
  assert.equal(listLink.tagName, "LinkPreview");
  assert.equal(listLink.properties?.variant, "inline");
  assert.equal(listLink.properties?.label, "Named link");
});

test("keeps non-standalone structures inline and preserves non-HTTP links", async () => {
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
  assert.equal(paragraph.tagName, "p");
  assert.equal(paragraph.children?.[0].tagName, "LinkPreview");
  assert.equal(paragraph.children?.[2].tagName, "LinkPreview");

  assert.equal(children[1].tagName, "blockquote");
  assert.equal(children[1].children?.[0].children?.[0].tagName, "LinkPreview");
  assert.equal(children[2].tagName, "h2");
  assert.equal(children[2].children?.[0].tagName, "LinkPreview");

  const relative = children[3];
  assert.equal(relative.tagName, "LinkPreview");
  assert.equal(relative.properties?.variant, "card");
  assert.equal(relative.properties?.href, "/notes/relative");
  assert.equal(relative.properties?.external, undefined);

  const unchanged = children[4].children ?? [];
  assert.equal(unchanged[0].tagName, "a");
  assert.equal(unchanged[2].tagName, "a");
  assert.equal(unchanged[4].tagName, "a");
});

test("uses named labels only as fallback titles and truncates bare titles", async () => {
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
  assert.equal(named.properties?.title, "Named fallback");
  assert.equal(named.properties?.label, "Named fallback");
  assert.equal(bare.properties?.label, undefined);
  assert.equal(
    bare.properties?.title,
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  );
  assert.equal(truncateTitle(String(bare.properties?.title)).length, 40);
});

test("validates redirects, enforces the redirect limit, and refreshes stale cache", async () => {
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
  assert.equal(safe.title, "Redirected");
  assert.deepEqual(safeRequests, [
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
  assert.equal(unsafe.title, "example.com");
  assert.deepEqual(unsafeRequests, ["https://example.com/unsafe"]);

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
  assert.equal(limited.title, "example.com");
  assert.equal(limitedRequests.length, 6);

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
  assert.equal(
    (await getLinkPreview("https://example.com/stale", staleOptions)).title,
    "Fresh title",
  );
  currentTitle = "Refreshed title";
  now += 24 * 60 * 60 * 1000 + 1;
  assert.equal(
    (await getLinkPreview("https://example.com/stale", staleOptions)).title,
    "Refreshed title",
  );
  assert.equal(calls, 2);
});

test("escapes remote metadata before mdsvex emits Svelte attributes", async () => {
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
  assert.ok(compiled);

  assert.match(
    compiled.code,
    /title="Title &quot;quoted&quot; &lt;tag&gt; &#123;expr&#125; &amp; more"/,
  );
  assert.match(compiled.code, /label="A &amp; ” &lt; &gt; &#123; &#125;"/);
  assert.doesNotThrow(() =>
    compileSvelte(compiled.code, { generate: "server" }),
  );
});
