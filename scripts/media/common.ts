import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

export const mediaConfig = {
  bucketName: "9rtm-dev-media",
  publicBaseUrl: "https://media.9rtm.dev",
  cacheControl: "public, max-age=31536000, immutable",
  allowedMediaTypes: {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webm": "video/webm",
    ".mp4": "video/mp4",
  },
} as const;

export type MediaExtension = keyof typeof mediaConfig.allowedMediaTypes;
export type MediaMimeType =
  (typeof mediaConfig.allowedMediaTypes)[MediaExtension];

export function getMediaMimeType(filePath: string): MediaMimeType {
  const extension = path.extname(filePath).toLowerCase() as MediaExtension;
  const mimeType = mediaConfig.allowedMediaTypes[extension];
  if (!mimeType) {
    throw new Error(
      `Unsupported media extension: ${extension || "(none)"}. Allowed extensions: ${Object.keys(mediaConfig.allowedMediaTypes).join(", ")}`,
    );
  }
  return mimeType;
}

export function normalizeMediaSlug(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    throw new Error("Slug must contain at least one ASCII letter or digit.");
  }
  return slug;
}

export function normalizeMediaStem(filePath: string): string {
  const stem = path
    .parse(path.basename(filePath))
    .name.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return stem || "media";
}

export async function sha256File(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

export function createMediaObjectKey(
  slugValue: string,
  filePath: string,
  sha256: string,
): string {
  const slug = normalizeMediaSlug(slugValue);
  if (!/^[a-f0-9]{64}$/i.test(sha256)) {
    throw new Error(
      "SHA-256 digest must contain exactly 64 hexadecimal characters.",
    );
  }
  const extension = path.extname(filePath).toLowerCase() as MediaExtension;
  getMediaMimeType(filePath);
  return `notes/${slug}/${normalizeMediaStem(filePath)}-${sha256.slice(0, 12).toLowerCase()}${extension}`;
}

export function createPublicMediaUrl(objectKey: string): string {
  const encodedKey = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${mediaConfig.publicBaseUrl}/${encodedKey}`;
}

export function createImageMarkdown(alt: string, url: string): string {
  const safeAlt = alt
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
  if (!safeAlt) {
    throw new Error("Image alt text is required.");
  }
  return `![${safeAlt}](${url})`;
}

export function createVideoHtml(
  url: string,
  width: number,
  height: number,
): string {
  for (const [name, value] of Object.entries({ width, height })) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new Error(`Video ${name} must be a positive integer.`);
    }
  }
  const safeUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return [
    "<video",
    `  src="${safeUrl}"`,
    `  width="${width}"`,
    `  height="${height}"`,
    "  autoplay",
    "  loop",
    "  muted",
    "  controls",
    "  playsinline",
    "></video>",
  ].join("\n");
}

export async function assertRegularFile(filePath: string): Promise<void> {
  let info;
  try {
    info = await lstat(filePath);
  } catch {
    throw new Error(`File does not exist: ${filePath}`);
  }
  if (!info.isFile()) {
    throw new Error(`Input must be a regular file: ${filePath}`);
  }
}

export type UploadObjectOptions = {
  filePath: string;
  objectKey: string;
  mimeType: MediaMimeType;
};

export type UploadObject = (options: UploadObjectOptions) => Promise<number>;

export const uploadObjectToR2: UploadObject = async ({
  filePath,
  objectKey,
  mimeType,
}) => {
  const args = [
    "exec",
    "wrangler",
    "r2",
    "object",
    "put",
    `${mediaConfig.bucketName}/${objectKey}`,
    "--file",
    filePath,
    "--content-type",
    mimeType,
    "--cache-control",
    mediaConfig.cacheControl,
    "--remote",
  ];
  return await new Promise((resolve, reject) => {
    const child = spawn("pnpm", args, { stdio: "inherit", shell: false });
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
};
