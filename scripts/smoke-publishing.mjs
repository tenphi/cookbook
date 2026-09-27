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
const fixture = await mkdtemp(join(root, ".cookbook-publishing-"));
try {
  await symlink(
    join(root, "apps/convention/node_modules"),
    join(fixture, "node_modules"),
    "dir",
  );
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await writeFile(
    join(fixture, "astro.config.mjs"),
    'import cookbook from "@tenphi/cookbook";export default {site:"https://docs.example.com",base:"/manual/",integrations:[cookbook()]};',
  );
  const config = {
    site: {
      title: "Acme",
      versions: [
        { label: "Current", routeBase: "/" },
        { label: "v1", routeBase: "/v1", index: false },
      ],
      seo: {
        breadcrumbs: true,
        image: {
          src: "/social.svg",
          alt: "Acme docs",
          width: 1200,
          height: 630,
        },
      },
    },
    locales: {
      root: { label: "English", lang: "en" },
      fr: { label: "Français" },
    },
    content: { sources: [{ glob: "docs/**/*.{md,mdx}", base: "docs" }] },
  };
  const writeConfig = () =>
    writeFile(
      join(fixture, "docs.config.ts"),
      `export default ${JSON.stringify(config)};`,
    );
  await writeConfig();
  await mkdir(join(fixture, "docs/fr/v1"), { recursive: true });
  await mkdir(join(fixture, "docs/v1"), { recursive: true });
  await mkdir(join(fixture, "public"));
  await writeFile(
    join(fixture, "public/social.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"></svg>',
  );
  for (const [name, body] of Object.entries({
    index: "# Acme",
    guide: "# Guide\n\nA useful guide.\n\n## Setup\n\n```js\nconst x=1;\n```",
    "fr/guide": "# Guide français",
    "v1/index": "# Old home",
    "v1/guide": "# Old guide",
    "fr/v1/guide": "# Ancien guide",
    draft: "---\ndraft: true\n---\n# Draft",
    alias:
      "---\nseo:\n  canonical: https://docs.example.com/manual/guide/\n---\n# Duplicate",
    hidden: "---\nseo:\n  index: false\n  image: false\n---\n# No index",
    component:
      'import { Card } from "@tenphi/cookbook/components";\n\n# MDX reader\n\n<Card title="Details">Readable prose</Card>\n',
  }))
    await writeFile(
      join(fixture, `docs/${name}.${name === "component" ? "mdx" : "md"}`),
      body,
    );
  const build = () =>
    promisify(execFile)(
      process.execPath,
      [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
      {
        cwd: fixture,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
        maxBuffer: 8 * 1024 * 1024,
      },
    );
  await build();
  const windows = [];
  const page = async (route) => {
    const w = new Window();
    windows.push(w);
    w.document.write(
      await readFile(
        join(fixture, `dist/${route ? route + "/" : ""}index.html`),
        "utf8",
      ),
    );
    return w.document;
  };
  const home = await page("");
  assert.equal(home.title, "Acme");
  const guide = await page("guide");
  assert.equal(guide.title, "Guide | Acme");
  assert.equal(
    guide.querySelector("link[rel=canonical]").href,
    "https://docs.example.com/manual/guide/",
  );
  assert.equal(
    guide.querySelector('meta[property="og:image"]').content,
    "https://docs.example.com/manual/social.svg",
  );
  assert.equal(
    guide.querySelector('meta[name="twitter:card"]').content,
    "summary_large_image",
  );
  assert.equal(
    JSON.parse(
      guide.querySelector('script[type="application/ld+json"]').textContent,
    ).itemListElement.at(-1).item,
    "https://docs.example.com/manual/guide/",
  );
  const manifest = JSON.parse(
    await readFile(join(fixture, "dist/_cookbook/publishing.json"), "utf8"),
  );
  assert.ok(!manifest.pages.some((p) => p.route === "/draft"));
  const markdown = guide
    .querySelector('link[type="text/markdown"]')
    .getAttribute("href");
  assert.equal(
    guide.querySelector("[data-copy-page]").getAttribute("data-copy-page"),
    markdown,
  );
  const text = await readFile(
    join(fixture, "dist", markdown.slice("/manual/".length)),
    "utf8",
  );
  assert.match(
    text,
    /canonical: "https:\/\/docs.example.com\/manual\/guide\/"/,
  );
  assert.match(text, /const x=1/);
  assert.match(text, /language: "en"/);
  const mdx = manifest.pages.find((p) => p.route === "/component");
  const mdxText = await readFile(
    join(fixture, "dist", mdx.markdown.slice(8)),
    "utf8",
  );
  assert.match(mdxText, /Readable prose/);
  assert.ok(!mdxText.includes("import {") && !mdxText.includes("<Card"));
  for (const route of ["v1/guide", "fr/v1/guide", "hidden", "draft"]) {
    const doc = await page(route);
    assert.equal(
      doc.querySelector("meta[name=robots]").content,
      "noindex, follow",
    );
    assert.ok(!doc.querySelector("link[hreflang]"));
  }
  assert.ok(
    (await page("fr/v1/guide")).querySelector(
      'summary[aria-label="Version de la documentation: v1"]',
    ),
  );
  assert.equal(
    (await page("hidden")).querySelector('meta[name="twitter:card"]').content,
    "summary",
  );
  assert.ok(!(await page("draft")).querySelector("[data-copy-page]"));
  const sitemap = await readFile(join(fixture, "dist/sitemap-0.xml"), "utf8");
  const llms = await readFile(join(fixture, "dist/llms.txt"), "utf8");
  for (const route of ["v1/guide", "hidden", "draft", "alias"]) {
    assert.ok(!sitemap.includes(`/manual/${route}/`));
    assert.ok(!llms.includes(`/manual/${route}/`));
  }
  assert.ok(sitemap.includes("/manual/fr/guide/"));
  assert.match(llms, /\[Markdown\]/);
  assert.equal(manifest.pages.find((p) => p.route === "/alias").sitemap, false);
  assert.ok(
    guide.querySelector('a[href="/manual/v1/guide"]'),
    "non-indexed versions stay in navigation",
  );
  config.site.seo.index = false;
  config.site.seo.titleTemplate = "{title} — {site}";
  await writeConfig();
  await build();
  const preview = await page("guide");
  assert.equal(preview.title, "Guide — Acme");
  assert.equal(
    preview.querySelector("meta[name=robots]").content,
    "noindex, follow",
  );
  assert.ok(!preview.querySelector("link[rel=sitemap]"));
  assert.ok(!preview.querySelector("link[hreflang]"));
  assert.ok(
    !(await readFile(join(fixture, "dist/llms.txt"), "utf8")).includes(
      "[Guide]",
    ),
  );
  assert.ok(
    JSON.parse(
      await readFile(join(fixture, "dist/_cookbook/publishing.json"), "utf8"),
    ).pages.every((p) => !p.index && !p.sitemap),
  );
  await Promise.all(windows.map((w) => w.happyDOM.close()));
  console.log(
    "Publishing consumer passed: Astro site/base, titles, images, breadcrumbs, canonicals, locale/version indexing, drafts, preview mode, Markdown/copy links, and clean MDX text.",
  );
} finally {
  if (!process.env.COOKBOOK_KEEP_FIXTURE)
    await rm(fixture, { recursive: true, force: true });
  else console.log(`Fixture retained: ${fixture}`);
}
