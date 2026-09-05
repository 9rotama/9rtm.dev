import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const reportsDirectory = ".lighthouseci";
const warningThresholds = {
  performance: 95,
  accessibility: 95,
  fcp: 1800,
  lcp: 2500,
  cls: 0.1,
};

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
};

const formatMilliseconds = (value) => `${(value / 1000).toFixed(1)} s`;
const formatBytes = (value) =>
  `${Math.round(value / 1024).toLocaleString()} KiB`;

const reportFiles = (await readdir(reportsDirectory)).filter(
  (file) => file.startsWith("lhr-") && file.endsWith(".json"),
);
const reports = await Promise.all(
  reportFiles.map(async (file) =>
    JSON.parse(await readFile(path.join(reportsDirectory, file), "utf8")),
  ),
);

const groupedReports = Map.groupBy(
  reports,
  (report) => new URL(report.requestedUrl).pathname,
);
const rows = [...groupedReports.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([url, pageReports]) => {
    const value = (audit) =>
      median(pageReports.map((report) => report.audits[audit].numericValue));
    return {
      url,
      performance: Math.round(
        median(
          pageReports.map((report) => report.categories.performance.score),
        ) * 100,
      ),
      accessibility: Math.round(
        median(
          pageReports.map((report) => report.categories.accessibility.score),
        ) * 100,
      ),
      fcp: value("first-contentful-paint"),
      lcp: value("largest-contentful-paint"),
      cls: value("cumulative-layout-shift"),
      tbt: value("total-blocking-time"),
      transferSize: value("total-byte-weight"),
    };
  });

const table = [
  "| URL | Performance | Accessibility | FCP | LCP | CLS | TBT | Transfer size |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...rows.map(
    (row) =>
      `| ${row.url} | ${row.performance} | ${row.accessibility} | ${formatMilliseconds(row.fcp)} | ${formatMilliseconds(row.lcp)} | ${row.cls.toFixed(3)} | ${formatMilliseconds(row.tbt)} | ${formatBytes(row.transferSize)} |`,
  ),
].join("\n");

const warnings = rows.flatMap((row) =>
  Object.entries(warningThresholds)
    .filter(([metric, threshold]) =>
      ["performance", "accessibility"].includes(metric)
        ? row[metric] < threshold
        : row[metric] > threshold,
    )
    .map(
      ([metric, threshold]) =>
        `${row.url}: ${metric} is outside the target (${threshold}).`,
    ),
);

const summary = `## Lighthouse (mobile, median of 3 runs)\n\n${table}\n\n${
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
