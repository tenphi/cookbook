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
import alerts from "../node_modules/starlight-github-alerts/index.ts";
import links from "../node_modules/starlight-links-validator/index.ts";
export default { base:"/manual/", markdown:{processor:unified()}, integrations:[cookbook({
 frontmatterSchema: {parse(metadata) { if (metadata.owner && typeof metadata.owner !== "string") throw Error("owner must be text"); return {...metadata, owner:metadata.owner ?? "maintainers"}; }},
 plugins:[alerts(), {name:"consumer-metadata",hooks:{"i18n:setup"({injectTranslations}) {injectTranslations({en:{"consumer.label":"Owner"},fr:{"consumer.label":"Équipe"}});}, "config:setup"({addRouteMiddleware}) {
 addRouteMiddleware({entrypoint:"./middleware.ts"});
 }}}]
})]};`,
  );
  await writeFile(
    join(fixture, "middleware.ts"),
    `
import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { getCookbookCollection, getCookbookEntry } from "@tenphi/cookbook/content";
export const onRequest=defineRouteMiddleware(async(context,next)=>{
 const route=context.locals.starlightRoute;
 if (context.url.pathname.includes("guide")) {
  if(route.entry.data.owner!=="docs-team") throw Error("custom metadata missing");
  if(!route.entry.body.includes("Plugin alert")) throw Error("source body missing");
  if(!route.entry.filePath.endsWith("guide.md")) throw Error("source path missing");
  if(getCookbookCollection().some(x=>x.frontmatter.draft)) throw Error("draft leaked");
  if(!getCookbookEntry("/draft")?.frontmatter.draft) throw Error("direct draft lookup missing");
  const copy=getCookbookEntry("/guide");copy.metadata.owner="changed";
  if(getCookbookEntry("/guide").metadata.owner!=="docs-team") throw Error("graph is mutable");
  if (process.env.INVALID_PLUGIN_LINK) route.entry.data.next={label:"Broken",link:"/manual/#does-not-exist"};
  route.head.push({tag:"meta",attrs:{name:"consumer-owner",content:context.locals.t("consumer.label")+": "+route.entry.data.owner}});
 }
 await next();
});`,
  );
  await writeFile(
    join(fixture, "docs.config.ts"),
    `export default {site:{title:"Plugins",url:"https://example.com"},locales:{root:{label:"English",lang:"en"},fr:{label:"Français"}},content:{sources:[{glob:"docs/**/*.{md,mdx}",base:"docs"}]}};`,
  );
  await mkdir(join(fixture, "docs/fr"), { recursive: true });
  const guide =
    "---\nowner: docs-team\nnext:\n  link: /manual/\n  label: Home\n---\n# Guide\n\n> [!TIP]\n> Plugin alert\n\n[Home](/)\n";
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
  const build = (extraEnv = {}) =>
    run(
      process.execPath,
      [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
      {
        cwd: fixture,
        env: { ...process.env, ...extraEnv, ASTRO_TELEMETRY_DISABLED: "1" },
        maxBuffer: 8 * 1024 * 1024,
      },
    );
  await build();
  const html = await readFile(join(fixture, "dist/guide/index.html"), "utf8");
  assert.match(html, /starlight-aside--tip/);
  assert.match(html, /Owner: docs-team/);
  assert.match(
    await readFile(join(fixture, "dist/fr/guide/index.html"), "utf8"),
    /Équipe: docs-team/,
  );
  assert.match(
    await readFile(join(fixture, "dist/example/index.html"), "utf8"),
    /starlight-aside--caution/,
  );
  // Known incompatible combinations must fail with an actionable explanation.
  const configPath = join(fixture, "astro.config.mjs");
  const config = await readFile(configPath, "utf8");
  await writeFile(
    configPath,
    config.replace("plugins:[alerts(),", "plugins:[links(),alerts(),"),
  );
  await assert.rejects(build(), /starlight-links-validator assumes physical/);
  await writeFile(
    configPath,
    config.replace("markdown:{processor:unified()},", ""),
  );
  await assert.rejects(build(), /starlight-github-alerts is not compatible/);
  console.log(
    "Plugin consumer passed: real alerts in Markdown/MDX, incompatible plugin errors, metadata/schema, source text, immutable content queries, drafts, base, and i18n middleware.",
  );
} finally {
  if (!process.env.COOKBOOK_KEEP_FIXTURE)
    await rm(fixture, { recursive: true, force: true });
  else console.log(`Fixture retained: ${fixture}`);
}
