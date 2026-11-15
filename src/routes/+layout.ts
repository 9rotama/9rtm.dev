import { PUBLIC_BASE_URL } from "$app/env/public";
import type { LayoutLoad } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

export const load: LayoutLoad = ({ url }) => {
  return {
    canonicalUrl: new URL(url.pathname, PUBLIC_BASE_URL).toString(),
    ogType: /^\/notes\/[^/]+$/.test(url.pathname) ? "article" : "website",
    twitterCard: /^\/notes\/[^/]+$/.test(url.pathname)
      ? "summary_large_image"
      : "summary",
  };
};
