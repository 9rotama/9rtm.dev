import { selfNotesMds } from "$lib/content";
import matter from "gray-matter";
import { micromark } from "micromark";
import { frontmatter, frontmatterHtml } from "micromark-extension-frontmatter";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { selfNoteMetadataSchema } from "../_lib/self";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const mds = selfNotesMds;
  const md = mds[`/content/notes/${params.slug}.md`];
  const html = micromark(md as string, {
    extensions: [gfm(), frontmatter()],
    htmlExtensions: [gfmHtml(), frontmatterHtml()],
  });

  const metadata = selfNoteMetadataSchema.safeParse(matter(md).data);

  if (!metadata.success) {
    error(404, {
      message: "invalid note metadata",
    });
  }

  return { metadata: metadata.data, html };
};
