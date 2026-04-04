import type { Result } from "$lib/result";
import z from "zod";

export const selfNoteMetadataSchema = z.object({
  title: z.string(),
  emoji: z.string(),
  published_at: z.string().transform((str) => new Date(str)),
  published: z.boolean(),
  tags: z.array(z.string()).default([]),
});

type SelfNoteMetadata = z.infer<typeof selfNoteMetadataSchema>;
type SelfNoteData = SelfNoteMetadata & {
  slug: string;
  excerpt: string;
};

const selfNotesMds = import.meta.glob("/contents/notes/*.md", {
  eager: true,
}) as Record<string, App.MdsvexFile>;

const selfNotesRaws = import.meta.glob("/contents/notes/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export function extractExcerpt(raw: string, maxLength = 100): string {
  const plain = raw
    .replace(/---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[#*`>~_|\\-]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxLength ? plain.slice(0, maxLength) + "…" : plain;
}

function extractSlug(path: string): string | undefined {
  return path.split("/").at(-1)?.replace(".md", "");
}

export function getSelfNoteSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const path in selfNotesMds) {
    const slug = extractSlug(path);
    if (slug) slugs.add(slug);
  }
  return slugs;
}

export function getSelfNoteTitle(slug: string): string | undefined {
  for (const path in selfNotesMds) {
    if (extractSlug(path) === slug) {
      const md = selfNotesMds[path];
      const parsed = selfNoteMetadataSchema.safeParse(md.metadata);
      return parsed.success ? parsed.data.title : undefined;
    }
  }
  return undefined;
}

export async function getSelfNotes(): Promise<
  Result<{ notes: SelfNoteData[] }, "metadata-error" | "error">
> {
  const notes: SelfNoteData[] = [];

  for (const path in selfNotesMds) {
    const md = selfNotesMds[path];

    const parsed = selfNoteMetadataSchema.safeParse(md.metadata);

    if (!parsed.success) {
      return { success: false, error: "metadata-error" };
    }

    const slug = extractSlug(path);
    if (!slug) {
      return { success: false, error: "error" };
    }

    const raw = selfNotesRaws[path] ?? "";
    const excerpt = extractExcerpt(raw);
    const note = { ...parsed.data, slug, excerpt };
    notes.push(note);
  }

  return { success: true, data: { notes } };
}
