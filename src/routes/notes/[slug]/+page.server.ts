import { selfNotesMds } from "$lib/content";
import matter from "gray-matter";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { selfNoteMetadataSchema } from "../_lib/self";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const mds = selfNotesMds;
  const md = mds[`/content/notes/${params.slug}.md`];
  const html = await remark()
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md as string);

  const metadata = selfNoteMetadataSchema.safeParse(matter(md).data);

  if (!metadata.success) {
    error(404, {
      message: "invalid note metadata",
    });
  }

  return { metadata: metadata.data, html: String(html) };
};
