import type { Result } from "$lib/result";
import z from "zod";

export const selfNoteMetadataSchema = z.object({
  title: z.string(),
  emoji: z.string(),
  published_at: z.string().transform((str) => new Date(str)),
  published: z.boolean(),
});

type SelfNoteMetadata = z.infer<typeof selfNoteMetadataSchema>;
type SelfNoteData = SelfNoteMetadata & {
  slug: string;
};

export async function getSelfNotes(): Promise<
  Result<{ notes: SelfNoteData[] }, "metadata-error" | "error">
> {
  const selfNotesMds = import.meta.glob("../_content/notes/*.md", {
    eager: true,
  });

  const mds = selfNotesMds as Record<string, App.MdsvexFile>;
  const notes: SelfNoteData[] = [];

  for (const path in mds) {
    const md = mds[path];

    const parsed = selfNoteMetadataSchema.safeParse(md.metadata);

    if (!parsed.success) {
      return { success: false, error: "metadata-error" };
    }

    const slug = path.split("/").at(-1)?.replace(".md", "");
    if (!slug) {
      return { success: false, error: "error" };
    }

    const note = { ...parsed.data, slug };
    if (note.published || import.meta.env.NODE_ENV === "development") {
      notes.push(note);
    }
  }

  return { success: true, data: { notes } };
}
