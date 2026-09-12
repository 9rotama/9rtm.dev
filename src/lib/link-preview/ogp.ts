import { lookup as defaultLookup } from "node:dns/promises";
import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { isIP } from "node:net";
import { parse } from "parse5";
import sharp from "sharp";
import z from "zod";

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

type LookupAddress = { address: string; family: number };
type Lookup = (
  hostname: string,
  options: { all: true; verbatim: true },
) => Promise<LookupAddress[]>;
type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

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

const cacheRecordSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  siteName: z.string(),
  image: z.string().optional(),
  icon: z.string().optional(),
  fetchedAt: z.number().finite(),
});

type CacheRecord = z.infer<typeof cacheRecordSchema>;

type DownloadResult = {
  bytes: Buffer;
  contentType: string;
  url: URL;
};

type FetchKind = "html" | "image";

const pendingRequests = new Map<string, Promise<LinkPreviewData>>();

let activeNetworkRequests = 0;
const networkQueue: Array<() => void> = [];

function runWithNetworkLimit<T>(task: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = () => {
      activeNetworkRequests += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          activeNetworkRequests -= 1;
          networkQueue.shift()?.();
        });
    };

    if (activeNetworkRequests < LINK_PREVIEW_LIMITS.concurrency) {
      run();
    } else {
      networkQueue.push(run);
    }
  });
}

function normaliseText(value: string | undefined): string | undefined {
  const text = value?.replace(/\s+/g, " ").trim();
  return text || undefined;
}

function firstNonEmpty(
  ...values: Array<string | undefined>
): string | undefined {
  return values.map(normaliseText).find(Boolean);
}

function stripIpv6Brackets(hostname: string): string {
  return hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

function ipv4ToNumber(address: string): number | null {
  const octets = address.split(".");
  if (octets.length !== 4 || octets.some((octet) => !/^\d+$/.test(octet))) {
    return null;
  }

  const values = octets.map(Number);
  if (values.some((value) => value < 0 || value > 255)) return null;
  return (
    values[0] * 0x1000000 + values[1] * 0x10000 + values[2] * 0x100 + values[3]
  );
}

function isPrivateIpv4(address: string): boolean {
  const number = ipv4ToNumber(address);
  if (number === null) return true;

  const first = number >>> 24;
  const second = (number >>> 16) & 0xff;
  const third = (number >>> 8) & 0xff;

  return (
    first === 0 ||
    first === 10 ||
    (first === 100 && second >= 64 && second <= 127) ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function expandIpv6(address: string): number[] | null {
  const withoutZone = address.split("%")[0];
  const halves = withoutZone.split("::");
  if (halves.length > 2) return null;

  const parseHalf = (half: string): number[] | null => {
    if (!half) return [];
    const parts = half.split(":");
    const result: number[] = [];
    for (const part of parts) {
      if (part.includes(".")) {
        const ipv4 = ipv4ToNumber(part);
        if (ipv4 === null) return null;
        result.push((ipv4 >>> 16) & 0xffff, ipv4 & 0xffff);
      } else if (/^[0-9a-f]{1,4}$/i.test(part)) {
        result.push(Number.parseInt(part, 16));
      } else {
        return null;
      }
    }
    return result;
  };

  const left = parseHalf(halves[0]);
  const right = parseHalf(halves[1] ?? "");
  if (!left || !right) return null;

  const missing = 8 - left.length - right.length;
  if (halves.length === 1 && missing !== 0) return null;
  if (halves.length === 2 && missing < 1) return null;
  return [...left, ...Array.from({ length: missing }, () => 0), ...right];
}

function isPrivateIpv6(address: string): boolean {
  const groups = expandIpv6(address);
  if (!groups || groups.length !== 8) return true;

  const first = groups[0];
  const isUnspecified = groups.every((group) => group === 0);
  const isLoopback =
    groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1;
  const isUniqueLocal = (first & 0xfe00) === 0xfc00;
  const isLinkLocal = (first & 0xffc0) === 0xfe80;
  const isMulticast = (first & 0xff00) === 0xff00;
  const isDocumentation = first === 0x2001 && groups[1] === 0x0db8;
  const isIpv4Mapped = groups
    .slice(0, 6)
    .every((group, index) => (index < 5 ? group === 0 : group === 0xffff));

  if (isIpv4Mapped) {
    return isPrivateIpv4(
      `${groups[6] >>> 8}.${groups[6] & 0xff}.${groups[7] >>> 8}.${groups[7] & 0xff}`,
    );
  }

  return (
    isUnspecified ||
    isLoopback ||
    isUniqueLocal ||
    isLinkLocal ||
    isMulticast ||
    isDocumentation
  );
}

export function isPrivateAddress(address: string): boolean {
  const normalized = stripIpv6Brackets(address).toLowerCase();
  const family = isIP(normalized);
  if (family === 4) return isPrivateIpv4(normalized);
  if (family === 6) return isPrivateIpv6(normalized);
  return true;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "localhost.localdomain" ||
    normalized === "ip6-localhost" ||
    normalized === "ip6-loopback" ||
    normalized.endsWith(".local")
  );
}

function parseHttpUrl(value: string | URL, baseUrl?: string): URL | null {
  let url: URL;
  try {
    url = value instanceof URL ? new URL(value.href) : new URL(value, baseUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }
  if (url.username || url.password) {
    return null;
  }
  if (!url.hostname || url.href.length > 4096) {
    return null;
  }

  const hostname = stripIpv6Brackets(url.hostname);
  if (isBlockedHostname(hostname)) {
    return null;
  }
  if (isIP(hostname) !== 0 && isPrivateAddress(hostname)) {
    return null;
  }

  return url;
}

async function assertSafeUrl(
  url: URL,
  options: LinkPreviewOptions,
): Promise<void> {
  if (!parseHttpUrl(url)) throw new Error("invalid-url");
  if (
    options.resolveDns === false ||
    isIP(stripIpv6Brackets(url.hostname)) !== 0
  ) {
    return;
  }

  const lookup = options.lookup ?? (defaultLookup as unknown as Lookup);
  let addresses: LookupAddress[];
  try {
    addresses = await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("dns-lookup-failed");
  }
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new Error("private-address");
  }
}

function getBaseUrl(options: LinkPreviewOptions): URL {
  return (
    resolveHttpUrl(options.baseUrl ?? DEFAULT_LINK_PREVIEW_BASE_URL) ??
    new URL(DEFAULT_LINK_PREVIEW_BASE_URL)
  );
}

export function resolveHttpUrl(
  href: string,
  baseUrl = DEFAULT_LINK_PREVIEW_BASE_URL,
): URL | null {
  const trimmedHref = href.trim();
  if (!trimmedHref || trimmedHref.startsWith("#")) return null;
  return parseHttpUrl(trimmedHref, baseUrl);
}

function getAttr(node: ParseNode, name: string): string | undefined {
  return node.attrs?.find(
    (attr) => attr.name.toLowerCase() === name.toLowerCase(),
  )?.value;
}

type ParseNode = {
  nodeName?: string;
  value?: string;
  attrs?: Array<{ name: string; value: string }>;
  childNodes?: ParseNode[];
};

function getText(node: ParseNode): string {
  return (node.childNodes ?? [])
    .map((child) => {
      if (child.nodeName === "#text") return child.value ?? "";
      return getText(child);
    })
    .join("");
}

function findNode(node: ParseNode, nodeName: string): ParseNode | undefined {
  if (node.nodeName === nodeName) return node;
  for (const child of node.childNodes ?? []) {
    const found = findNode(child, nodeName);
    if (found) return found;
  }
  return undefined;
}

export function parseOpenGraphHtml(html: string): ParsedPageMetadata {
  let document: ParseNode;
  try {
    document = parse(html) as unknown as ParseNode;
  } catch {
    return { imageUrls: [] };
  }

  const head = findNode(document, "head");
  if (!head) return { imageUrls: [] };

  let htmlTitle: string | undefined;
  const metaValues = new Map<string, string[]>();
  let iconUrl: string | undefined;

  for (const node of head.childNodes ?? []) {
    if (node.nodeName === "title") {
      htmlTitle = firstNonEmpty(getText(node));
      continue;
    }
    if (node.nodeName === "meta") {
      const key = (
        getAttr(node, "property") ?? getAttr(node, "name")
      )?.toLowerCase();
      const content = normaliseText(getAttr(node, "content"));
      if (key && content) {
        const values = metaValues.get(key) ?? [];
        values.push(content);
        metaValues.set(key, values);
      }
      continue;
    }
    if (node.nodeName === "link") {
      const rel = (getAttr(node, "rel") ?? "").toLowerCase().split(/\s+/);
      if (!iconUrl && rel.includes("icon")) {
        iconUrl = normaliseText(getAttr(node, "href"));
      }
    }
  }

  const firstMeta = (...keys: string[]) =>
    firstNonEmpty(...keys.flatMap((key) => metaValues.get(key) ?? []));

  return {
    title: firstMeta("og:title", "twitter:title") ?? htmlTitle,
    description: firstMeta(
      "og:description",
      "twitter:description",
      "description",
    ),
    siteName: firstMeta("og:site_name"),
    imageUrls: [
      ...new Set(
        [
          ...(metaValues.get("og:image:secure_url") ?? []),
          ...(metaValues.get("og:image") ?? []),
          ...(metaValues.get("twitter:image") ?? []),
        ].filter(Boolean),
      ),
    ],
    iconUrl,
  };
}

type ReaderSetter = (
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
) => void;

async function readResponseBody(
  response: Response,
  maxBytes: number,
  setReader?: ReaderSetter,
): Promise<Buffer> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("response-too-large");
  }

  if (!response.body) {
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) throw new Error("response-too-large");
    return bytes;
  }

  const reader = response.body.getReader();
  setReader?.(reader);
  try {
    const chunks: Buffer[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("response-too-large");
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks, total);
  } finally {
    setReader?.(undefined);
  }
}

async function fetchResponse(
  url: URL,
  kind: FetchKind,
  options: LinkPreviewOptions,
  signal: AbortSignal,
): Promise<Response> {
  const fetchImpl = options.fetch ?? fetch;
  return fetchImpl(url, {
    redirect: "manual",
    signal,
    headers: {
      accept:
        kind === "html"
          ? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1"
          : "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "user-agent": "9rtm.dev-link-preview/1.0",
    },
  });
}

async function download(
  startUrl: URL,
  kind: FetchKind,
  options: LinkPreviewOptions,
): Promise<DownloadResult> {
  const controller = new AbortController();
  let activeReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const operation = async (): Promise<DownloadResult> => {
    let url = startUrl;
    for (
      let redirect = 0;
      redirect <= LINK_PREVIEW_LIMITS.redirects;
      redirect += 1
    ) {
      await assertSafeUrl(url, options);
      const response = await fetchResponse(
        url,
        kind,
        options,
        controller.signal,
      );
      if (response.status >= 300 && response.status < 400) {
        void response.body?.cancel();
        const location = response.headers.get("location");
        if (!location || redirect === LINK_PREVIEW_LIMITS.redirects) {
          throw new Error("too-many-redirects");
        }
        const next = resolveHttpUrl(location, url.href);
        if (!next) throw new Error("invalid-url");
        url = next;
        continue;
      }
      if (!response.ok) throw new Error(`http-${response.status}`);

      const maxBytes =
        kind === "html"
          ? LINK_PREVIEW_LIMITS.htmlBytes
          : LINK_PREVIEW_LIMITS.imageBytes;
      const bytes = await readResponseBody(response, maxBytes, (reader) => {
        activeReader = reader;
        if (reader && controller.signal.aborted) void reader.cancel();
      });
      return {
        bytes,
        contentType: response.headers.get("content-type")?.toLowerCase() ?? "",
        url,
      };
    }
    throw new Error("too-many-redirects");
  };

  const timeoutPromise = new Promise<DownloadResult>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      void activeReader?.cancel();
      reject(new Error("request-timeout"));
    }, LINK_PREVIEW_LIMITS.timeoutMs);
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 8);
}

function cacheFileStem(url: string): string {
  // A short deterministic name keeps generated HTML readable while the URL
  // itself remains in the cache key. Collisions are checked by the cache URL.
  return `${hashUrl(url)}-${Buffer.from(url).toString("base64url").slice(0, 16)}`;
}

function imageFileName(url: string): string {
  return `${cacheFileStem(url)}.webp`;
}

function publicImagePath(fileName: string, publicPath: string): string {
  return `${publicPath.replace(/\/+$/, "")}/${fileName}`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeAtomically(
  filePath: string,
  data: string | Buffer,
): Promise<void> {
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, data);
    await rename(temporaryPath, filePath);
  } catch {
    // A cache is an optimisation. A read-only filesystem must not fail a build.
  }
}

async function readCache(cachePath: string): Promise<CacheRecord | null> {
  try {
    const result = cacheRecordSchema.safeParse(
      JSON.parse(await readFile(cachePath, "utf8")),
    );
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function publicData(record: CacheRecord): LinkPreviewData {
  return {
    title: record.title,
    description: record.description,
    siteName: record.siteName,
    image: record.image,
    icon: record.icon,
  };
}

async function materializeImage(
  imagePath: string,
  staticDir: string | undefined,
  fileName: string,
): Promise<void> {
  if (!staticDir) return;
  try {
    await mkdir(staticDir, { recursive: true });
    await copyFile(imagePath, path.join(staticDir, fileName));
  } catch {
    // The generated asset is best effort; metadata can still render without it.
  }
}

function fallbackData(url: URL, fallbackTitle?: string): LinkPreviewData {
  return {
    title: firstNonEmpty(fallbackTitle, url.hostname) ?? url.hostname,
    siteName: url.hostname,
    icon: new URL("/favicon.ico", url).toString(),
  };
}

function cacheKey(url: URL, options: LinkPreviewOptions): string {
  return `${path.resolve(options.cacheDir ?? DEFAULT_LINK_PREVIEW_CACHE_DIR)}:${url.href}`;
}

async function fetchAndCache(
  url: URL,
  fallbackTitle: string | undefined,
  options: LinkPreviewOptions,
): Promise<LinkPreviewData> {
  const cacheDir = path.resolve(
    options.cacheDir ?? DEFAULT_LINK_PREVIEW_CACHE_DIR,
  );
  const staticDir = options.staticDir ?? DEFAULT_LINK_PREVIEW_STATIC_DIR;
  const publicPath = options.publicPath ?? DEFAULT_LINK_PREVIEW_PUBLIC_PATH;
  const fileStem = cacheFileStem(url.href);
  const cachePath = path.join(cacheDir, `${fileStem}.json`);
  const cacheImagePath = path.join(cacheDir, `${fileStem}.webp`);
  const now = options.now?.() ?? Date.now();
  const cached = await readCache(cachePath);
  if (
    cached &&
    now - cached.fetchedAt <
      (options.cacheTtlMs ?? LINK_PREVIEW_LIMITS.cacheTtlMs) &&
    (!cached.image || (await fileExists(cacheImagePath)))
  ) {
    if (cached.image) {
      await materializeImage(
        cacheImagePath,
        staticDir,
        path.basename(cached.image),
      );
    }
    return publicData(cached);
  }

  let data = fallbackData(url, fallbackTitle);
  try {
    const document = await download(url, "html", options);
    const isHtml =
      !document.contentType ||
      document.contentType.includes("text/html") ||
      document.contentType.includes("application/xhtml+xml");
    const metadata = isHtml
      ? parseOpenGraphHtml(document.bytes.toString("utf8"))
      : { imageUrls: [] };
    const pageUrl = document.url;
    const icon = metadata.iconUrl
      ? resolveHttpUrl(metadata.iconUrl, pageUrl.href)
      : undefined;

    data = {
      title:
        firstNonEmpty(metadata.title, fallbackTitle, pageUrl.hostname) ??
        pageUrl.hostname,
      description: metadata.description,
      siteName:
        firstNonEmpty(metadata.siteName, pageUrl.hostname) ?? pageUrl.hostname,
      icon: icon?.toString() ?? new URL("/favicon.ico", pageUrl).toString(),
    };

    for (const imageUrl of metadata.imageUrls) {
      const candidate = resolveHttpUrl(imageUrl, pageUrl.href);
      if (!candidate) continue;
      try {
        const image = await download(candidate, "image", options);
        if (image.contentType && !image.contentType.startsWith("image/"))
          continue;
        const webp = await sharp(image.bytes, { limitInputPixels: 25_000_000 })
          .webp({ quality: 82 })
          .toBuffer();
        const fileName = imageFileName(candidate.href);
        await mkdir(cacheDir, { recursive: true });
        await writeAtomically(cacheImagePath, webp);
        await materializeImage(cacheImagePath, staticDir, fileName);
        data.image = publicImagePath(fileName, publicPath);
        break;
      } catch {
        // An unavailable or unsupported image must not hide usable text metadata.
      }
    }
  } catch {
    // Network, parsing, and validation failures intentionally use fallback data.
  }

  const record: CacheRecord = {
    ...data,
    fetchedAt: now,
  };
  try {
    await mkdir(cacheDir, { recursive: true });
    await writeAtomically(cachePath, JSON.stringify(record));
  } catch {
    // See writeAtomically: cache failures are non-fatal.
  }
  return data;
}

async function getLinkPreviewInternal(
  url: URL,
  fallbackTitle: string | undefined,
  options: LinkPreviewOptions,
): Promise<LinkPreviewData> {
  const key = cacheKey(url, options);
  const existing = pendingRequests.get(key);
  if (existing) return existing;

  const request = runWithNetworkLimit(() =>
    fetchAndCache(url, fallbackTitle, options),
  );
  pendingRequests.set(key, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(key);
  }
}

export async function getLinkPreview(
  href: string,
  options: LinkPreviewOptions = {},
  fallbackTitle?: string,
): Promise<LinkPreviewData> {
  const baseUrl = getBaseUrl(options);
  const url = resolveHttpUrl(href, baseUrl.href);
  if (!url) {
    return fallbackData(baseUrl, fallbackTitle);
  }
  return getLinkPreviewInternal(url, fallbackTitle, options);
}

export async function prefetchLinkPreviews(
  hrefs: Iterable<string>,
  options: LinkPreviewOptions = {},
): Promise<Map<string, LinkPreviewData>> {
  const uniqueHrefs = [...new Set(hrefs)];
  const entries = await Promise.all(
    uniqueHrefs.map(
      async (href) => [href, await getLinkPreview(href, options)] as const,
    ),
  );
  return new Map(entries);
}
