import { getSelfNotes } from "../notes/_lib/self";
import type { RequestHandler } from "./$types";

const SITE_URL = "https://9rtm.dev";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const selfRes = await getSelfNotes();

  if (!selfRes.success) {
    return new Response("Error generating sitemap", { status: 500 });
  }

  const notes = selfRes.data.notes;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${SITE_URL}/</loc>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>
	<url>
		<loc>${SITE_URL}/notes</loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
${notes
  .map(
    (note) => `	<url>
		<loc>${SITE_URL}/notes/${note.slug}</loc>
		<lastmod>${note.published_at.toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=0, s-maxage=3600",
    },
  });
};
