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

let jsonOutput = process.argv.slice(2).includes("--json");

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: "boolean", default: false },
      root: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  jsonOutput = values.json;
  if (values.help || positionals.length === 0) {
    printHelp();
  } else {
    const command = positionals[0];
    const root = resolve(values.root ?? process.cwd());
    if (command === "doctor") await doctor(root, values.json);
    else if (command === "update") await update(root, values.json);
    else {
      throw new Error(`Unknown command: ${command ?? ""}.`);
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          pages: 0,
          assets: 0,
          diagnostics: [
            { code: "COOKBOOK_CLI_ERROR", severity: "error", message },
          ],
        },
        null,
        2,
      ),
    );
  } else {
    console.error(`ERROR COOKBOOK_CLI_ERROR ${message}`);
  }
  process.exitCode = 1;
}

async function doctor(root: string, json: boolean): Promise<void> {
  const config = await loadConfig(root);
  const graph = await createDocsGraph({ root, ...(config ? { config } : {}) });
  const hasErrors = graph.diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );
  if (json) {
    console.log(
      JSON.stringify(
        {
          ok: !hasErrors,
          pages: graph.entries.length,
          assets: graph.assets.length,
          diagnostics: graph.diagnostics,
        },
        null,
        2,
      ),
    );
  } else if (graph.diagnostics.length > 0) {
    console.log(formatDiagnostics(graph.diagnostics));
  } else {
    console.log(
      `Cookbook is healthy: ${graph.entries.length} pages, ${graph.assets.length} assets.`,
    );
  }
  if (hasErrors) process.exitCode = 1;
}

async function update(root: string, json: boolean): Promise<void> {
  const existing = await readDocsLock(root);
  if (!existing || existing.sources.length === 0) {
    throw new Error("No package sources are present in cookbook.lock.json.");
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
  if (json)
    console.log(
      JSON.stringify(
        {
          ok: true,
          pages: 0,
          assets: 0,
          diagnostics: [],
          lock: next,
        },
        null,
        2,
      ),
    );
  else {
    for (const source of next.sources)
      console.log(`${source.requested} -> ${source.resolved}`);
    console.log("Updated cookbook.lock.json.");
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
    `Usage: cookbook <command> [options]\n\nCommands:\n  doctor   Validate sources, routes, links, assets, and theme\n  update   Resolve package sources and refresh the integrity lock\n\nOptions:\n  --root <directory>\n  --json\n  -h, --help`,
  );
  process.exit(code);
}
