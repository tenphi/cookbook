import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { performance } from "node:perf_hooks";
import {
  createDocsGraph,
  validateBuiltDocs,
} from "../packages/docs/dist/index.js";
const count = Number(process.env.COOKBOOK_BENCH_PAGES ?? 500);
assert.ok(Number.isInteger(count) && count >= 20 && count <= 5000);
const root = process.cwd();
const fixture = await mkdtemp(join(root, ".cookbook-benchmark-"));
try {
  await mkdir(join(fixture, "docs"));
  const content = Array.from(
    { length: 20 },
    (_, i) =>
      `## Topic ${i}\n\nA paragraph that explains configuration, navigation, and maintenance.\n\n\`\`\`ts\nconst value = ${i};\n\`\`\`\n`,
  ).join("\n");
  await Promise.all(
    Array.from({ length: count }, (_, i) =>
      writeFile(
        join(fixture, "docs", i ? `page-${i}.md` : "index.md"),
        `# ${i ? `Page ${i}` : "Documentation"}\n\n[Next](./${i + 1 < count ? `page-${i + 1}` : "index"}.md).\n\n${content}`,
      ),
    ),
  );
  const config = {
    site: { title: "Corpus", url: "https://example.com" },
    content: { sources: [{ glob: "docs/**/*.md", base: "docs" }] },
    navigation: { items: ["/"] },
  };
  const timings = [];
  let graph;
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    graph = await createDocsGraph({ root: fixture, config });
    timings.push(Math.round(performance.now() - start));
    assert.equal(graph.entries.length, count);
    assert.deepEqual(graph.diagnostics, []);
  }
  const report = {
    pages: count,
    headings: count * 20,
    graphMs: timings,
    medianGraphMs: [...timings].sort((a, b) => a - b)[1],
    rssMiB: Math.round(process.memoryUsage().rss / 1024 / 1024),
  };
  if (process.env.COOKBOOK_BENCH_BUILD === "1") {
    await symlink(
      join(root, "apps/convention/node_modules"),
      join(fixture, "node_modules"),
      "dir",
    );
    await writeFile(join(fixture, "package.json"), '{"type":"module"}');
    await writeFile(
      join(fixture, "docs.config.mjs"),
      `export default ${JSON.stringify(config)};`,
    );
    await writeFile(
      join(fixture, "astro.config.mjs"),
      'import cookbook from "@tenphi/cookbook";export default {integrations:[cookbook()]};',
    );
    const start = performance.now();
    await promisify(execFile)(
      process.execPath,
      [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
      {
        cwd: fixture,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    report.buildMs = Math.round(performance.now() - start);
    const output = await validateBuiltDocs({
      directory: join(fixture, "dist"),
      graph,
    });
    assert.ok(output.ok, JSON.stringify(output.diagnostics.slice(0, 5)));
    assert.ok(
      report.buildMs < 240000,
      `Corpus build exceeded 4 minutes: ${report.buildMs}ms`,
    );
  }
  console.log(JSON.stringify(report, null, 2));
  assert.ok(
    report.medianGraphMs < count * 30,
    `Graph exceeded 30ms/page: ${report.medianGraphMs}ms`,
  );
  assert.ok(
    report.rssMiB < 1500,
    `Graph RSS exceeded 1.5GiB: ${report.rssMiB}MiB`,
  );
} finally {
  await rm(fixture, { recursive: true, force: true });
}
