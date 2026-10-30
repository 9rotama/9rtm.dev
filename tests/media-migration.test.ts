import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import {
  applyMigrationPlan,
  buildMigrationPlan,
  findPostMediaReferences,
} from "../scripts/media/migration.ts";

async function makeProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "9rtm-media-migration-"));
  await mkdir(path.join(root, "contents", "notes"), { recursive: true });
  await mkdir(path.join(root, "src", "components"), { recursive: true });
  await mkdir(path.join(root, "static", "post-media"), { recursive: true });
  return root;
}

it("extracts local media URLs and keeps query strings for replacement", () => {
  expect(
    findPostMediaReferences(
      '![image](/post-media/photo%20one.webp?width=800) <video src="/post-media/demo.webm">',
    ),
  ).toEqual([
    {
      original: "/post-media/photo%20one.webp?width=800",
      filename: "photo%20one.webp",
      suffix: "?width=800",
    },
    {
      original: "/post-media/demo.webm",
      filename: "demo.webm",
      suffix: "",
    },
  ]);
});

it("plans article and Storybook references, and reports orphan and missing files", async () => {
  const root = await makeProject();
  await writeFile(
    path.join(root, "contents", "notes", "like-button.md"),
    [
      "![Bloom](/post-media/bloom.png?display=wide)",
      "![Missing](/post-media/missing.png)",
    ].join("\n"),
  );
  await writeFile(
    path.join(root, "src", "components", "link-preview.stories.ts"),
    'image: "/post-media/bloom.png",',
  );
  await writeFile(
    path.join(root, "static", "post-media", "bloom.png"),
    "image bytes",
  );
  await writeFile(
    path.join(root, "static", "post-media", "unused.png"),
    "unused image",
  );

  const plan = await buildMigrationPlan(root);

  expect(plan.references).toHaveLength(2);
  expect(plan.objects).toHaveLength(1);
  expect(plan.references[0].objectKey).toMatch(
    /^notes\/like-button\/bloom-[a-f0-9]{12}\.png$/,
  );
  expect(plan.references[0].publicUrl).toBe(plan.references[1].publicUrl);
  expect(plan.references[0].publicUrl).toContain(
    "https://media.9rtm.dev/notes/like-button/bloom-",
  );
  expect(plan.orphanFiles).toEqual(["static/post-media/unused.png"]);
  expect(plan.missingFiles).toEqual([
    expect.objectContaining({
      sourceRelativePath: "contents/notes/like-button.md",
      localRelativePath: "static/post-media/missing.png",
    }),
  ]);
});

it("rewrites every source only after all uploads succeed", async () => {
  const root = await makeProject();
  const articlePath = path.join(root, "contents", "notes", "article.md");
  const storyPath = path.join(root, "src", "components", "sample.stories.ts");
  const article = "![A](/post-media/a.png)\n![B](/post-media/b.webm)";
  const story = 'image: "/post-media/a.png"';
  await writeFile(articlePath, article);
  await writeFile(storyPath, story);
  await writeFile(path.join(root, "static", "post-media", "a.png"), "a");
  await writeFile(path.join(root, "static", "post-media", "b.webm"), "b");

  const plan = await buildMigrationPlan(root);
  let uploadCount = 0;
  let writeCount = 0;
  const result = await applyMigrationPlan(plan, {
    uploadObject: async () => {
      uploadCount += 1;
      return uploadCount === 2 ? 23 : 0;
    },
    writeFile: async (...args) => {
      writeCount += 1;
      return await writeFile(...args);
    },
  });

  expect(result).toMatchObject({
    exitCode: 23,
    uploadedCount: 1,
    changedFiles: [],
  });
  expect(writeCount).toBe(0);
  expect(await readFile(articlePath, "utf8")).toBe(article);
  expect(await readFile(storyPath, "utf8")).toBe(story);
});

it("rewrites article and Storybook references after successful uploads", async () => {
  const root = await makeProject();
  const articlePath = path.join(root, "contents", "notes", "article.md");
  const storyPath = path.join(root, "src", "components", "sample.stories.ts");
  await writeFile(articlePath, "![A](/post-media/a.png)");
  await writeFile(storyPath, 'image: "/post-media/a.png"');
  await writeFile(path.join(root, "static", "post-media", "a.png"), "a");

  const plan = await buildMigrationPlan(root);
  const result = await applyMigrationPlan(plan, {
    uploadObject: async () => 0,
  });

  expect(result.exitCode).toBe(0);
  expect(result.uploadedCount).toBe(1);
  expect(result.changedFiles).toEqual([
    "contents/notes/article.md",
    "src/components/sample.stories.ts",
  ]);
  const publicUrl = plan.objects[0].publicUrl;
  expect(await readFile(articlePath, "utf8")).toBe(`![A](${publicUrl})`);
  expect(await readFile(storyPath, "utf8")).toBe(`image: "${publicUrl}"`);
});
