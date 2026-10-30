import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import {
  createImageMarkdown,
  createMediaObjectKey,
  createPublicMediaUrl,
  createVideoHtml,
  getMediaMimeType,
  mediaConfig,
  normalizeMediaSlug,
} from "../scripts/media/common.ts";
import {
  parseUploadArguments,
  runMediaUpload,
} from "../scripts/media/upload.ts";

it("maps supported media extensions to browser MIME types", () => {
  expect(getMediaMimeType("image.PNG")).toBe("image/png");
  expect(getMediaMimeType("photo.jpeg")).toBe("image/jpeg");
  expect(getMediaMimeType("animation.webm")).toBe("video/webm");
  expect(mediaConfig.allowedMediaTypes[".svg"]).toBe("image/svg+xml");
  expect(() => getMediaMimeType("archive.psd")).toThrow(
    "Unsupported media extension",
  );
});

it("normalizes slugs and produces content-addressed R2 keys", () => {
  expect(normalizeMediaSlug("  Rive & Inkscape  ")).toBe("rive-inkscape");
  expect(() => normalizeMediaSlug("日本語")).toThrow(
    "at least one ASCII letter or digit",
  );
  expect(
    createMediaObjectKey(
      "like button",
      "/tmp/Like Button.PNG",
      "abcdef1234567890".padEnd(64, "0"),
    ),
  ).toBe("notes/like-button/like-button-abcdef123456.png");
  expect(() => createMediaObjectKey("article", "file.png", "invalid")).toThrow(
    "64 hexadecimal characters",
  );
});

it("creates Markdown and video snippets for the public URL", () => {
  const url = createPublicMediaUrl("notes/like-button/demo-abcdef123456.webm");
  expect(url).toBe(
    "https://media.9rtm.dev/notes/like-button/demo-abcdef123456.webm",
  );
  expect(createImageMarkdown("図 [1]", url)).toBe(`![図 \\[1\\]](${url})`);
  expect(createVideoHtml(url, 1020, 720)).toContain(
    `src="${url}"\n  width="1020"\n  height="720"`,
  );
  expect(createVideoHtml(url, 1020, 720)).toContain("playsinline");
  expect(() => createVideoHtml(url, 0, 720)).toThrow("positive integer");
});

it("rejects missing, extra, and malformed upload arguments", () => {
  expect(() => parseUploadArguments(["image.png"])).toThrow(
    "--slug is required",
  );
  expect(() =>
    parseUploadArguments(["--slug", "article", "--width", "wide", "image.png"]),
  ).toThrow("--width must be a positive integer");
  expect(() =>
    parseUploadArguments(["--slug", "article", "image.png", "extra.png"]),
  ).toThrow("exactly one media file");
  expect(() =>
    parseUploadArguments(["--slug", "article", "--unknown", "image.png"]),
  ).toThrow("Unknown option");
});

it("runs upload dry-runs without calling Wrangler and prints a reusable snippet", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "9rtm-media-upload-"));
  const filePath = path.join(cwd, "my image.png");
  await writeFile(filePath, "image bytes");
  let uploadCalls = 0;
  const output: string[] = [];
  const errors: string[] = [];

  const exitCode = await runMediaUpload(
    ["--slug", "my post", "--alt", "説明", "--dry-run", filePath],
    {
      cwd,
      uploadObject: async () => {
        uploadCalls += 1;
        return 0;
      },
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
    },
  );

  expect(exitCode).toBe(0);
  expect(uploadCalls).toBe(0);
  expect(errors).toEqual([]);
  expect(output.join("\n")).toContain(
    "![説明](https://media.9rtm.dev/notes/my-post/my-image-",
  );
  expect(output.at(-1)).toBe("Dry run: R2 was not changed.");
});

it("does not print a successful snippet when Wrangler fails", async () => {
  const cwd = await mkdtemp(
    path.join(os.tmpdir(), "9rtm-media-upload-failure-"),
  );
  const filePath = path.join(cwd, "image.png");
  await writeFile(filePath, "image bytes");
  const output: string[] = [];
  const errors: string[] = [];

  const exitCode = await runMediaUpload(
    ["--slug", "article", "--alt", "image", filePath],
    {
      cwd,
      uploadObject: async () => 17,
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
    },
  );

  expect(exitCode).toBe(17);
  expect(output).toEqual([]);
  expect(errors).toEqual([
    "Wrangler exited with code 17; no snippet was generated.",
  ]);
});

it("requires image alt text and video dimensions", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "9rtm-media-upload-args-"));
  const imagePath = path.join(cwd, "image.png");
  const videoPath = path.join(cwd, "capture.webm");
  await writeFile(imagePath, "image bytes");
  await writeFile(videoPath, "video bytes");

  const run = async (args: string[]) => {
    const errors: string[] = [];
    const exitCode = await runMediaUpload(args, {
      cwd,
      uploadObject: async () => 0,
      log: () => undefined,
      error: (message) => errors.push(message),
    });
    return { exitCode, errors };
  };

  expect(await run(["--slug", "article", imagePath])).toMatchObject({
    exitCode: 1,
    errors: ["Image files require a non-empty --alt value."],
  });
  expect(await run(["--slug", "article", videoPath])).toMatchObject({
    exitCode: 1,
    errors: ["Video files require both --width and --height."],
  });
});
