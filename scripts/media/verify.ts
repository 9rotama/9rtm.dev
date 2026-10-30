import { readFile } from "node:fs/promises";
import { listMediaSourceFiles } from "./migration.ts";

const publicMediaUrlPattern = /https:\/\/media\.9rtm\.dev\/[^\s"'<>)]*/g;

export type PublicMediaReference = {
  url: string;
  sourceRelativePath: string;
};

export function findPublicMediaReferences(
  content: string,
  sourceRelativePath: string,
): PublicMediaReference[] {
  const references: PublicMediaReference[] = [];
  for (const match of content.matchAll(publicMediaUrlPattern)) {
    const url = match[0].replace(/[.,;]+$/, "");
    if (!url) continue;
    references.push({ url, sourceRelativePath });
  }
  return references;
}

export async function collectPublicMediaReferences(
  root: string,
): Promise<PublicMediaReference[]> {
  const files = await listMediaSourceFiles(root);
  const references = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = filePath
        .slice(root.length + 1)
        .split("/")
        .join("/");
      return findPublicMediaReferences(
        await readFile(filePath, "utf8"),
        relativePath,
      );
    }),
  );
  return references.flat();
}

export type MediaVerification = {
  url: string;
  sourceRelativePaths: string[];
  ok: boolean;
  status?: number;
  error?: string;
};

export type VerifyDependencies = {
  fetch?: typeof fetch;
  timeoutMs?: number;
};

export async function verifyPublicMediaReferences(
  references: PublicMediaReference[],
  dependencies: VerifyDependencies = {},
): Promise<MediaVerification[]> {
  const fetchUrl = dependencies.fetch ?? fetch;
  const timeoutMs = dependencies.timeoutMs ?? 15_000;
  const sourcesByUrl = new Map<string, Set<string>>();
  for (const reference of references) {
    const sources = sourcesByUrl.get(reference.url) ?? new Set<string>();
    sources.add(reference.sourceRelativePath);
    sourcesByUrl.set(reference.url, sources);
  }

  const results: MediaVerification[] = [];
  for (const [url, sources] of sourcesByUrl) {
    try {
      const response = await fetchUrl(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      results.push({
        url,
        sourceRelativePaths: [...sources],
        ok: response.ok,
        status: response.status,
        ...(response.ok ? {} : { error: `HTTP ${response.status}` }),
      });
    } catch (cause) {
      results.push({
        url,
        sourceRelativePaths: [...sources],
        ok: false,
        error: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }
  return results;
}
