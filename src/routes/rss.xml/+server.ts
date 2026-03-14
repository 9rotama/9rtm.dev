import { PUBLIC_BASE_URL } from "$env/static/public";
import { Feed } from "feed";
import { getSelfNotes } from "../notes/_lib/self";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const selfRes = await getSelfNotes();

  if (!selfRes.success) {
    return new Response("Error generating feed", { status: 500 });
  }

  const feed = new Feed({
    title: "9rtm.dev",
    description:
      "9rotama / くろたまのプロフィール・技術ブログ。フロントエンド開発やThree.jsについて書いています。",
    id: PUBLIC_BASE_URL,
    link: PUBLIC_BASE_URL,
    language: "ja",
    copyright: `© 2026 9rotama`,
    author: {
      name: "9rotama",
      link: "https://github.com/9rotama",
    },
  });

  const notes = selfRes.data.notes
    .filter((n) => n.published)
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );

  for (const note of notes) {
    feed.addItem({
      title: note.title,
      id: `${PUBLIC_BASE_URL}/notes/${note.slug}`,
      link: `${PUBLIC_BASE_URL}/notes/${note.slug}`,
      date: new Date(note.published_at),
      description: note.excerpt,
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=0, s-maxage=3600",
    },
  });
};
