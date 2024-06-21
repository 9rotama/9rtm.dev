import { z } from "zod";

export const zennArticlesResSchema = z.object({
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
