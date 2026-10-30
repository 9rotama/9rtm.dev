import { lstat, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createMediaObjectKey,
  createPublicMediaUrl,
  getMediaMimeType,
  sha256File,
  type MediaMimeType,
  type UploadObject,
} from "./common.ts";

const postMediaPattern = /\/post-media\/([^/\s"'<>?#)]+)([?#][^\s"'<>)]*)?/g;
const storyFilePattern = /\.stories\.(?:[cm]?[jt]sx?|svelte)$/;

export type PostMediaMatch = {
  original: string;
  filename: string;
  suffix: string;
};

export function findPostMediaReferences(content: string): PostMediaMatch[] {
  return [...content.matchAll(postMediaPattern)].map((match) => ({
    original: match[0],
    filename: match[1],
    suffix: match[2] ?? "",
  }));
}

async function walkFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw cause;
  }

  const paths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return await walkFiles(entryPath);
      return entry.isFile() ? [entryPath] : [];
    }),
  );
  return paths.flat().sort((left, right) => left.localeCompare(right));
}

export async function listMediaSourceFiles(root: string): Promise<string[]> {
  const notesDirectory = path.join(root, "contents", "notes");
  const sourceDirectory = path.join(root, "src");
  const [notes, stories] = await Promise.all([
    walkFiles(notesDirectory),
    walkFiles(sourceDirectory),
  ]);
  return [
    ...notes.filter((file) => file.endsWith(".md")),
    ...stories.filter((file) => storyFilePattern.test(file)),
  ].sort((left, right) => left.localeCompare(right));
}

export type MigrationReference = {
  sourceFile: string;
  sourceRelativePath: string;
  localFile: string;
  localRelativePath: string;
  original: string;
  suffix: string;
  filename: string;
  objectKey?: string;
  publicUrl?: string;
};

export type MigrationObject = {
  filePath: string;
  relativePath: string;
  objectKey: string;
  publicUrl: string;
  mimeType: MediaMimeType;
};

export type MigrationIssue = {
  sourceRelativePath: string;
  reference: string;
  localRelativePath: string;
  reason: string;
};

export type MigrationPlan = {
  root: string;
  references: MigrationReference[];
  objects: MigrationObject[];
  orphanFiles: string[];
  missingFiles: MigrationIssue[];
  unsupportedFiles: MigrationIssue[];
  sourceContents: Map<string, string>;
};

function toRelativePath(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function getArticleSlug(root: string, sourceFile: string): string | undefined {
  const notesPath = path.join(root, "contents", "notes");
  const relative = path.relative(notesPath, sourceFile);
  if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return undefined;
  }
  if (!relative.endsWith(".md") || relative.includes(path.sep)) {
    return undefined;
  }
  return relative.slice(0, -3);
}

function decodeFilename(rawFilename: string): string {
  let filename: string;
  try {
    filename = decodeURIComponent(rawFilename);
  } catch {
    throw new Error("Reference contains invalid URL encoding.");
  }
  if (
    filename === "." ||
    filename === ".." ||
    filename.includes("/") ||
    filename.includes("\\") ||
    path.basename(filename) !== filename
  ) {
    throw new Error("Reference must name a file directly inside /post-media/.");
  }
  return filename;
}

async function isRegularFile(filePath: string): Promise<boolean> {
  try {
    return (await lstat(filePath)).isFile();
  } catch {
    return false;
  }
}

export async function buildMigrationPlan(root: string): Promise<MigrationPlan> {
  const absoluteRoot = path.resolve(root);
  const mediaDirectory = path.join(absoluteRoot, "static", "post-media");
  const sourceFiles = await listMediaSourceFiles(absoluteRoot);
  const sourceContents = new Map(
    await Promise.all(
      sourceFiles.map(
        async (sourceFile) =>
          [sourceFile, await readFile(sourceFile, "utf8")] as const,
      ),
    ),
  );
  const mediaEntries = await readdir(mediaDirectory, { withFileTypes: true });
  const mediaFiles = mediaEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const references: MigrationReference[] = [];
  const missingFiles: MigrationIssue[] = [];
  const unsupportedFiles: MigrationIssue[] = [];
  const articleSlugsByFilename = new Map<string, string[]>();
  const referencedFilenames = new Set<string>();

  for (const [sourceFile, content] of sourceContents) {
    const articleSlug = getArticleSlug(absoluteRoot, sourceFile);
    for (const match of findPostMediaReferences(content)) {
      const sourceRelativePath = toRelativePath(absoluteRoot, sourceFile);
      let filename: string;
      try {
        filename = decodeFilename(match.filename);
      } catch (cause) {
        missingFiles.push({
          sourceRelativePath,
          reference: match.original,
          localRelativePath: `static/post-media/${match.filename}`,
          reason: cause instanceof Error ? cause.message : String(cause),
        });
        continue;
      }
      referencedFilenames.add(filename);

      const localFile = path.join(mediaDirectory, filename);
      const localRelativePath = toRelativePath(absoluteRoot, localFile);
      if (!(await isRegularFile(localFile))) {
        missingFiles.push({
          sourceRelativePath,
          reference: match.original,
          localRelativePath,
          reason: "Local file does not exist or is not a regular file.",
        });
        continue;
      }

      try {
        getMediaMimeType(localFile);
      } catch (cause) {
        unsupportedFiles.push({
          sourceRelativePath,
          reference: match.original,
          localRelativePath,
          reason: cause instanceof Error ? cause.message : String(cause),
        });
        continue;
      }

      references.push({
        sourceFile,
        sourceRelativePath,
        localFile,
        localRelativePath,
        original: match.original,
        suffix: match.suffix,
        filename,
      });
      if (articleSlug) {
        const slugs = articleSlugsByFilename.get(filename) ?? [];
        if (!slugs.includes(articleSlug)) slugs.push(articleSlug);
        articleSlugsByFilename.set(filename, slugs);
      }
    }
  }

  const digestByFile = new Map<string, string>();
  const objectByIdentity = new Map<string, MigrationObject>();
  for (const reference of references) {
    const articleSlug =
      getArticleSlug(absoluteRoot, reference.sourceFile) ??
      articleSlugsByFilename.get(reference.filename)?.[0] ??
      "shared";
    let digest = digestByFile.get(reference.localFile);
    if (!digest) {
      digest = await sha256File(reference.localFile);
      digestByFile.set(reference.localFile, digest);
    }
    const objectKey = createMediaObjectKey(
      articleSlug,
      reference.localFile,
      digest,
    );
    const publicUrl = createPublicMediaUrl(objectKey);
    const identity = `${reference.localFile}\0${objectKey}`;
    let object = objectByIdentity.get(identity);
    if (!object) {
      object = {
        filePath: reference.localFile,
        relativePath: reference.localRelativePath,
        objectKey,
        publicUrl,
        mimeType: getMediaMimeType(reference.localFile),
      };
      objectByIdentity.set(identity, object);
    }
    reference.objectKey = object.objectKey;
    reference.publicUrl = object.publicUrl;
  }

  const orphanFiles = mediaFiles
    .filter((filename) => !referencedFilenames.has(filename))
    .map((filename) => `static/post-media/${filename}`);

  return {
    root: absoluteRoot,
    references,
    objects: [...objectByIdentity.values()],
    orphanFiles,
    missingFiles,
    unsupportedFiles,
    sourceContents,
  };
}

export type MigrationResult = {
  exitCode: number;
  uploadedCount: number;
  changedFiles: string[];
  message?: string;
};

export type MigrationDependencies = {
  uploadObject: UploadObject;
  writeFile?: typeof writeFile;
};

export async function applyMigrationPlan(
  plan: MigrationPlan,
  dependencies: MigrationDependencies,
): Promise<MigrationResult> {
  if (plan.missingFiles.length || plan.unsupportedFiles.length) {
    return {
      exitCode: 1,
      uploadedCount: 0,
      changedFiles: [],
      message:
        "Resolve missing and unsupported files before applying migration.",
    };
  }

  let uploadedCount = 0;
  for (const object of plan.objects) {
    let exitCode: number;
    try {
      exitCode = await dependencies.uploadObject({
        filePath: object.filePath,
        objectKey: object.objectKey,
        mimeType: object.mimeType,
      });
    } catch (cause) {
      return {
        exitCode: 1,
        uploadedCount,
        changedFiles: [],
        message: cause instanceof Error ? cause.message : String(cause),
      };
    }
    if (exitCode !== 0) {
      return {
        exitCode,
        uploadedCount,
        changedFiles: [],
        message: `Wrangler exited with code ${exitCode}.`,
      };
    }
    uploadedCount += 1;
  }

  const write = dependencies.writeFile ?? writeFile;
  const changedFiles: string[] = [];
  for (const [sourceFile, originalContent] of plan.sourceContents) {
    let content = originalContent;
    for (const reference of plan.references) {
      if (
        reference.sourceFile === sourceFile &&
        reference.publicUrl !== undefined
      ) {
        content = content
          .split(reference.original)
          .join(`${reference.publicUrl}${reference.suffix}`);
      }
    }
    if (content !== originalContent) {
      await write(sourceFile, content, "utf8");
      changedFiles.push(toRelativePath(plan.root, sourceFile));
    }
  }
  return { exitCode: 0, uploadedCount, changedFiles };
}
