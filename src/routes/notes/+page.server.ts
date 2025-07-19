import type { PageServerLoad } from "./$types";
import type { Note } from "./_lib/note";
import { getZennArticles } from "./_lib/zenn";

export const load: PageServerLoad = async () => {
  const zennNotes = await getZennArticles();
  const notes: Note[] = zennNotes.articles.map(
    (article) =>
      ({
        title: article.title,
        publishedAt: new Date(article.published_at),
        href: new URL(article.path, "https://zenn.dev").toString(),
        thumbnail: { type: "emoji", emoji: article.emoji },
        platform: "zenn",
      }) satisfies Note,
  );

  return { notes };
};
