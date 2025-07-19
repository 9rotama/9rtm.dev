import { z } from "zod";

const zennArticlesResSchema = z.object({
  articles: z.array(
    z.object({
      id: z.number(),
      emoji: z.string(),
      title: z.string(),
      path: z.string(),
      published_at: z.string(),
    }),
  ),
});

const url = "https://zenn.dev/api/articles?username=9rotama&order=latest";

export async function getZennArticles() {
  const res = await fetch(url);
  const json = await res.json();
  return zennArticlesResSchema.parse(json);
}
