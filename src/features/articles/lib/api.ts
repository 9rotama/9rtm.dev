import { zennArticlesResSchema } from "./schema";

export const zennUrl =
  "https://zenn.dev/api/articles?username=9rotama&order=latest";

export async function getZennArticles() {
  const res = await fetch(zennUrl);
  const json = await res.json();
  return zennArticlesResSchema.parse(json);
}
