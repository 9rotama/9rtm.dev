import { PUBLIC_BASE_URL } from "$env/static/public";
import type { LayoutLoad } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

export const load: LayoutLoad = ({ url }) => {
  return {
    canonicalUrl: new URL(url.pathname, PUBLIC_BASE_URL).toString(),
  };
};
