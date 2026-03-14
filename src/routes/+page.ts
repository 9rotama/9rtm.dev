import type { Note } from "./notes/_lib/note";
import { getSelfNotes } from "./notes/_lib/self";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  const selfRes = await getSelfNotes();
  if (!selfRes.success) return { latestNote: null };

  const notes = selfRes.data.notes
    .filter((n) => n.published)
    .map(
      (note) =>
        ({
          slug: note.slug,
          title: note.title,
          publishedAt: new Date(note.published_at),
          href: `/notes/${note.slug}`,
          thumbnail: { type: "emoji", emoji: note.emoji },
          platform: "self",
          tags: note.tags,
        }) satisfies Note,
    )
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return { latestNote: notes[0] ?? null };
};
