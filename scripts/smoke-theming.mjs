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
    `export default ${JSON.stringify({ site: { title: "Acme", logo: { light: "brand-light.svg", dark: "brand-dark.svg", href: "/showcase", alt: "Acme docs" } }, head: [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: "style-src-attr 'none'" } }], theme: { brand: { from: "#315efb" }, palette: { "review-panel": { base: "surface", tone: "-2", saturation: 0.05 }, "review-ink": { base: "review-panel", tone: 0, contrast: { wcag: [7, 10] } } }, units: { rh: "6px" }, recipes: { "review-panel": { fill: "#review-panel", color: "#review-ink", padding: "2rh", radius: "3px" } }, presets: { "review-label": { fontSize: "19px", fontWeight: 530 } }, styles: { Search: { Dialog: { inlineSize: "max 31rem" } }, SearchResults: { ResultLink: { color: "#review-ink" } }, Markdown: { Quote: { inlinePadding: "29px start" } }, Pagination: { Link: { radius: "13px" } } }, customStyles: { DemoBadge: { Label: { color: "#review-ink", textDecoration: "underline", preset: "review-label" } } } } })};`,
  );
  for (const [variant, color] of [
    ["light", "#224499"],
    ["dark", "#ccddff"],
  ])
    await writeFile(
      join(fixture, `brand-${variant}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 32"><rect width="96" height="32" rx="6" fill="${color}"/></svg>`,
    );
  await mkdir(join(fixture, "docs"));
  await writeFile(join(fixture, "README.md"), "# Theming fixture");
  await writeFile(
    join(fixture, "docs/badge.js"),
    `import {defineComponent} from '@tenphi/cookbook/styling'; export const DemoBadge = defineComponent('DemoBadge',{as:'aside', elements:{Label:'strong'}, styles:{display:'block',recipe:'review-panel',Label:{preset:'h4'}}});`,
  );
  await writeFile(
    join(fixture, "docs/showcase.mdx"),
    `# Component showcase\n\nimport {Preview} from '@tenphi/cookbook/components';\n\nimport {DemoBadge} from './badge.js';\n\n<DemoBadge data-demo-badge><DemoBadge.Label>Review ready</DemoBadge.Label></DemoBadge>\n\n> Custom quotation.\n\n\`\`\`ts\nconst example = true;\n\`\`\`\n\n<Preview title="Isolated example" html="<strong>Example</strong>" css="strong { color: rebeccapurple; }" />\n`,
  );
  const buildSite = () =>
    promisify(execFile)(
      process.execPath,
      [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
      {
        cwd: fixture,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
        maxBuffer: 8 * 1024 * 1024,
      },
    );
  const build = await buildSite();
  assert.doesNotMatch(build.stderr + build.stdout, /\[Tasty\]/);
  const html = await readFile(
    join(fixture, "dist/showcase/index.html"),
    "utf8",
  );
  assert.equal((html.match(/data-tasty-anatomy="SiteLogo"/g) ?? []).length, 2);
  assert.equal((html.match(/class="td-site-logo__light"/g) ?? []).length, 2);
  assert.equal((html.match(/class="td-site-logo__dark"/g) ?? []).length, 2);
  assert.ok(html.includes('width="96" height="32"'));
  assert.match(html, /class="td-header__logo-link" href="\/showcase"/);
  assert.match(html, /class="td-sidebar-heading__home" href="\/showcase"/);
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
  assert.doesNotMatch(html, /<astro-island\b|__tenphiCookbook|__TASTY__/);

  assert.doesNotMatch(html, /<style\b/);
  assert.doesNotMatch(html, /<[a-z][^>]*\sstyle\s*=/i);
  assert.ok(html.includes("td-syntax-keyword"));
  assert.ok(html.includes('sandbox=""'));
  assert.match(css, /blockquote[^{}]*\{[^{}]*padding-inline:\s*29px 0/);
  assert.match(css, /\.pagination-links a[^{}]*\{[^{}]*border-radius:\s*13px/);
  assert.match(css, /site-search dialog[^{}]*\{[^{}]*max-inline-size:\s*31rem/);
  assert.doesNotMatch(
    html,
    /__tenphiCookbookComponentStyles|__tenphiCookbookTastyRuntime/,
  );
  assert.match(css, /--review-label-font-size:\s*19px/);
  const originalConfig = await readFile(
    join(fixture, "docs.config.ts"),
    "utf8",
  );
  const disabledConfig = JSON.parse(
    originalConfig.slice("export default ".length, -1),
  );
  disabledConfig.site.logo = false;
  disabledConfig.search = { enabled: false };
  await writeFile(
    join(fixture, "docs.config.ts"),
    `export default ${JSON.stringify(disabledConfig)};`,
  );
  await buildSite();
  const disabledHtml = await readFile(
    join(fixture, "dist/showcase/index.html"),
    "utf8",
  );
  assert.doesNotMatch(
    disabledHtml,
    /data-tasty-anatomy="(?:SiteLogo|Logo)"|data-open-modal|td-header__logo-link/,
  );
  const showcasePath = join(fixture, "docs/showcase.mdx");
  const showcase = await readFile(showcasePath, "utf8");
  await writeFile(
    join(fixture, "docs/counter.js"),
    `import {createElement, useState} from 'react'; export function Counter() { const [count, setCount] = useState(0); return createElement('button', {onClick: () => setCount(count + 1)}, 'Count: ' + count); }`,
  );
  await writeFile(
    showcasePath,
    showcase +
      "\nimport {Counter} from './counter.js';\n\n<Counter client:load />\n",
  );
  await buildSite();
  const islandHtml = await readFile(
    join(fixture, "dist/showcase/index.html"),
    "utf8",
  );
  assert.match(islandHtml, /<astro-island\b/);
  assert.doesNotMatch(islandHtml, /__tenphiCookbook|__TASTY__/);
  await writeFile(
    showcasePath,
    showcase.replace(
      "<DemoBadge data-demo-badge>",
      "<DemoBadge client:load data-demo-badge>",
    ),
  );
  await assert.rejects(buildSite(), /Cookbook styles are build\/server-only/);
  await writeFile(showcasePath, showcase);
  if (process.env.COOKBOOK_KEEP_FIXTURE) {
    await writeFile(join(fixture, "docs.config.ts"), originalConfig);
    await buildSite();
  }
  console.log(
    "Theming consumer passed: custom semantic colors, custom unit, registered recipe, named component and sub-element override.",
  );
} finally {
  if (!process.env.COOKBOOK_KEEP_FIXTURE)
    await rm(fixture, { recursive: true, force: true });
  else console.log(`Fixture retained: ${fixture}`);
}
