import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const categories = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
  "agentic-browsing": "Agentic Browsing",
} as const;

type Category = keyof typeof categories;

type LighthouseReport = {
  requestedUrl: string;
  audits: Record<
    string,
    { numericValue: number; score: number | null; title: string }
  >;
  categories: Partial<
    Record<
      Category,
      { score: number | null; auditRefs: { id: string; weight: number }[] }
    >
  >;
};

type FailedAudit = { category: Category; id: string; title: string };

type SummaryRow = {
  url: string;
  scores: Record<Category, number | undefined>;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  transferSize: number;
  failedAudits: FailedAudit[];
};

const reportsDirectory = ".lighthouseci";
const scoreThresholds: Record<Category, number> = {
  performance: 95,
  accessibility: 95,
  "best-practices": 95,
  seo: 95,
  "agentic-browsing": 95,
};
const metricThresholds = {
  fcp: 1800,
  lcp: 2500,
  cls: 0.1,
};

type WarningMetric = keyof typeof metricThresholds;

const auditedCategories = (Object.keys(categories) as Category[]).filter(
  (category) => category !== "performance",
);

const median = (values: number[]) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
};

const formatMilliseconds = (value: number) => `${(value / 1000).toFixed(1)} s`;
const formatBytes = (value: number) =>
  `${Math.round(value / 1024).toLocaleString()} KiB`;
const formatScore = (value: number | undefined) => value?.toString() ?? "-";

const isFailed = (score: number | null | undefined) =>
  score !== null && score !== undefined && score < 1;

const reportFiles = (await readdir(reportsDirectory)).filter(
  (file) => file.startsWith("lhr-") && file.endsWith(".json"),
);
const reports = await Promise.all(
  reportFiles.map(
    async (file) =>
      JSON.parse(
        await readFile(path.join(reportsDirectory, file), "utf8"),
      ) as LighthouseReport,
  ),
);

const groupedReports = Map.groupBy(
  reports,
  (report) => new URL(report.requestedUrl).pathname,
);

const categoryScore = (pageReports: LighthouseReport[], category: Category) => {
  const scores = pageReports
    .map((report) => report.categories[category]?.score)
    .filter((score) => typeof score === "number");
  return scores.length === 0 ? undefined : Math.round(median(scores) * 100);
};

const failedAudits = (pageReports: LighthouseReport[]) =>
  auditedCategories.flatMap((category) => {
    // Weight-0 audits are informational and do not lower the category score.
    const auditIds = new Set(
      pageReports.flatMap(
        (report) =>
          report.categories[category]?.auditRefs
            .filter((ref) => ref.weight > 0)
            .map((ref) => ref.id) ?? [],
      ),
    );
    return [...auditIds].flatMap((id) => {
      const failedRuns = pageReports.filter(
        (report) =>
          report.categories[category] && isFailed(report.audits[id]?.score),
      );
      return failedRuns.length > pageReports.length / 2
        ? [{ category, id, title: failedRuns[0].audits[id].title }]
        : [];
    });
  });

const rows: SummaryRow[] = [...groupedReports.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([url, pageReports]) => {
    const value = (audit: string) =>
      median(pageReports.map((report) => report.audits[audit].numericValue));
    return {
      url,
      scores: Object.fromEntries(
        (Object.keys(categories) as Category[]).map((category) => [
          category,
          categoryScore(pageReports, category),
        ]),
      ) as Record<Category, number | undefined>,
      fcp: value("first-contentful-paint"),
      lcp: value("largest-contentful-paint"),
      cls: value("cumulative-layout-shift"),
      tbt: value("total-blocking-time"),
      transferSize: value("total-byte-weight"),
      failedAudits: failedAudits(pageReports),
    };
  });

const scoresTable = [
  `| URL | ${Object.values(categories).join(" | ")} |`,
  `| --- |${" ---: |".repeat(Object.keys(categories).length)}`,
  ...rows.map(
    (row) =>
      `| ${row.url} | ${Object.values(row.scores).map(formatScore).join(" | ")} |`,
  ),
].join("\n");

const metricsTable = [
  "| URL | FCP | LCP | CLS | TBT | Transfer size |",
  "| --- | ---: | ---: | ---: | ---: | ---: |",
  ...rows.map(
    (row) =>
      `| ${row.url} | ${formatMilliseconds(row.fcp)} | ${formatMilliseconds(row.lcp)} | ${row.cls.toFixed(3)} | ${formatMilliseconds(row.tbt)} | ${formatBytes(row.transferSize)} |`,
  ),
].join("\n");

const rowsWithFailedAudits = rows.filter((row) => row.failedAudits.length > 0);
const failedAuditsSection =
  rowsWithFailedAudits.length === 0
    ? "No audits failed outside Performance."
    : [
        "<details>",
        `<summary>${rowsWithFailedAudits.flatMap((row) => row.failedAudits).length} failed audits outside Performance</summary>`,
        "",
        ...rowsWithFailedAudits.flatMap((row) => [
          `- ${row.url}`,
          ...row.failedAudits.map(
            (audit) =>
              `  - ${categories[audit.category]}: ${audit.id} (${audit.title})`,
          ),
        ]),
        "",
        "</details>",
      ].join("\n");

const warnings = rows.flatMap((row) => [
  ...(Object.entries(scoreThresholds) as [Category, number][])
    .filter(([category, threshold]) => {
      const score = row.scores[category];
      return score !== undefined && score < threshold;
    })
    .map(
      ([category, threshold]) =>
        `${row.url}: ${category} is outside the target (${threshold}).`,
    ),
  ...(Object.entries(metricThresholds) as [WarningMetric, number][])
    .filter(([metric, threshold]) => row[metric] > threshold)
    .map(
      ([metric, threshold]) =>
        `${row.url}: ${metric} is outside the target (${threshold}).`,
    ),
]);

const summary = `## Lighthouse (mobile, median of 3 runs)\n\n### Scores\n\n${scoresTable}\n\n### Performance metrics\n\n${metricsTable}\n\n### Failed audits\n\n${failedAuditsSection}\n\n${
  warnings.length === 0
    ? "All provisional targets were met."
    : `> [!WARNING]\n> ${warnings.join("\n> ")}`
}\n`;

if (process.env.GITHUB_STEP_SUMMARY) {
  await writeFile(process.env.GITHUB_STEP_SUMMARY, summary, { flag: "a" });
}

console.log(summary);
for (const warning of warnings) {
  console.log(`::warning title=Lighthouse provisional target::${warning}`);
}
