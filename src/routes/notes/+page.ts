import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Note } from "./_lib/note";
import { getSelfNotes } from "./_lib/self";

export const load: PageLoad = async () => {
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
          tags: note.tags,
          excerpt: note.excerpt,
        }) satisfies Note,
    ),
  ];

  notes.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return { notes };
};
