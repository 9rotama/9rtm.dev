export const selfNotesMds = import.meta.glob("/content/notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
