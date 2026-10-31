import { buildMigrationPlan, applyMigrationPlan } from "./media/migration.ts";
import { uploadObjectToR2 } from "./media/common.ts";

function printPlan(
  plan: Awaited<ReturnType<typeof buildMigrationPlan>>,
  apply: boolean,
): void {
  console.log(`Media migration ${apply ? "apply" : "dry-run"} plan:`);
  for (const reference of plan.references) {
    console.log(`- source: ${reference.sourceRelativePath}`);
    console.log(`  local: ${reference.localRelativePath}`);
    console.log(`  target: ${reference.objectKey}`);
    console.log(`  URL: ${reference.publicUrl}`);
  }
  if (plan.orphanFiles.length) {
    console.log("Unreferenced files (not uploaded or deleted):");
    for (const file of plan.orphanFiles) console.log(`- ${file}`);
  }
  if (plan.missingFiles.length) {
    console.error("Missing local media references:");
    for (const issue of plan.missingFiles) {
      console.error(
        `- ${issue.sourceRelativePath}: ${issue.reference} -> ${issue.localRelativePath} (${issue.reason})`,
      );
    }
  }
  if (plan.unsupportedFiles.length) {
    console.error("Unsupported local media references:");
    for (const issue of plan.unsupportedFiles) {
      console.error(
        `- ${issue.sourceRelativePath}: ${issue.reference} -> ${issue.localRelativePath} (${issue.reason})`,
      );
    }
  }
}

export async function runMediaMigrate(
  argv: string[],
  cwd = process.cwd(),
): Promise<number> {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  if (args.some((argument) => argument !== "--apply") || args.length > 1) {
    console.error("Usage: node scripts/media-migrate.ts [--apply]");
    return 1;
  }
  const apply = args.includes("--apply");
  try {
    const plan = await buildMigrationPlan(cwd);
    printPlan(plan, apply);
    if (plan.missingFiles.length || plan.unsupportedFiles.length) return 1;
    if (!apply) return 0;

    const result = await applyMigrationPlan(plan, {
      uploadObject: uploadObjectToR2,
    });
    if (result.message) {
      console.error(
        `${result.message} Article and Storybook files were not rewritten.`,
      );
    } else {
      console.log(`Uploaded ${result.uploadedCount} objects.`);
      for (const file of result.changedFiles) console.log(`Rewrote ${file}`);
    }
    return result.exitCode;
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : String(cause));
    return 1;
  }
}

process.exitCode = await runMediaMigrate(process.argv.slice(2));
