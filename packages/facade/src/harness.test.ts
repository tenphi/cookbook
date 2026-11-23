import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

/*
  The harness ships in the package for projects that use harnesspm.
  `harnesspm check` validates its files at prepack; these tests guard what it
  cannot see: the packages `extends` names, the upstream sections the patches
  replace, the upstream skills the harness replaces, the docs index and the
  theme module the patches point agents at.
*/
const execFileAsync = promisify(execFile);
const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const harness = join(packageRoot, "harness");
const repositoryDocs = fileURLToPath(
  new URL("../../../docs/", import.meta.url),
);
const fixtures: string[] = [];

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

interface HarnessManifest {
  name: string;
  extensions: {
    "dev.harnesspm": {
      extends: string[];
      docs: string;
      replace: Record<string, string>;
      patch: Record<string, string>;
    };
  };
}

// The npm package of each plugin name that a unit ID can start with.
const plugins: Record<string, string> = {
  glaze: "@tenphi/glaze",
  tasty: "@tenphi/tasty",
  "tasty-lint": "@tenphi/eslint-plugin-tasty",
};

function upstreamFile(id: string, file: string): Promise<string> {
  const [plugin] = id.split(":") as [string];
  return readFile(
    join(packageRoot, "node_modules", plugins[plugin]!, "harness", file),
    "utf8",
  );
}

async function manifest(): Promise<HarnessManifest> {
  return JSON.parse(await readFile(join(harness, "plugin.json"), "utf8"));
}

function headings(markdown: string): string[] {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((match) => match[1]!);
}

describe("Cookbook harness", () => {
  it("extends only packages that Cookbook depends on", async () => {
    const { dependencies } = JSON.parse(
      await readFile(join(packageRoot, "package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    const extended = (await manifest()).extensions["dev.harnesspm"].extends;
    expect(extended).toEqual([
      "@tenphi/tasty",
      "@tenphi/glaze",
      "@tenphi/eslint-plugin-tasty",
    ]);
    // harnesspm resolves `extends` from this package's own folder.
    for (const name of extended) expect(dependencies).toHaveProperty(name);
  });

  it("patches sections that the upstream rules still have", async () => {
    const patches = (await manifest()).extensions["dev.harnesspm"].patch;
    expect(Object.keys(patches).sort()).toEqual([
      "glaze:rules/colors",
      "tasty-lint:rules/usage",
      "tasty:rules/usage",
    ]);
    for (const [id, path] of Object.entries(patches)) {
      const unit = id.split(":")[1]!;
      const upstream = await upstreamFile(id, `dev.harnesspm/${unit}.md`);
      const patch = await readFile(join(harness, path), "utf8");
      expect(headings(patch).length).toBeGreaterThan(0);
      for (const heading of headings(patch))
        expect(headings(upstream), `${id}: ${heading}`).toContain(heading);
    }
  });

  it("replaces skills that the upstream packages still have, by name", async () => {
    const replaced = (await manifest()).extensions["dev.harnesspm"].replace;
    expect(Object.keys(replaced)).toEqual(["glaze:skills/glaze-theme"]);
    const name = (skill: string) => /^name:\s*(.+)$/m.exec(skill)?.[1];
    for (const [id, path] of Object.entries(replaced)) {
      const unit = id.split(":")[1]!;
      const upstream = await upstreamFile(id, `${unit}/SKILL.md`);
      const skill = await readFile(join(harness, path, "SKILL.md"), "utf8");
      // A replacement takes the skill's place, so it keeps the skill's name.
      expect(name(skill), id).toBe(name(upstream));
    }
  });

  it("indexes every English page in the docs index", async () => {
    const index = await readFile(join(repositoryDocs, "llms.txt"), "utf8");
    const links = [...index.matchAll(/\]\(([^)]+)\)/g)].map(
      (match) => match[1]!,
    );
    const pages = (await readdir(repositoryDocs)).filter((file) =>
      /\.mdx?$/.test(file),
    );
    expect(links).toEqual(expect.arrayContaining(pages));
    expect(new Set(links).size).toBe(links.length);
    // The packaged docs add the Tasty and Glaze snapshots under upstream/.
    for (const link of links)
      await expect(
        readFile(join(packageRoot, "docs", link), "utf8"),
      ).resolves.toBeTruthy();
  });

  it("loads a site's theme for tasty:styles and glaze:inspect", async () => {
    const site = await mkdtemp(join(tmpdir(), "cookbook-harness-"));
    fixtures.push(site);
    await writeFile(
      join(site, "docs.config.mjs"),
      `export default {
  site: { title: "Theme" },
  theme: {
    brand: { from: "#2f5bff" },
    palette: { note: { base: "surface", tone: 30, contrast: { wcag: 4.5 } } },
    units: { gutter: "24px" },
  },
};
`,
    );
    const module = pathToFileURL(join(harness, "dev.harnesspm/theme.mjs"));
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `const { theme } = await import(${JSON.stringify(module.href)});
const runtime = globalThis.__tenphiCookbookTastyRuntime;
console.log(JSON.stringify({
  colors: [...theme.resolve().keys()],
  units: Object.keys(runtime.units),
  presets: Object.keys(runtime.presets),
}));`,
      ],
      { cwd: site },
    );
    const result = JSON.parse(stdout) as Record<string, string[]>;
    expect(result.colors).toEqual(
      expect.arrayContaining(["surface", "text", "accent-text", "note"]),
    );
    expect(result.units).toEqual(expect.arrayContaining(["x", "gutter"]));
    expect(result.presets).toEqual(expect.arrayContaining(["h1", "small"]));
  });

  it("lets tasty:styles know the names Cookbook's components define", async () => {
    const site = await mkdtemp(join(tmpdir(), "cookbook-harness-"));
    fixtures.push(site);
    await writeFile(
      join(site, "docs.config.mjs"),
      `export default { site: { title: "Tokens" } };\n`,
    );
    // Tasty's own tool, run as `tasty:styles` runs it.
    const tool = join(
      packageRoot,
      "node_modules/@tenphi/tasty/harness/dev.harnesspm/scripts/styles.mjs",
    );
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        tool,
        JSON.stringify({
          Title: { color: "#callout-text" },
          // Mermaid writes these keys without quotes.
          Diagram: { fill: "$bg", color: "$_line" },
          width: "$copy-button-size",
          fill: "#surfce",
        }),
        "--setup",
        join(harness, "dev.harnesspm/theme.mjs"),
      ],
      { cwd: site },
    );
    expect(stdout).toContain('Color "#surfce" is not in the loaded config');
    for (const name of ["#callout-text", "$copy-button-size", "$bg", "$_line"])
      expect(stdout).not.toContain(`"${name}" is not`);
  });
});
