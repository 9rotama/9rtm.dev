import { type RequestHandler } from "@sveltejs/kit";
import { generateOgpImage } from "../../../../ogp/generate-ogp";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const webp = await generateOgpImage({ isRandom: true });

  return new Response(new Uint8Array(webp), {
    headers: {
      "Content-Type": "image/webp",
    },
  });
};
