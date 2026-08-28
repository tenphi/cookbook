import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  createDocsGraph,
  defaultLock,
  formatDiagnostics,
  readDocsLock,
  resolvePackageLock,
  writeDocsLock,
  type DocsConfig,
} from "@tenphi/docs";
import { createJiti } from "jiti";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    json: { type: "boolean", default: false },
    root: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help || positionals.length === 0) {
  printHelp();
} else {
  const command = positionals[0];
  const root = resolve(values.root ?? process.cwd());
  if (command === "doctor") await doctor(root, values.json);
  else if (command === "update") await update(root, values.json);
  else {
    console.error(`Unknown command: ${command ?? ""}`);
    printHelp(1);
  }
}

async function doctor(root: string, json: boolean): Promise<void> {
  const config = await loadConfig(root);
  const graph = await createDocsGraph({ root, ...(config ? { config } : {}) });
  if (graph.diagnostics.length > 0)
    console.log(formatDiagnostics(graph.diagnostics, json));
  else if (json)
    console.log(JSON.stringify({ ok: true, pages: graph.entries.length }));
  else
    console.log(
      `Tasty Docs is healthy: ${graph.entries.length} pages, ${graph.assets.length} assets.`,
    );
  if (graph.diagnostics.some((diagnostic) => diagnostic.severity === "error"))
    process.exitCode = 1;
}

async function update(root: string, json: boolean): Promise<void> {
  const existing = await readDocsLock(root);
  if (!existing || existing.sources.length === 0) {
    throw new Error("No package sources are present in tasty-docs.lock.json.");
  }
  const sources = [];
  for (const current of existing.sources) {
    sources.push(
      await resolvePackageLock(current.requested, {
        registry: current.registry,
      }),
    );
  }
  const next = defaultLock(sources);
  await writeDocsLock(root, next);
  if (json) console.log(JSON.stringify(next, null, 2));
  else {
    for (const source of next.sources)
      console.log(`${source.requested} -> ${source.resolved}`);
    console.log("Updated tasty-docs.lock.json.");
  }
}

async function loadConfig(root: string): Promise<DocsConfig | undefined> {
  const path = [
    "docs.config.ts",
    "docs.config.mts",
    "docs.config.js",
    "docs.config.mjs",
  ]
    .map((name) => resolve(root, name))
    .find(existsSync);
  if (!path) return undefined;
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  return (await jiti.import(path, { default: true })) as DocsConfig;
}

function printHelp(code = 0): never {
  console.log(
    `Usage: tasty-docs <command> [options]\n\nCommands:\n  doctor   Validate sources, routes, links, assets, and theme\n  update   Resolve package sources and refresh the integrity lock\n\nOptions:\n  --root <directory>\n  --json\n  -h, --help`,
  );
  process.exit(code);
}
