import { z } from "zod";

const STORAGE_KEY = "liked_notes";
const likedNotesSchema = z.record(z.string(), z.boolean());

export function getLikedNotes(): Record<string, boolean> {
  if (typeof localStorage === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored);
    const result = likedNotesSchema.safeParse(parsed);
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

export function setLiked(slug: string, liked: boolean) {
  const notes = getLikedNotes();
  if (liked) {
    notes[slug] = true;
  } else {
    delete notes[slug];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
