import { error } from "@sveltejs/kit";
import { getSelfNote } from "$lib/content";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const note = getSelfNote(params.slug);
  if (!note) {
    error(404, { message: "Note not found" });
  }
  return note;
};
