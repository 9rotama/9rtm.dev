import { error } from "@sveltejs/kit";
import { selfNoteMetadataSchema } from "../_lib/self";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const mds = import.meta.glob("../_content/notes/*.md", {
    eager: true,
  }) as Record<string, App.MdsvexFile>;

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

  return {
    slug: params.slug,
    metadata: metadata.data,
    component: md.default,
  };
};
