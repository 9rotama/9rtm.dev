type Assets = { fetch: (request: Request) => Promise<Response> };

/** Markdown counterpart of a page, matching the entries of `/markdown/[...path]`. */
export function markdownPathFor(pathname: string): string | undefined {
  if (pathname === "/") return "/markdown/index.md";
  if (/^\/notes(\/[^/]+)?$/.test(pathname)) return `/markdown${pathname}.md`;
}

/** Page a Markdown resource represents. */
export function pagePathFor(pathname: string): string | undefined {
  if (pathname === "/markdown/index.md") return "/";
  return /^\/markdown(\/notes(?:\/[^/]+)?)\.md$/.exec(pathname)?.[1];
}

/** Paths whose prerendered assets must be served through the `handle` hook. */
export function isNegotiablePath(pathname: string): boolean {
  return (
    markdownPathFor(pathname) !== undefined ||
    pagePathFor(pathname) !== undefined
  );
}

export function prefersMarkdown(accept: string | null): boolean {
  const ranges = (accept ?? "").split(",").map((range) => {
    const [type, ...parameters] = range.trim().toLowerCase().split(";");
    const q = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const quality = q ? Number(q.trim().slice(2)) : 1;
    return {
      type: type.trim(),
      quality: quality >= 0 && quality <= 1 ? quality : 0,
    };
  });
  const quality = (type: string) =>
    ranges.find((range) => range.type === type)?.quality;
  const markdown = quality("text/markdown") ?? 0;
  const html = quality("text/html") ?? quality("text/*") ?? quality("*/*") ?? 0;
  return markdown > 0 && markdown >= html;
}

function varyAccept(headers: Headers) {
  const vary = headers.get("Vary");
  if (
    vary === "*" ||
    vary?.split(",").some((value) => value.trim().toLowerCase() === "accept")
  )
    return;
  headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
}

async function fetchMarkdown(
  request: Request,
  url: URL,
  markdownPath: string,
  assets: Assets,
): Promise<Response | undefined> {
  const headers = new Headers(request.headers);
  headers.set("Accept", "text/markdown");
  // Validators pass through so the asset evaluates them against the Markdown's own ETag;
  // byte ranges are dropped because the full Markdown is always returned.
  headers.delete("Range");
  headers.delete("If-Range");
  const asset = await assets.fetch(
    new Request(new URL(markdownPath, url), { method: "GET", headers }),
  );
  if (asset.status !== 200 && asset.status !== 304) return undefined;
  const response = new Response(
    request.method === "HEAD" ? null : asset.body,
    asset,
  );
  response.headers.set("Content-Type", "text/markdown; charset=utf-8");
  response.headers.set("Content-Location", url.origin + url.pathname);
  response.headers.delete("Content-Length");
  response.headers.delete("X-Robots-Tag");
  return response;
}

function notFound(request: Request, response: Response, markdown: boolean) {
  const headers = new Headers(response.headers);
  varyAccept(headers);
  headers.set("Cache-Control", "no-store");
  let body: BodyInit | null = response.body;
  if (markdown) {
    body =
      "# 404 Not Found\n\nThe requested page could not be found.\n\n[Home](/) · [Notes](/notes) · [Sitemap](/sitemap.xml)\n";
    headers.set("Content-Type", "text/markdown; charset=utf-8");
    for (const header of [
      "Content-Length",
      "Content-Encoding",
      "ETag",
      "Last-Modified",
    ])
      headers.delete(header);
  }
  return new Response(request.method === "HEAD" ? null : body, {
    status: 404,
    headers,
  });
}

/**
 * Serves prerendered pages from `assets` in the representation `Accept` asks for.
 * `resolve` handles everything else, and anything missing from `assets`.
 */
export async function handleAgentRequest(
  request: Request,
  assets: Assets,
  resolve: () => Promise<Response>,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") return resolve();

  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    const location = url.pathname.slice(0, -1);
    if (isNegotiablePath(location))
      return new Response(null, {
        status: 308,
        headers: { Location: location + url.search },
      });
  }

  const markdownPath = markdownPathFor(url.pathname);
  const pagePath = pagePathFor(url.pathname);
  const markdown = prefersMarkdown(request.headers.get("Accept"));

  let response =
    markdown && markdownPath
      ? await fetchMarkdown(request, url, markdownPath, assets)
      : undefined;
  if (!response && (markdownPath || pagePath)) {
    const asset = await assets.fetch(request);
    if (asset.status !== 404) response = asset;
  }
  response ??= await resolve();

  if (
    response.status === 404 &&
    response.headers.get("Content-Type")?.includes("text/html")
  )
    return notFound(request, response, markdown);

  if (pagePath) {
    response = new Response(response.body, response);
    response.headers.set("Content-Location", url.origin + pagePath);
    response.headers.append("Link", `<${pagePath}>; rel="canonical"`);
    return response;
  }
  if (!markdownPath) return response;

  response = new Response(response.body, response);
  response.headers.append(
    "Link",
    `<${markdownPath}>; rel="alternate"; type="text/markdown", </rss.xml>; rel="alternate"; type="application/rss+xml"`,
  );
  varyAccept(response.headers);
  // Cloudflare's shared cache does not generally key on Vary: Accept.
  response.headers.set("Cache-Control", "private, no-cache");
  return response;
}
