import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const temporary = await mkdtemp(join(tmpdir(), "cookbook-packs-"));
const packages = ["docs", "starlight", "facade", "create"];

try {
  for (const directory of packages) {
    await run("pnpm", ["pack", "--pack-destination", temporary], {
      cwd: join(root, "packages", directory),
    });
  }
  const tarballs = (await readdir(temporary)).filter((name) =>
    name.endsWith(".tgz"),
  );
  if (tarballs.length !== packages.length)
    throw new Error(`Expected 4 tarballs, found ${tarballs.length}.`);
  for (const tarball of tarballs) {
    const path = join(temporary, tarball);
    const { stdout } = await run("tar", ["-tzf", path]);
    const files = new Set(stdout.trim().split("\n"));
    for (const required of [
      "package/package.json",
      "package/README.md",
      "package/LICENSE",
    ]) {
      if (!files.has(required))
        throw new Error(`${tarball} is missing ${required}.`);
    }
    const manifestText = (
      await run("tar", ["-xOf", path, "package/package.json"])
    ).stdout;
    if (/workspace:|catalog:/.test(manifestText)) {
      throw new Error(
        `${tarball} contains an unpublished dependency protocol.`,
      );
    }
    const manifest = JSON.parse(manifestText);
    for (const target of exportTargets(manifest.exports)) {
      const packedPath = `package/${target.replace(/^\.\//, "")}`;
      const present = target.includes("*")
        ? [...files].some((file) =>
            wildcard(target.replace(/^\.\//, "")).test(
              file.replace(/^package\//, ""),
            ),
          )
        : files.has(packedPath);
      if (!present)
        throw new Error(`${tarball} export target is missing: ${target}.`);
    }
    if (manifest.name === "@tenphi/starlight") {
      for (const required of [
        "package/dist/components/GlobalStyles.js",
        "package/dist/components/TastyComponents.js",
        "package/dist/routes/DocsPage.astro",
      ]) {
        if (!files.has(required))
          throw new Error(`${tarball} is missing ${required}.`);
      }
    }
    const sourceMaps = [...files].filter((name) => name.endsWith(".map"));
    for (const sourceMap of sourceMaps) {
      const contents = (await run("tar", ["-xOf", path, sourceMap])).stdout;
      if (contents.includes(root))
        throw new Error(`${tarball} source map contains the workspace path.`);
    }
    console.log(
      `Verified ${manifest.name}@${manifest.version} (${files.size} files).`,
    );
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}

function exportTargets(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(exportTargets);
}

function wildcard(pattern) {
  return new RegExp(`^${pattern.split("*").map(escapeRegExp).join(".+")}$`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
