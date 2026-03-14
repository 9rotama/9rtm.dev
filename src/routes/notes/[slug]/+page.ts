import { error } from "@sveltejs/kit";
import { selfNoteMetadataSchema } from "../_lib/self";
import type { PageLoad } from "./$types";

function estimateReadingMinutes(text: string): number {
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

export const load: PageLoad = async ({ params }) => {
  const mds = import.meta.glob("../_content/notes/*.md", {
    eager: true,
  }) as Record<string, App.MdsvexFile>;

  const raws = import.meta.glob("../_content/notes/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;

  const md = mds[`../_content/notes/${params.slug}.md`];
  if (!md) {
    error(404, { message: "Note not found" });
  }

  const metadata = selfNoteMetadataSchema.safeParse(md.metadata);

  if (!metadata.success) {
    error(404, {
      message: "invalid note metadata",
    });
  }

  const raw = raws[`../_content/notes/${params.slug}.md`] ?? "";
  const readingMinutes = estimateReadingMinutes(raw);

  // Build sorted list of published notes for prev/next navigation
  const allNotes = Object.entries(mds)
    .map(([path, m]) => {
      const s = path.split("/").at(-1)?.replace(".md", "");
      const p = selfNoteMetadataSchema.safeParse(m.metadata);
      if (!s || !p.success || !p.data.published) return null;
      return { slug: s, title: p.data.title, publishedAt: p.data.published_at };
    })
    .filter((n) => n !== null)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const currentIndex = allNotes.findIndex((n) => n.slug === params.slug);
  const prevNote =
    currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;
  const nextNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;

  return {
    slug: params.slug,
    metadata: metadata.data,
    component: md.default,
    readingMinutes,
    prevNote: prevNote ? { slug: prevNote.slug, title: prevNote.title } : null,
    nextNote: nextNote ? { slug: nextNote.slug, title: nextNote.title } : null,
  };
};
