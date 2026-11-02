import {
  collectPublicMediaReferences,
  verifyPublicMediaReferences,
} from "./media/verify.ts";

export async function runMediaVerify(
  argv: string[],
  cwd = process.cwd(),
): Promise<number> {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  if (args.length) {
    console.error("Usage: pnpm media:verify");
    return 1;
  }
  try {
    const references = await collectPublicMediaReferences(cwd);
    if (!references.length) {
      console.log("No media.9rtm.dev URLs found in articles or Storybook.");
      return 0;
    }

    const results = await verifyPublicMediaReferences(references);
    for (const result of results) {
      const sources = result.sourceRelativePaths.join(", ");
      if (result.ok) {
        console.log(`OK ${result.status} ${result.url} (${sources})`);
      } else {
        console.error(`FAIL ${result.url} (${sources}): ${result.error}`);
      }
    }
    const failures = results.filter((result) => !result.ok).length;
    console.log(
      `Verified ${results.length} unique media URL(s); ${failures} failed.`,
    );
    return failures ? 1 : 0;
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
}

process.exitCode = await runMediaVerify(process.argv.slice(2));
