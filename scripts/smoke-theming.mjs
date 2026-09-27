import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  symlink,
  rm,
} from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
const root = process.cwd();
const fixture = await mkdtemp(join(root, ".cookbook-theme-"));
try {
  await symlink(
    join(root, "apps/convention/node_modules"),
    join(fixture, "node_modules"),
    "dir",
  );
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await writeFile(
    join(fixture, "astro.config.mjs"),
    'import cookbook from "@tenphi/cookbook"; export default {integrations:[cookbook()]};',
  );
  await writeFile(
    join(fixture, "docs.config.ts"),
    `export default ${JSON.stringify({ theme: { brand: { from: "#315efb" }, palette: { "review-panel": { base: "surface", tone: "-2", saturation: 0.05 }, "review-ink": { base: "review-panel", tone: 0, contrast: { wcag: [7, 10] } } }, units: { rh: "6px" }, recipes: { "review-panel": { fill: "#review-panel", color: "#review-ink", padding: "2rh", radius: "3px" } }, customStyles: { DemoBadge: { Label: { color: "#review-ink" } } } } })};`,
  );
  await mkdir(join(fixture, "docs"));
  await writeFile(join(fixture, "README.md"), "# Theming fixture");
  await writeFile(
    join(fixture, "docs/badge.js"),
    `import {defineComponent} from '@tenphi/cookbook/styling'; export const DemoBadge = defineComponent('DemoBadge',{as:'aside', elements:{Label:'strong'}, styles:{display:'block',recipe:'review-panel',Label:{$:'> strong',preset:'h4'}}});`,
  );
  await writeFile(
    join(fixture, "docs/showcase.mdx"),
    `# Component showcase\n\nimport {DemoBadge} from './badge.js';\n\n<DemoBadge client:load data-demo-badge><DemoBadge.Label>Review ready</DemoBadge.Label></DemoBadge>\n`,
  );
  await promisify(execFile)(
    process.execPath,
    [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
    {
      cwd: fixture,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  const html = await readFile(
    join(fixture, "dist/showcase/index.html"),
    "utf8",
  );
  assert.ok(html.includes("Review ready"));
  assert.ok(html.includes("data-demo-badge"));
  const paths = await readdir(join(fixture, "dist"), { recursive: true });
  const css = (
    await Promise.all(
      paths
        .filter((path) => path.endsWith(".css"))
        .map((path) => readFile(join(fixture, "dist", path), "utf8")),
    )
  ).join("\n");
  assert.ok(css.includes("--review-ink-color"));
  assert.match(css, /padding:\s*(?:calc\(2\s*\*\s*6px\)|12px)/);
  assert.match(css, /border-radius:\s*3px/);
  for (const tag of ["astro-island", "astro-slot", "astro-static-slot"])
    assert.match(css, new RegExp(`${tag}[^{}]*\\{[^{}]*display:\\s*contents`));
  assert.doesNotMatch(html, /<style\b/);
  console.log(
    "Theming consumer passed: custom semantic colors, custom unit, registered recipe, named component and sub-element override.",
  );
} finally {
  if (!process.env.COOKBOOK_KEEP_FIXTURE)
    await rm(fixture, { recursive: true, force: true });
  else console.log(`Fixture retained: ${fixture}`);
}
