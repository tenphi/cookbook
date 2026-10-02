import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
const root = process.cwd();
const fixture = await mkdtemp(join(root, ".cookbook-recipes-"));
const run = (entry, args = []) =>
  promisify(execFile)(process.execPath, [join(root, entry), ...args], {
    cwd: fixture,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    maxBuffer: 8 * 1024 * 1024,
  });
const defaultAstro =
  'import cookbook from "@tenphi/cookbook";export default {base:"/manual/",integrations:[cookbook()]};';
try {
  await symlink(
    join(root, "apps/convention/node_modules"),
    join(fixture, "node_modules"),
    "dir",
  );
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await mkdir(join(fixture, "docs/fr"), { recursive: true });
  await mkdir(join(fixture, "public/fonts"), { recursive: true });
  for (const [path, title] of Object.entries({
    index: "Home",
    guide: "Guide",
    "fr/index": "Accueil",
    "fr/guide": "Guide français",
  }))
    await writeFile(
      join(fixture, `docs/${path}.md`),
      `# ${title}\n\n## Installation\n\n> [!NOTE]\n> A verified recipe.\n\n## Usage\n\nWords.\n`,
    );
  await writeFile(
    join(fixture, "public/logo.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect width="120" height="40" fill="currentColor"/></svg>',
  );
  await cp(
    join(
      root,
      "packages/renderer/node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
    ),
    join(fixture, "public/fonts/acme.woff2"),
  );
  const recipes = [];
  for (const path of [
    "docs/examples.md",
    "docs/recipes.md",
    "docs/plugins.md",
  ]) {
    const source = await readFile(join(root, path), "utf8");
    for (const match of source.matchAll(
      /^```(ts|js) cookbook-verify=([a-z-]+)\n([\s\S]*?)^```/gm,
    )) {
      const [, language, id, code] = match;
      assert.ok(
        !recipes.some((recipe) => recipe.id === id),
        `Duplicate recipe: ${id}`,
      );
      recipes.push({ id, code, astro: language === "js" });
      await writeFile(join(fixture, `${id}.${language}`), code);
    }
  }
  assert.equal(
    recipes.length,
    8,
    "Every documented verified recipe must remain covered",
  );
  await writeFile(
    join(fixture, "tsconfig.json"),
    JSON.stringify({
      extends: "../tsconfig.base.json",
      compilerOptions: { noEmit: true, allowJs: true, checkJs: true },
      include: recipes.map(({ id, astro }) => `${id}.${astro ? "js" : "ts"}`),
    }),
  );
  await run("node_modules/typescript/bin/tsc", ["-p", "tsconfig.json"]);
  for (const { id, code, astro } of recipes) {
    await writeFile(
      join(fixture, "astro.config.mjs"),
      astro ? code : defaultAstro,
    );
    await writeFile(
      join(fixture, "docs.config.ts"),
      astro
        ? 'export default {site:{title:"Plugin recipe",url:"https://docs.example.com"}};'
        : code,
    );
    try {
      await run("packages/facade/dist/cli.js", ["doctor"]);
      await run("apps/convention/node_modules/astro/bin/astro.mjs", ["build"]);
      await run("packages/facade/dist/cli.js", ["check-build"]);
      const html = await readFile(join(fixture, "dist/index.html"), "utf8");
      if (id === "branding") assert.match(html, /data-element="SiteLogo"/);
      if (id === "preview") {
        assert.match(html, /noindex/);
        assert.ok(!html.includes('data-element="PageActions"'));
      }
      if (id === "locales")
        assert.match(
          await readFile(join(fixture, "dist/fr/guide/index.html"), "utf8"),
          /Présentation/,
        );
      if (id === "github-alerts")
        assert.ok(
          html.includes("cookbook-alert--note"),
          "Cookbook must render the note with its Tasty styles",
        );
      if (id === "local-font")
        assert.ok(
          (await readFile(join(fixture, "dist/fonts/acme.woff2"))).byteLength >
            0,
        );
      console.log(`Verified documented recipe: ${id}`);
    } catch (error) {
      throw new Error(
        `Documented recipe ${id} failed:\n${error.stdout ?? ""}\n${error.stderr ?? ""}`,
        { cause: error },
      );
    }
  }
} finally {
  await rm(fixture, { recursive: true, force: true });
}
