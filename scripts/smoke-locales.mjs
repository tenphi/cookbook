import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  symlink,
  rm,
} from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { Window } from "happy-dom";
const root = process.cwd();
const fixture = await mkdtemp(join(root, ".cookbook-locales-"));
try {
  await symlink(
    join(root, "apps/convention/node_modules"),
    join(fixture, "node_modules"),
    "dir",
  );
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await writeFile(
    join(fixture, "astro.config.mjs"),
    'import cookbook from "@tenphi/cookbook"; export default {base:"/manual/",integrations:[cookbook()]};',
  );
  await writeFile(
    join(fixture, "docs.config.ts"),
    `export default ${JSON.stringify({ site: { title: "Locale fixture", url: "https://docs.example.com" }, locales: { root: { label: "English", lang: "en" }, fr: { label: "Français" } }, defaultLocale: "root", translations: { fr: { appearance: "Présentation" } }, navigation: ["/", "/guide", "/only-en"], content: { sources: [{ glob: "docs/**/*.md", base: "docs" }] } })};`,
  );
  await mkdir(join(fixture, "docs/fr"), { recursive: true });
  for (const [path, body] of Object.entries({
    index: "# Home",
    guide: "# English guide",
    "only-en": "# English only",
    "fr/guide":
      "# Guide français\n\n## Installation\n\n```js\nconst a = 1;\n```",
    "fr/draft": "---\ndraft: true\n---\n# Draft",
  }))
    await writeFile(join(fixture, `docs/${path}.md`), body);
  await promisify(execFile)(
    process.execPath,
    [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
    {
      cwd: fixture,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  const window = new Window();
  const html = await readFile(
    join(fixture, "dist/fr/guide/index.html"),
    "utf8",
  );
  window.document.write(html);
  assert.ok(!html.includes("/fr/fr/"));
  assert.ok(html.includes('aria-label="Présentation"'));
  assert.ok(html.includes('aria-label="Fermer la navigation"'));
  const sidebar = window.document.querySelector("cookbook-sidebar");
  assert.deepEqual(
    [...sidebar.querySelectorAll("a")].map((a) => a.getAttribute("href")),
    ["/manual/fr/guide"],
  );
  const alternates = [
    ...window.document.querySelectorAll('link[rel="alternate"][hreflang]'),
  ].map((a) => [a.getAttribute("hreflang"), a.getAttribute("href")]);
  assert.deepEqual(alternates, [
    ["en", "https://docs.example.com/manual/guide/"],
    ["fr", "https://docs.example.com/manual/fr/guide/"],
    ["x-default", "https://docs.example.com/manual/guide/"],
  ]);
  assert.equal(
    window.document.querySelector(".site-title").getAttribute("href"),
    "/manual/",
  );
  assert.deepEqual(
    [
      ...window.document.querySelectorAll("cookbook-language-select select"),
    ][0].querySelectorAll("option").length,
    2,
  );
  const english = new Window();
  english.document.write(
    await readFile(join(fixture, "dist/only-en/index.html"), "utf8"),
  );
  assert.ok(!english.document.querySelector('link[hreflang="fr"]'));
  assert.equal(
    english.document
      .querySelector("cookbook-language-select option:nth-child(2)")
      .getAttribute("value"),
    "/manual/only-en/",
  );
  await window.happyDOM.close();
  await english.happyDOM.close();
  const sitemap = await readFile(join(fixture, "dist/sitemap-0.xml"), "utf8");
  assert.ok(sitemap.includes('hreflang="fr"'));
  assert.ok(!sitemap.includes("/fr/only-en/"));
  // Repeat with a prefixed default language and sectioned navigation.
  await writeFile(
    join(fixture, "docs.config.ts"),
    `export default ${JSON.stringify({
      site: { title: "Locale fixture", url: "https://docs.example.com" },
      locales: { en: { label: "English" }, fr: { label: "Français" } },
      defaultLocale: "en",
      translations: { fr: { "navigation.Guide": "Manuel" } },
      navigation: {
        tabs: [
          {
            label: "Guide",
            link: "/en/guide",
            items: ["/en", "/en/guide", "/en/only-en"],
          },
        ],
      },
      content: {
        sources: [
          { glob: "docs/*.md", base: "docs", routeBase: "/en" },
          { glob: "docs/fr/*.md", base: "docs" },
        ],
      },
    })};`,
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
  const prefixed = new Window();
  prefixed.document.write(
    await readFile(join(fixture, "dist/fr/guide/index.html"), "utf8"),
  );
  assert.equal(
    prefixed.document
      .querySelector('.td-top-tabs a[aria-current="page"]')
      .textContent.trim(),
    "Manuel",
  );
  assert.equal(
    prefixed.document.querySelector(".site-title").getAttribute("href"),
    "/manual/en",
  );
  assert.equal(
    prefixed.document.querySelector('link[hreflang="en"]').getAttribute("href"),
    "https://docs.example.com/manual/en/guide/",
  );
  assert.ok(!prefixed.document.documentElement.outerHTML.includes("/fr/fr/"));
  await prefixed.happyDOM.close();
  console.log(
    "Locale consumer passed: base paths, one locale prefix, localized navigation and UI, real alternate URLs, missing translations, missing locale home, and drafts.",
  );
} finally {
  if (!process.env.COOKBOOK_KEEP_FIXTURE)
    await rm(fixture, { recursive: true, force: true });
  else console.log(`Fixture retained: ${fixture}`);
}
