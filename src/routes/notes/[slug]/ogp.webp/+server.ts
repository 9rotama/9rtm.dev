import { getSelfNote } from "$lib/content";
import { error, type RequestHandler } from "@sveltejs/kit";
import { generateOgpImage } from "../../../../ogp/generate-ogp";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
  if (!params.slug) {
    error(404, { message: "Note not found" });
  }
  const note = getSelfNote(params.slug);
  if (!note) {
    error(404, { message: "Note not found" });
  }

  const webp = await generateOgpImage({
    type: "note",
    title: note.metadata.title,
    emoji: note.metadata.emoji,
    publishedAt: note.metadata.published_at,
    tags: note.metadata.tags,
    isRandom: true,
  });

  return new Response(new Uint8Array(webp), {
    headers: {
      "Content-Type": "image/webp",
    },
  });
};
