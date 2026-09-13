export type LinkPreviewOptions = {
  baseUrl?: string;
  cacheDir?: string;
  staticDir?: string;
  publicPath?: string;
  cacheTtlMs?: number;
  now?: () => number;
  fetch?: FetchLike;
  lookup?: Lookup;
  /** Disable DNS checks only for tests or a trusted, isolated fetch implementation. */
  resolveDns?: boolean;
};

export type LinkPreviewData = {
  title: string;
  description?: string;
  siteName: string;
  image?: string;
  icon?: string;
};

export type ParsedPageMetadata = {
  title?: string;
  description?: string;
  siteName?: string;
  imageUrls: string[];
  iconUrl?: string;
};

export type LookupAddress = { address: string; family: number };
export type Lookup = (
  hostname: string,
  options: { all: true; verbatim: true },
) => Promise<LookupAddress[]>;
export type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;
