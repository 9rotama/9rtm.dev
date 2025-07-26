import { selfNotesMds } from "$lib/content";
import { error } from "@sveltejs/kit";
import matter from "gray-matter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { selfNoteMetadataSchema } from "../_lib/self";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const mds = selfNotesMds;
  const md = mds[`/content/notes/${params.slug}.md`];
  const html = await remark()
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "prepend",
      properties: {
        className: ["heading-link"],
        ariaLabel: "link to section",
        title: "link to section",
      },
      content: {
        type: "text",
        value: "#",
      },
    })
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
