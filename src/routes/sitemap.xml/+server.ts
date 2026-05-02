import { getSelfNotes } from "$lib/content";
import type { RequestHandler } from "./$types";
import { PUBLIC_BASE_URL } from "$env/static/public";

const SITE_URL = PUBLIC_BASE_URL.trim();

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
};

function buildSitemap(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const lines = [`\t\t<loc>${entry.url}</loc>`];
    if (entry.lastModified) {
      lines.push(
        `\t\t<lastmod>${entry.lastModified.toISOString().split("T")[0]}</lastmod>`,
      );
    }
    if (entry.changeFrequency) {
      lines.push(`\t\t<changefreq>${entry.changeFrequency}</changefreq>`);
    }
    if (entry.priority !== undefined) {
      lines.push(`\t\t<priority>${entry.priority.toFixed(1)}</priority>`);
    }
    return `\t<url>\n${lines.join("\n")}\n\t</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

export const prerender = true;

export const GET: RequestHandler = async () => {
  const selfRes = await getSelfNotes();

  if (!selfRes.success) {
    return new Response("Error generating sitemap", { status: 500 });
  }

  const entries: SitemapEntry[] = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/notes`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...selfRes.data.notes.map(
      (note): SitemapEntry => ({
        url: `${SITE_URL}/notes/${note.slug}`,
        lastModified: note.published_at,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
  ];

  return new Response(buildSitemap(entries), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=0, s-maxage=3600",
    },
  });
};
