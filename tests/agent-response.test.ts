import { describe, expect, it, vi } from "vitest";
import { handleAgentRequest, prefersMarkdown } from "../src/lib/agent-response";

const pages = {
  "/": "/markdown/index.md",
  "/notes/example": "/markdown/notes/example.md",
};

describe("content negotiation", () => {
  it.each(["GET", "HEAD"])(
    "returns a recoverable Markdown 404 for %s requests",
    async (method) => {
      const response = await handleAgentRequest(
        new Request("https://9rtm.dev/missing", {
          method,
          headers: { Accept: "text/markdown" },
        }),
        async () =>
          new Response("<h1>Not Found</h1>", {
            status: 404,
            headers: { "Content-Type": "text/html", ETag: '"html-error"' },
          }),
        { fetch: vi.fn() },
        pages,
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
      async () =>
        new Response("<h1>Not Found</h1>", {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }),
      { fetch: vi.fn() },
      pages,
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("<h1>Not Found</h1>");
    expect(response.headers.get("Vary")).toMatch(/Accept/i);
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
        async () => original,
        { fetch: vi.fn() },
        pages,
      );
      expect(response).toBe(original);
    }
  });
  it("advertises existing Markdown and RSS resources without replacing other Link values", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/"),
      async () =>
        new Response("<html></html>", {
          headers: { Link: '</existing>; rel="help"' },
        }),
      { fetch: vi.fn() },
      pages,
    );
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
      async () => new Response("# Example"),
      { fetch: vi.fn() },
      pages,
    );
    expect(response.headers.get("Content-Location")).toBe(
      "https://9rtm.dev/notes/example",
    );
    expect(response.headers.get("Link")).toBe(
      '</notes/example>; rel="canonical"',
    );
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

  it("returns the original Markdown body without leaking HTML validators to its asset request", async () => {
    const raw =
      "---\ntitle: Example\n---\n\n```svelte\n<script>example()</script>\n```\n";
    const resolve = vi.fn();
    const fetch = vi.fn(async (request: Request) => {
      expect(request.url).toBe("https://9rtm.dev/markdown/notes/example.md");
      for (const name of [
        "If-None-Match",
        "If-Modified-Since",
        "Range",
        "If-Range",
      ])
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
    const response = await handleAgentRequest(
      request,
      resolve,
      { fetch },
      pages,
    );
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
      async () =>
        new Response("<h1>9rotama / くろたま</h1>", {
          headers: { Vary: "Accept-Encoding", ETag: '"html"' },
        }),
      { fetch: vi.fn() },
      pages,
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
      vi.fn(),
      { fetch: async () => new Response("# profile") },
      pages,
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
      const response = await handleAgentRequest(
        request,
        async () => original,
        { fetch: vi.fn() },
        pages,
      );
      expect(response).toBe(original);
    }
  });

  it("does not report a broken Markdown asset as success", async () => {
    const response = await handleAgentRequest(
      new Request("https://9rtm.dev/", {
        headers: { Accept: "text/markdown" },
      }),
      vi.fn(),
      { fetch: async () => new Response("missing", { status: 404 }) },
      pages,
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
