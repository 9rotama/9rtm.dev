import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Note } from "./_lib/note";
import { getSelfNotes } from "./_lib/self";
import { getZennArticles } from "./_lib/zenn";

export const load: PageServerLoad = async () => {
  const zennRes = await getZennArticles();
  if (!zennRes.success)
    return error(500, { message: "zenn: " + zennRes.error });

  const selfRes = await getSelfNotes();
  if (!selfRes.success)
    return error(500, { message: "self: " + selfRes.error });

  const notes = [
    ...selfRes.data.notes.map(
      (note) =>
        ({
          slug: note.slug,
          title: note.title,
          publishedAt: new Date(note.published_at),
          href: `/notes/${note.slug}`,
          thumbnail: { type: "emoji", emoji: note.emoji },
          platform: "self",
        }) satisfies Note,
    ),
    ...zennRes.data.articles.map(
      (article) =>
        ({
          slug: `zenn-${article.id}`,
          title: article.title,
          publishedAt: new Date(article.published_at),
          href: new URL(article.path, "https://zenn.dev").toString(),
          thumbnail: { type: "emoji", emoji: article.emoji },
          platform: "zenn",
        }) satisfies Note,
    ),
  ];

  notes.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return { notes };
};
