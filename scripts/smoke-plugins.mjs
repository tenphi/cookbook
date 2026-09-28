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

const root = process.cwd();
const fixture = await mkdtemp(join(root, ".cookbook-plugins-"));
const run = promisify(execFile);
try {
  await symlink(
    join(root, "apps/convention/node_modules"),
    join(fixture, "node_modules"),
    "dir",
  );
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await writeFile(
    join(fixture, "astro.config.mjs"),
    `
import cookbook from "@tenphi/cookbook";
import { unified } from "@astrojs/markdown-remark";
function remarkExtension() {
  return (tree) => {
    function visit(node) {
      if (node.type === "text" && node.value === "EXTENSION_TOKEN") node.value = "Extended by Astro";
      for (const child of node.children ?? []) visit(child);
    }
    visit(tree);
  };
}
export default { base: "/manual/", markdown: { processor: unified({ remarkPlugins: [remarkExtension] }) }, integrations: [cookbook({
  frontmatterSchema: { parse(metadata) { if (metadata.owner && typeof metadata.owner !== "string") throw Error("owner must be text"); return { ...metadata, owner: metadata.owner ?? "maintainers" }; } },
})] };
`,
  );
  await writeFile(
    join(fixture, "docs.config.ts"),
    `export default {
    site: { title: "Extensions", url: "https://example.com" },
    locales: { root: { label: "English", lang: "en" }, fr: { label: "Français" } },
    content: { sources: [{ glob: "docs/**/*.{md,mdx}", base: "docs" }] },
    components: { overrides: { Head: "./Head.astro" } },
  };`,
  );
  await writeFile(
    join(fixture, "Head.astro"),
    `---
import { getCookbookCollection, getCookbookEntry } from "@tenphi/cookbook/content";
const route = Astro.locals.cookbookRoute;
if (route.id === "/guide") {
  if (route.entry.data.owner !== "docs-team") throw Error("custom metadata missing");
  if (getCookbookCollection().some((entry) => entry.frontmatter.draft)) throw Error("draft leaked");
  const copy = getCookbookEntry("/guide"); copy.metadata.owner = "changed";
  if (getCookbookEntry("/guide").metadata.owner !== "docs-team") throw Error("graph is mutable");
}
---
<meta name="consumer-owner" content={route.entry.data.owner ?? "none"} />
`,
  );
  await mkdir(join(fixture, "docs/fr"), { recursive: true });
  const guide =
    "---\nowner: docs-team\n---\n# Guide\n\n> [!TIP]\n> Helpful alert\n\nEXTENSION_TOKEN\n";
  for (const [name, body] of Object.entries({
    index: "# Home\n\n[Guide](/guide/)",
    guide,
    "fr/guide": guide,
    draft: "---\ndraft: true\n---\n# Draft",
    example: "# MDX\n\n> [!WARNING]\n> MDX alert\n",
  }))
    await writeFile(
      join(fixture, `docs/${name}.${name === "example" ? "mdx" : "md"}`),
      body,
    );
  await run(
    process.execPath,
    [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
    {
      cwd: fixture,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  const guideHtml = await readFile(
    join(fixture, "dist/guide/index.html"),
    "utf8",
  );
  assert.match(guideHtml, /cookbook-alert--tip/);
  assert.match(guideHtml, /Helpful alert/);
  assert.match(guideHtml, /Extended by Astro/);
  assert.match(guideHtml, /consumer-owner" content="docs-team/);
  assert.match(
    await readFile(join(fixture, "dist/example/index.html"), "utf8"),
    /cookbook-alert--caution/,
  );
  assert.match(
    await readFile(join(fixture, "dist/fr/guide/index.html"), "utf8"),
    /lang="fr"/,
  );
  console.log(
    "Extension consumer passed: Astro Markdown plugin, Markdown and MDX alerts, metadata schema, content queries, component override, drafts, base path, and locale.",
  );
} finally {
  if (!process.env.COOKBOOK_KEEP_FIXTURE)
    await rm(fixture, { recursive: true, force: true });
  else console.log(`Fixture retained: ${fixture}`);
}
