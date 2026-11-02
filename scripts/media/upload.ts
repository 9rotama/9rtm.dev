import path from "node:path";
import {
  assertRegularFile,
  createImageMarkdown,
  createMediaObjectKey,
  createPublicMediaUrl,
  createVideoHtml,
  getMediaMimeType,
  normalizeMediaSlug,
  sha256File,
  uploadObjectToR2,
  type UploadObject,
} from "./common.ts";

export type UploadArguments = {
  slug: string;
  file: string;
  alt?: string;
  width?: number;
  height?: number;
  dryRun: boolean;
};

function parseDimension(value: string, name: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  const dimension = Number(value);
  if (!Number.isSafeInteger(dimension) || dimension <= 0) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  return dimension;
}

export function parseUploadArguments(argv: string[]): UploadArguments {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  let slug: string | undefined;
  let alt: string | undefined;
  let width: number | undefined;
  let height: number | undefined;
  let dryRun = false;
  const files: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (["--slug", "--alt", "--width", "--height"].includes(argument)) {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value.`);
      }
      index += 1;
      if (argument === "--slug") slug = value;
      if (argument === "--alt") alt = value;
      if (argument === "--width") width = parseDimension(value, "width");
      if (argument === "--height") height = parseDimension(value, "height");
      continue;
    }
    if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    files.push(argument);
  }

  if (!slug?.trim()) {
    throw new Error("--slug is required.");
  }
  if (files.length !== 1) {
    throw new Error("Provide exactly one media file.");
  }

  return {
    slug: normalizeMediaSlug(slug),
    file: files[0],
    ...(alt === undefined ? {} : { alt }),
    ...(width === undefined ? {} : { width }),
    ...(height === undefined ? {} : { height }),
    dryRun,
  };
}

export type UploadCliDependencies = {
  cwd?: string;
  uploadObject?: UploadObject;
  log?: (message: string) => void;
  error?: (message: string) => void;
};

export async function runMediaUpload(
  argv: string[],
  dependencies: UploadCliDependencies = {},
): Promise<number> {
  const cwd = dependencies.cwd ?? process.cwd();
  const log = dependencies.log ?? console.log;
  const error = dependencies.error ?? console.error;

  try {
    const options = parseUploadArguments(argv);
    const filePath = path.resolve(cwd, options.file);
    await assertRegularFile(filePath);
    const mimeType = getMediaMimeType(filePath);
    const isVideo = mimeType.startsWith("video/");

    if (
      isVideo &&
      (options.width === undefined || options.height === undefined)
    ) {
      throw new Error("Video files require both --width and --height.");
    }
    if (!isVideo && !options.alt?.trim()) {
      throw new Error("Image files require a non-empty --alt value.");
    }
    if (
      !isVideo &&
      (options.width !== undefined || options.height !== undefined)
    ) {
      throw new Error("--width and --height are only used with video files.");
    }

    const digest = await sha256File(filePath);
    const objectKey = createMediaObjectKey(options.slug, filePath, digest);
    const url = createPublicMediaUrl(objectKey);
    const snippet = isVideo
      ? createVideoHtml(url, options.width!, options.height!)
      : createImageMarkdown(options.alt!, url);

    if (!options.dryRun) {
      const uploadObject = dependencies.uploadObject ?? uploadObjectToR2;
      const exitCode = await uploadObject({ filePath, objectKey, mimeType });
      if (exitCode !== 0) {
        error(
          `Wrangler exited with code ${exitCode}; no snippet was generated.`,
        );
        return exitCode;
      }
    }

    log(`URL: ${url}`);
    log(`Snippet:\n${snippet}`);
    if (options.dryRun) {
      log("Dry run: R2 was not changed.");
    }
    return 0;
  } catch (cause) {
    error(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
}
