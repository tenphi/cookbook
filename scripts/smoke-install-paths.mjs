import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const temporary = await mkdtemp(join(tmpdir(), "cookbook-install-"));
const packed = join(temporary, "packed");
const site = join(temporary, "site");

try {
  await mkdir(packed, { recursive: true });
  await mkdir(site, { recursive: true });
  for (const directory of ["docs", "starlight", "facade", "create"]) {
    await run("pnpm", ["pack", "--pack-destination", packed], {
      cwd: join(root, "packages", directory),
    });
  }
  const tarballs = await readdir(packed);
  const byPrefix = (prefix) =>
    join(packed, tarballs.find((name) => name.startsWith(prefix)) ?? "missing");
  const packageJson = {
    name: "cookbook-clean-install-smoke",
    version: "0.0.0",
    private: true,
    type: "module",
    scripts: { build: "astro build" },
    dependencies: {
      "@tenphi/docs": `file:${byPrefix("tenphi-docs-")}`,
      "@tenphi/starlight": `file:${byPrefix("tenphi-starlight-")}`,
      astro: "7.2.9",
      "@tenphi/cookbook": `file:${byPrefix("tenphi-cookbook-")}`,
    },
  };
  await writeFile(
    join(site, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  await writeFile(
    join(site, "README.md"),
    "# Packed site\n\n[Read more](./docs/guide.md).\n\n## Example\n\n```js\nconst ready = true;\n```\n",
  );
  await writeFile(
    join(site, "astro.config.mjs"),
    "import { defineConfig } from 'astro/config';\nimport cookbook from '@tenphi/cookbook';\nexport default defineConfig({ integrations: [cookbook()] });\n",
  );
  await mkdir(join(site, "docs"), { recursive: true });
  await writeFile(
    join(site, "docs", "guide.md"),
    "# Guide\n\nBuilt only from packed package artifacts.\n",
  );
  await run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: site,
    maxBuffer: 8 * 1024 * 1024,
  });
  await run("npm", ["run", "build"], { cwd: site, maxBuffer: 8 * 1024 * 1024 });
  const html = await readFile(join(site, "dist", "index.html"), "utf8");
  if (!html.includes("Packed site") || !html.includes('href="/guide"')) {
    throw new Error(
      "Packed-package site did not contain the expected generated content.",
    );
  }
  for (const marker of ["data-has-toc", "td-header", "right-sidebar"]) {
    if (!html.includes(marker)) {
      throw new Error(
        `Packed convention page did not use the default Starlight theme: missing ${marker}.`,
      );
    }
  }
  const outputEntries = await readdir(join(site, "dist"), { recursive: true });
  const cssEntries = outputEntries.filter((name) => extname(name) === ".css");
  if (
    cssEntries.length === 0 ||
    cssEntries.some(
      (name) => !/^_astro\/tasty\.(?:shared|page)\.[\w-]+\.css$/.test(name),
    )
  ) {
    throw new Error(
      `Packed convention page must ship only extracted Tasty CSS: ${cssEntries.join(", ")}.`,
    );
  }
  const css = (
    await Promise.all(
      cssEntries.map((name) => readFile(join(site, "dist", name), "utf8")),
    )
  ).join("\n");
  if (
    /--sl-|@layer\s+starlight|expressive-code|--ec-/i.test(`${html}\n${css}`)
  ) {
    throw new Error(
      "Packed convention page contains Starlight or Expressive Code styles.",
    );
  }
  if (/react-dom|tasty\/client|data-reactroot/i.test(html)) {
    throw new Error(
      "Packed convention page unexpectedly includes a hydration runtime.",
    );
  }
  console.log(
    "Clean npm installation and Astro build passed using only packed workspace artifacts.",
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
