export async function postLike(slug: string): Promise<boolean> {
  if (import.meta.env.DEV) {
    return true;
  }

  const res = await fetch(`/api/notes/${slug}/like`, { method: "POST" });
  return res.ok;
}
