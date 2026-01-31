export async function postLike(slug: string): Promise<boolean> {
  const res = await fetch(`/api/notes/${slug}/like`, { method: "POST" });
  return res.ok;
}
