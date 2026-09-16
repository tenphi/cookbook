import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const cli = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const fixtures: string[] = [];

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

describe("Cookbook CLI", () => {
  it("uses the config file directory to resolve an existing repository", async () => {
    const root = await fixture();
    await mkdir(join(root, "site"));
    await writeFile(join(root, "README.md"), "# Repository\n");
    await writeFile(
      join(root, "site", "docs.config.mjs"),
      'export default { root: ".." };',
    );
    const { stdout } = await execFileAsync(process.execPath, [
      cli,
      "doctor",
      "--root",
      join(root, "site"),
      "--json",
    ]);
    expect(JSON.parse(stdout)).toMatchObject({ ok: true, pages: 1 });
  });
  it("creates, previews, updates, and prunes a lock against the configured registry", async () => {
    const root = await fixture();
    const server = createServer((_request, response) => {
      response.setHeader("content-type", "application/json");
      response.end(
        JSON.stringify({
          name: "fixture",
          "dist-tags": { latest: "2.0.0" },
          versions: Object.fromEntries(
            ["1.0.0", "2.0.0"].map((version) => [
              version,
              {
                name: "fixture",
                version,
                dist: {
                  tarball: `${registry}fixture-${version}.tgz`,
                  integrity: `sha512-${Buffer.alloc(64).toString("base64")}`,
                },
              },
            ]),
          ),
        }),
      );
    });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const registry = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
    const config = async (specifier?: string) =>
      writeFile(
        join(root, "docs.config.mjs"),
        `export default ${JSON.stringify({ content: { sources: specifier ? [{ package: specifier, registry }] : [] } })};`,
      );
    const update = async (...args: string[]) =>
      JSON.parse(
        (
          await execFileAsync(process.execPath, [
            cli,
            "update",
            "--root",
            root,
            "--json",
            ...args,
          ])
        ).stdout,
      );
    try {
      await config("fixture@^1");
      expect(await update("--dry-run")).toMatchObject({
        ok: true,
        dryRun: true,
        changes: [{ from: null, to: "fixture@1.0.0" }],
      });
      expect(await readdir(root)).not.toContain("cookbook.lock.json");
      await update();
      await config("fixture@^2");
      expect(await update("fixture")).toMatchObject({
        ok: true,
        removed: ["fixture@^1"],
        changes: [{ requested: "fixture@^2", to: "fixture@2.0.0" }],
      });
      const lock = JSON.parse(
        await readFile(join(root, "cookbook.lock.json"), "utf8"),
      );
      expect(lock.sources).toHaveLength(1);
      expect(lock.sources[0]).toMatchObject({
        requested: "fixture@^2",
        resolved: "fixture@2.0.0",
        registry,
      });
      await config();
      expect(await update()).toMatchObject({
        removed: ["fixture@^2"],
        lock: { sources: [] },
      });
    } finally {
      await new Promise<void>((done, reject) =>
        server.close((error) => (error ? reject(error) : done())),
      );
    }
  }, 15_000);
  it("prints a stable JSON envelope for a healthy project", async () => {
    const root = await fixture();
    await writeFile(join(root, "README.md"), "# Fixture\n", "utf8");

    const { stdout } = await execFileAsync(process.execPath, [
      cli,
      "doctor",
      "--root",
      root,
      "--json",
    ]);

    expect(JSON.parse(stdout)).toMatchObject({
      ok: true,
      pages: 1,
      assets: 0,
      diagnostics: [],
    });
  });

  it("keeps argument failures machine-readable when JSON is requested", async () => {
    let stdout = "";
    try {
      await execFileAsync(process.execPath, [
        cli,
        "doctor",
        "--unknown",
        "--json",
      ]);
    } catch (error) {
      stdout = (error as { stdout: string }).stdout;
    }

    expect(JSON.parse(stdout)).toMatchObject({
      ok: false,
      pages: 0,
      assets: 0,
      diagnostics: [
        expect.objectContaining({
          code: "COOKBOOK_CLI_ERROR",
          severity: "error",
        }),
      ],
    });
  });
});

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "cookbook-cli-"));
  fixtures.push(root);
  return root;
}
