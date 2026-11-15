export type MarkdownPages = Record<string, string>;

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

export async function handleAgentRequest(
  request: Request,
  resolve: (request: Request) => Promise<Response>,
  assets: { fetch: (request: Request) => Promise<Response> },
  pages: MarkdownPages,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD")
    return resolve(request);

  const url = new URL(request.url);
  const markdownPath = Object.hasOwn(pages, url.pathname)
    ? pages[url.pathname]
    : undefined;
  const markdown = prefersMarkdown(request.headers.get("Accept"));
  let response: Response;

  if (markdown && markdownPath) {
    const assetUrl = new URL(markdownPath, url);
    const headers = new Headers(request.headers);
    headers.set("Accept", "text/markdown");
    // HTML validators and byte ranges cannot validate a different representation.
    for (const header of [
      "If-None-Match",
      "If-Modified-Since",
      "Range",
      "If-Range",
    ])
      headers.delete(header);
    response = await assets.fetch(
      new Request(assetUrl, { method: "GET", headers }),
    );
    if (!response.ok)
      return new Response("Markdown representation unavailable", {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    response = new Response(
      request.method === "HEAD" ? null : response.body,
      response,
    );
    response.headers.set("Content-Type", "text/markdown; charset=utf-8");
    response.headers.set("Content-Location", url.origin + url.pathname);
    response.headers.delete("Content-Length");
    response.headers.delete("X-Robots-Tag");
  } else {
    response = await resolve(request);
    if (
      response.status === 404 &&
      response.headers.get("Content-Type")?.includes("text/html")
    ) {
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
    if (!markdownPath) {
      const canonical = Object.entries(pages).find(
        ([, path]) => path === url.pathname,
      )?.[0];
      if (!canonical) return response;
      response = new Response(response.body, response);
      response.headers.set("Content-Location", url.origin + canonical);
      response.headers.append("Link", `<${canonical}>; rel="canonical"`);
      return response;
    }
    response = new Response(response.body, response);
  }

  response.headers.append(
    "Link",
    `<${markdownPath}>; rel="alternate"; type="text/markdown", </rss.xml>; rel="alternate"; type="application/rss+xml"`,
  );
  varyAccept(response.headers);
  // Cloudflare's shared cache does not generally key on Vary: Accept.
  response.headers.set("Cache-Control", "private, no-cache");
  return response;
}
