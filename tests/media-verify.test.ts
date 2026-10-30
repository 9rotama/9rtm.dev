import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import {
  collectPublicMediaReferences,
  findPublicMediaReferences,
  verifyPublicMediaReferences,
} from "../scripts/media/verify.ts";

it("extracts only URLs on the configured public media domain", () => {
  expect(
    findPublicMediaReferences(
      "![x](https://media.9rtm.dev/notes/post/image.png) https://other.dev/video.mp4. https://media.9rtm.dev/notes/post/video.webm?download=1",
      "contents/notes/post.md",
    ),
  ).toEqual([
    {
      url: "https://media.9rtm.dev/notes/post/image.png",
      sourceRelativePath: "contents/notes/post.md",
    },
    {
      url: "https://media.9rtm.dev/notes/post/video.webm?download=1",
      sourceRelativePath: "contents/notes/post.md",
    },
  ]);
});

it("collects article and Storybook URLs and verifies each unique URL once", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "9rtm-media-verify-"));
  await mkdir(path.join(root, "contents", "notes"), { recursive: true });
  await mkdir(path.join(root, "src", "components"), { recursive: true });
  const url = "https://media.9rtm.dev/notes/post/image.png";
  await writeFile(
    path.join(root, "contents", "notes", "post.md"),
    `![Image](${url})`,
  );
  await writeFile(
    path.join(root, "src", "components", "sample.stories.ts"),
    `image: "${url}"`,
  );

  const references = await collectPublicMediaReferences(root);
  const requested: string[] = [];
  const results = await verifyPublicMediaReferences(references, {
    fetch: async (input, init) => {
      requested.push(`${String(input)} ${init?.method}`);
      return new Response(null, { status: 200 });
    },
  });

  expect(references).toHaveLength(2);
  expect(requested).toEqual([`${url} HEAD`]);
  expect(results).toEqual([
    {
      url,
      sourceRelativePaths: [
        "contents/notes/post.md",
        "src/components/sample.stories.ts",
      ],
      ok: true,
      status: 200,
    },
  ]);
});

it("reports HTTP failures and request errors", async () => {
  const refs = [
    {
      url: "https://media.9rtm.dev/notes/post/missing.png",
      sourceRelativePath: "post.md",
    },
    {
      url: "https://media.9rtm.dev/notes/post/timeout.png",
      sourceRelativePath: "post.md",
    },
  ];
  const results = await verifyPublicMediaReferences(refs, {
    fetch: async (input) => {
      if (String(input).endsWith("missing.png")) {
        return new Response(null, { status: 404 });
      }
      throw new Error("connection failed");
    },
  });

  expect(results).toMatchObject([
    { ok: false, status: 404, error: "HTTP 404" },
    { ok: false, error: "connection failed" },
  ]);
});
