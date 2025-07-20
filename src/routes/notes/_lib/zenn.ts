import type { Result } from "$lib/result";
import { z } from "zod";

const zennArticlesSchema = z.object({
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

type ZennArticles = z.infer<typeof zennArticlesSchema>;

const url = "https://zenn.dev/api/articles?username=9rotama&order=latest";

export async function getZennArticles(): Promise<
  Result<ZennArticles, "res-not-ok" | "json-error" | "parse-error">
> {
  const res = await fetch(url);
  if (!res.ok) {
    return {
      success: false,
      error: "res-not-ok",
    };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return {
      success: false,
      error: "json-error",
    };
  }

  const parsed = zennArticlesSchema.safeParse(json);
  if (!parsed.success) {
    return {
      success: false,
      error: "parse-error",
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
