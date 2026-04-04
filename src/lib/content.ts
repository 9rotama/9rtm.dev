import type { Result } from "$lib/result";
import type { Component } from "svelte";
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

export function estimateReadingMinutes(text: string): number {
  const plainText = text
    .replace(/---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`[\]()>~_|\\-]/g, "")
    .trim();

  const japaneseChars = (
    plainText.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu,
    ) || []
  ).length;
  const englishWords = plainText
    .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = japaneseChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}

function extractSlug(path: string): string | undefined {
  return path.split("/").at(-1)?.replace(".md", "");
}

// Cached parsed notes (computed once on first access)
let cachedParsedNotes: Map<
  string,
  { metadata: SelfNoteMetadata; raw: string; component: Component }
> | null = null;

function getParsedNotes() {
  if (cachedParsedNotes) return cachedParsedNotes;

  cachedParsedNotes = new Map();
  for (const path in selfNotesMds) {
    const slug = extractSlug(path);
    if (!slug) continue;

    const md = selfNotesMds[path];
    const parsed = selfNoteMetadataSchema.safeParse(md.metadata);
    if (!parsed.success) continue;

    const raw = selfNotesRaws[path] ?? "";
    cachedParsedNotes.set(slug, {
      metadata: parsed.data,
      raw,
      component: md.default,
    });
  }
  return cachedParsedNotes;
}

export function getSelfNoteSlugs(): Set<string> {
  return new Set(getParsedNotes().keys());
}

export function getSelfNoteTitle(slug: string): string | undefined {
  return getParsedNotes().get(slug)?.metadata.title;
}

export function getSelfNotes(): Result<
  { notes: SelfNoteData[] },
  "metadata-error" | "error"
> {
  const notes: SelfNoteData[] = [];

  for (const [slug, note] of getParsedNotes()) {
    const excerpt = extractExcerpt(note.raw);
    notes.push({ ...note.metadata, slug, excerpt });
  }

  return { success: true, data: { notes } };
}

type SelfNoteDetail = {
  slug: string;
  metadata: SelfNoteMetadata;
  component: Component;
  readingMinutes: number;
  description: string;
  prevNote: { slug: string; title: string } | null;
  nextNote: { slug: string; title: string } | null;
};

export function getSelfNote(slug: string): SelfNoteDetail | null {
  const notes = getParsedNotes();
  const note = notes.get(slug);
  if (!note) return null;

  const readingMinutes = estimateReadingMinutes(note.raw);
  const description = extractExcerpt(note.raw, 120);

  // Build sorted list of published notes for prev/next navigation
  const allNotes = [...notes.entries()]
    .filter(([, n]) => n.metadata.published)
    .map(([s, n]) => ({
      slug: s,
      title: n.metadata.title,
      publishedAt: n.metadata.published_at,
    }))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const currentIndex = allNotes.findIndex((n) => n.slug === slug);
  const prevNote =
    currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;
  const nextNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;

  return {
    slug,
    metadata: note.metadata,
    component: note.component,
    readingMinutes,
    description,
    prevNote: prevNote ? { slug: prevNote.slug, title: prevNote.title } : null,
    nextNote: nextNote ? { slug: nextNote.slug, title: nextNote.title } : null,
  };
}
