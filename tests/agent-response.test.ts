import { describe, expect, it, vi } from "vitest";
import {
  handleAgentRequest,
  isNegotiablePath,
  markdownPathFor,
  pagePathFor,
  prefersMarkdown,
} from "../src/lib/agent-response";

const notFoundAsset = () => new Response(null, { status: 404 });

/** Assets binding serving the given bodies by pathname. */
function assetsOf(files: Record<string, () => Response>) {
  return {
    fetch: vi.fn(async (request: Request) => {
      const file = files[new URL(request.url).pathname];
      return file ? file() : notFoundAsset();
    }),
  };
}

const htmlNotFound = async () =>
  new Response("<h1>Not Found</h1>", {
    status: 404,
    headers: { "Content-Type": "text/html", ETag: '"html-error"' },
  });

describe("path mapping", () => {
  it.each([
    ["/", "/markdown/index.md"],
    ["/notes", "/markdown/notes.md"],
    ["/notes/example", "/markdown/notes/example.md"],
  ])("maps %s to %s and back", (page, markdown) => {
    expect(markdownPathFor(page)).toBe(markdown);
    expect(pagePathFor(markdown)).toBe(page);
    expect(isNegotiablePath(page)).toBe(true);
    expect(isNegotiablePath(markdown)).toBe(true);
  });

  it.each(["/rss.xml", "/sitemap.xml", "/api/notes/x/like", "/notes/a/b"])(
    "leaves %s to SvelteKit",
    (path) => expect(isNegotiablePath(path)).toBe(false),
  );
});

describe("content negotiation", () => {
  it.each(["GET", "HEAD"])(
    "returns a recoverable Markdown 404 for %s requests",
    async (method) => {
      const response = await handleAgentRequest(
        new Request("https://9rtm.dev/missing", {
          method,
          headers: { Accept: "text/markdown" },
        }),
        assetsOf({}),
        htmlNotFound,
      );
      expect(response.status).toBe(404);
      expect(response.headers.get("Content-Type")).toContain("text/markdown");
      expect(response.headers.get("Vary")).toMatch(/Accept/i);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.headers.has("ETag")).toBe(false);
      const body = await response.text();
      if (method === "HEAD") expect(body).toBe("");
      else {
        expect(body).toContain("could not be found");
        expect(body).toContain("[Notes](/notes)");
        expect(body).toContain("[Sitemap](/sitemap.xml)");
      }
    },
  );

  it("keeps the browser's existing HTML 404 body", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/missing", {
        headers: { Accept: "text/html" },
      }),
      assetsOf({}),
      htmlNotFound,
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("<h1>Not Found</h1>");
    expect(response.headers.get("Vary")).toMatch(/Accept/i);
  });

  it("falls back to SvelteKit's 404 page for a note that was not built", async () => {
    const resolve = vi.fn(htmlNotFound);
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/notes/missing", {
        headers: { Accept: "text/markdown" },
      }),
      assetsOf({}),
      resolve,
    );
    expect(resolve).toHaveBeenCalledOnce();
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toContain("text/markdown");
  });

  it("does not replace JSON API errors or redirects with Markdown", async () => {
    for (const original of [
      Response.json({ error: "missing" }, { status: 404 }),
      new Response(null, { status: 308, headers: { Location: "/notes" } }),
    ]) {
      const response = await handleAgentRequest(
        new Request("https://9rtm.dev/api/missing", {
          headers: { Accept: "text/markdown" },
        }),
        assetsOf({}),
        async () => original,
      );
      expect(response).toBe(original);
    }
  });

  it("serves the prerendered HTML without rendering, advertising Markdown and RSS", async () => {
    const resolve = vi.fn();
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/"),
      assetsOf({
        "/": () =>
          new Response("<html></html>", {
            headers: { Link: '</existing>; rel="help"' },
          }),
      }),
      resolve,
    );
    expect(resolve).not.toHaveBeenCalled();
    expect(await response.text()).toBe("<html></html>");
    const links = response.headers.get("Link");
    expect(links).toContain('</existing>; rel="help"');
    expect(links).toContain(
      '</markdown/index.md>; rel="alternate"; type="text/markdown"',
    );
    expect(links).toContain(
      '</rss.xml>; rel="alternate"; type="application/rss+xml"',
    );
  });

  it("identifies the canonical page for a directly requested Markdown resource", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/markdown/notes/example.md"),
      assetsOf({
        "/markdown/notes/example.md": () => new Response("# Example"),
      }),
      vi.fn(),
    );
    expect(await response.text()).toBe("# Example");
    expect(response.headers.get("Content-Location")).toBe(
      "https://9rtm.dev/notes/example",
    );
    expect(response.headers.get("Link")).toBe(
      '</notes/example>; rel="canonical"',
    );
  });

  it.each([["*"], ['"old", "markdown"']])(
    "returns the Markdown asset's 304 for If-None-Match: %s",
    async (inm) => {
      const fetch = vi.fn(async (request: Request) =>
        request.headers.get("If-None-Match") === inm
          ? new Response(null, { status: 304, headers: { ETag: '"markdown"' } })
          : new Response("# Example"),
      );
      const response = await handleAgentRequest(
        new Request("https://9rtm.dev/notes/example", {
          headers: { Accept: "text/markdown", "If-None-Match": inm },
        }),
        { fetch },
        vi.fn(),
      );
      expect(response.status).toBe(304);
      expect(response.headers.get("ETag")).toBe('"markdown"');
      expect(response.headers.get("Vary")).toMatch(/Accept/i);
    },
  );

  it("redirects a trailing slash on a Markdown resource to its canonical path", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/markdown/notes.md/?a=1"),
      assetsOf({}),
      vi.fn(),
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe("/markdown/notes.md?a=1");
  });

  it("redirects a trailing slash on a page to its canonical path", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/notes/example/?a=1"),
      assetsOf({}),
      vi.fn(),
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe("/notes/example?a=1");
  });

  it.each([
    [null, false],
    ["*/*", false],
    ["text/html", false],
    ["text/markdown", true],
    ["text/markdown;q=0, */*", false],
    ["text/markdown;q=0.5, text/html;q=0.9", false],
    ["text/markdown, text/html;q=0.5", true],
    ["TEXT/MARKDOWN; charset=utf-8", true],
    ["text/markdown;q=invalid", false],
  ])("Accept %s selects Markdown: %s", (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });

  it("returns the original Markdown body, leaving validators to the Markdown asset but dropping ranges", async () => {
    const raw =
      "---\ntitle: Example\n---\n\n```svelte\n<script>example()</script>\n```\n";
    const resolve = vi.fn();
    const fetch = vi.fn(async (request: Request) => {
      expect(request.url).toBe("https://9rtm.dev/markdown/notes/example.md");
      expect(request.headers.get("If-None-Match")).toBe('"html"');
      expect(request.headers.has("If-Modified-Since")).toBe(true);
      for (const name of ["Range", "If-Range"])
        expect(request.headers.has(name)).toBe(false);
      return new Response(raw, {
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Robots-Tag": "noindex",
          ETag: '"markdown"',
        },
      });
    });
    const request = new Request("https://9rtm.dev/notes/example?source=test", {
      headers: {
        Accept: "text/markdown",
        "If-None-Match": '"html"',
        "If-Modified-Since": "Mon, 01 Jan 2024 00:00:00 GMT",
        Range: "bytes=0-20",
        "If-Range": '"html"',
      },
    });
    const response = await handleAgentRequest(request, { fetch }, resolve);
    expect(await response.text()).toBe(raw);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("Content-Location")).toBe(
      "https://9rtm.dev/notes/example",
    );
    expect(response.headers.get("Vary")).toBe("Accept");
    expect(response.headers.get("Cache-Control")).toBe("private, no-cache");
    expect(response.headers.has("X-Robots-Tag")).toBe(false);
    expect(resolve).not.toHaveBeenCalled();
  });

  it("preserves HTML content, status, validators, and existing Vary dimensions", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/", { headers: { Accept: "text/html" } }),
      assetsOf({
        "/": () =>
          new Response("<h1>9rotama / くろたま</h1>", {
            headers: { Vary: "Accept-Encoding", ETag: '"html"' },
          }),
      }),
      vi.fn(),
    );
    expect(await response.text()).toBe("<h1>9rotama / くろたま</h1>");
    expect(response.headers.get("Vary")).toBe("Accept-Encoding, Accept");
    expect(response.headers.get("ETag")).toBe('"html"');
  });

  it("returns headers without a body for HEAD", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/", {
        method: "HEAD",
        headers: { Accept: "text/markdown" },
      }),
      assetsOf({ "/markdown/index.md": () => new Response("# profile") }),
      vi.fn(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/markdown");
    expect(await response.text()).toBe("");
  });

  it("does not negotiate non-page responses or mutation requests", async () => {
    for (const request of [
      new Request("https://9rtm.dev/rss.xml", {
        headers: { Accept: "text/markdown" },
      }),
      new Request("https://9rtm.dev/", { method: "POST" }),
    ]) {
      const original = new Response("unchanged", { status: 201 });
      const assets = assetsOf({});
      const response = await handleAgentRequest(
        request,
        assets,
        async () => original,
      );
      expect(response).toBe(original);
      expect(assets.fetch).not.toHaveBeenCalled();
    }
  });

  it("falls back to HTML when the Markdown asset is missing", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/", {
        headers: { Accept: "text/markdown" },
      }),
      assetsOf({ "/": () => new Response("<html></html>") }),
      vi.fn(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("<html></html>");
    expect(response.headers.get("Vary")).toMatch(/Accept/i);
  });
});
