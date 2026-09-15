import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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
