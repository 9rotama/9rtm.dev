import { zennUrl } from "./endpoint";
import { zennArticlesResSchema } from "./schema";

export async function getZennArticles() {
  const res = await fetch(zennUrl);
  const json = await res.json();
  return zennArticlesResSchema.parse(json);
}
