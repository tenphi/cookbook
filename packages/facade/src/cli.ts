import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  createDocsGraph,
  formatDiagnostics,
  materializePackage,
  normalizeDocsConfig,
  readDocsLock,
  reconcileDocsLock,
  resolveDocsProject,
  writeDocsLock,
  validateProjectAssets,
  validateBuiltDocs,
  type DocsDiagnostic,
  type DocsProject,
} from "@tenphi/docs";
import { resolveDocsTheme } from "@tenphi/starlight";

let jsonOutput = process.argv.slice(2).includes("--json");

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: "boolean", default: false },
      root: { type: "string" },
      config: { type: "string" },
      out: { type: "string" },
      url: { type: "string" },
      "public-dir": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  jsonOutput = values.json;
  if (values.help || positionals.length === 0) {
    printHelp();
  } else {
    const command = positionals[0];
    if (!["doctor", "update", "check-build"].includes(command!)) {
      throw new Error(`Unknown command: ${command ?? ""}.`);
    }
    if (command !== "update" && (positionals.length > 1 || values["dry-run"])) {
      throw new Error(
        `${command} does not accept package selectors or --dry-run.`,
      );
    }
    if (command !== "check-build" && (values.out || values.url))
      throw new Error("--out and --url are only supported by check-build.");
    if (values["public-dir"] && command !== "doctor")
      throw new Error("--public-dir is only supported by doctor.");
    const project = await resolveDocsProject({
      root: resolve(values.root ?? process.cwd()),
      ...(values.config ? { configFile: values.config } : {}),
    });
    if (command === "doctor")
      await doctor(
        project,
        values.json,
        values["public-dir"]
          ? resolve(values.root ?? process.cwd(), values["public-dir"])
          : resolve(values.root ?? process.cwd(), "public"),
      );
    else if (command === "check-build") {
      const graph = await createDocsGraph(project);
      const report = await validateBuiltDocs({
        directory: resolve(values.root ?? process.cwd(), values.out ?? "dist"),
        graph,
        ...(values.url ? { deployedUrl: values.url } : {}),
      });
      report.diagnostics.unshift(...graph.diagnostics);
      report.ok = !report.diagnostics.some((d) => d.severity === "error");
      if (values.json) console.log(JSON.stringify(report, null, 2));
      else {
        if (report.diagnostics.length)
          console.log(formatDiagnostics(report.diagnostics));
        console.log(
          `${report.ok ? "Passed" : "Failed"} ${report.scope} checks: ${report.pages} pages, ${report.assets} assets${report.checkedUrls ? `, ${report.checkedUrls} deployed URLs` : ""}.`,
        );
      }
      if (!report.ok) process.exitCode = 1;
    } else
      await update(
        project,
        positionals.slice(1),
        values.json,
        values["dry-run"],
      );
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const diagnostics: DocsDiagnostic[] =
    error && typeof error === "object" && "diagnostics" in error
      ? (error.diagnostics as DocsDiagnostic[])
      : [{ code: "COOKBOOK_CLI_ERROR", severity: "error", message }];
  if (jsonOutput) {
    console.log(
      JSON.stringify({ ok: false, pages: 0, assets: 0, diagnostics }, null, 2),
    );
  } else {
    console.error(formatDiagnostics(diagnostics));
  }
  process.exitCode = 1;
}

async function doctor(
  project: DocsProject,
  json: boolean,
  publicDirectory?: string,
): Promise<void> {
  const theme = resolveDocsTheme(project.config.theme);
  const graph = await createDocsGraph(project);
  const diagnostics = [
    ...graph.diagnostics,
    ...theme.diagnostics,
    ...(await validateProjectAssets(project, graph, publicDirectory)),
  ];
  const hasErrors = diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );
  if (json) {
    console.log(
      JSON.stringify(
        {
          ok: !hasErrors,
          scope: "preflight",
          buildVerified: false,
          pages: graph.entries.length,
          assets: graph.assets.length,
          diagnostics,
        },
        null,
        2,
      ),
    );
  } else if (diagnostics.length > 0) {
    console.log(formatDiagnostics(diagnostics));
  } else {
    console.log(
      `Preflight passed: ${graph.entries.length} pages, ${graph.assets.length} content assets. MDX compilation, remote fonts, and deployment are not checked. Run astro build and cookbook check-build.`,
    );
  }
  if (hasErrors) process.exitCode = 1;
}

async function update(
  project: DocsProject,
  packages: string[],
  json: boolean,
  dryRun: boolean,
): Promise<void> {
  const existing = await readDocsLock(project.root);
  const next = await reconcileDocsLock(project.config, existing, { packages });
  const changes = next.sources.map((source) => ({
    requested: source.requested,
    from:
      existing?.sources.find(
        (current) => current.requested === source.requested,
      )?.resolved ?? null,
    to: source.resolved,
  }));
  const removed =
    existing?.sources
      .filter(
        (source) =>
          !next.sources.some(
            (current) => current.requested === source.requested,
          ),
      )
      .map((source) => source.requested) ?? [];
  if (!dryRun) {
    const build = normalizeDocsConfig(project.config).build;
    for (const source of next.sources) {
      if (!source.vendored) continue;
      const current = existing?.sources.find(
        (entry) => entry.requested === source.requested,
      );
      if (
        current?.vendored === source.vendored &&
        current.integrity === source.integrity
      )
        continue;
      const { vendored, ...remote } = source;
      const artifact = await materializePackage(remote, build, project.root);
      const destination = resolve(project.root, vendored);
      await mkdir(dirname(destination), { recursive: true });
      await cp(artifact, destination, { recursive: true });
    }
    await writeDocsLock(project.root, next);
  }
  if (json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          pages: 0,
          assets: 0,
          diagnostics: [],
          dryRun,
          changes,
          removed,
          lock: next,
        },
        null,
        2,
      ),
    );
  } else {
    for (const change of changes)
      console.log(
        `${change.requested}: ${change.from ?? "(new)"} -> ${change.to}`,
      );
    for (const source of removed) console.log(`Removed ${source}`);
    console.log(
      dryRun
        ? "Dry run: cookbook.lock.json is unchanged."
        : "Updated cookbook.lock.json.",
    );
  }
}

function printHelp(): never {
  console.log(
    `Usage: cookbook <command> [options]\n\nCommands:\n  doctor             Check configuration, content graph, theme, and local files\n  check-build        Inspect production output and optionally deployed URLs\n  update [packages]  Reconcile configured package sources and their lock\n\nOptions:\n  --root <directory>\n  --config <path>\n  --public-dir <directory>  Local public assets for doctor (default: public)\n  --out <directory>        Built output (default: dist)\n  --url <base-url>         Also check a deployed site\n  --dry-run          Preview an update without writing files\n  --json\n  -h, --help`,
  );
  process.exit(0);
}
