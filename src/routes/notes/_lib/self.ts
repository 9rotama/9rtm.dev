import type { Result } from "$lib/result";
import matter from "gray-matter";
import z from "zod";

const selfNoteMetadataSchema = z.object({
  title: z.string(),
  emoji: z.string(),
  published_at: z.date(),
  published: z.boolean(),
});

type SelfNoteMetadata = z.infer<typeof selfNoteMetadataSchema>;
type SelfNoteData = SelfNoteMetadata & {
  slug: string;
};

export async function getSelfNotes(): Promise<
  Result<{ notes: SelfNoteData[] }, "metadata-error" | "error">
> {
  const mds = import.meta.glob("/content/notes/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const notes: SelfNoteData[] = [];

  for (const path in mds) {
    const md = mds[path];
    const metadata = matter(md).data;
    const parsed = selfNoteMetadataSchema.safeParse(metadata);

    if (!parsed.success) {
      return { success: false, error: "metadata-error" };
    }

    const slug = path.split("/").at(-1)?.replace(".md", "");
    console.log("slug", slug);
    if (!slug) {
      return { success: false, error: "error" };
    }

    const note = { ...parsed.data, slug };
    if (note.published) {
      notes.push(note);
    }
  }

  return { success: true, data: { notes } };
}
