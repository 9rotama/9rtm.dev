import path from "node:path";

export const LINK_PREVIEW_LIMITS = {
  cacheTtlMs: 24 * 60 * 60 * 1000,
  concurrency: 4,
  htmlBytes: 2 * 1024 * 1024,
  imageBytes: 10 * 1024 * 1024,
  redirects: 5,
  timeoutMs: 5_000,
} as const;

export const DEFAULT_LINK_PREVIEW_BASE_URL = "https://9rtm.dev";
export const DEFAULT_LINK_PREVIEW_CACHE_DIR = path.resolve(
  ".svelte-kit/cache/link-previews",
);
export const DEFAULT_LINK_PREVIEW_STATIC_DIR = path.resolve(
  "static/link-previews",
);
export const DEFAULT_LINK_PREVIEW_PUBLIC_PATH = "/link-previews";
