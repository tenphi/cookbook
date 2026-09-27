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
const fixture = await mkdtemp(join(root, ".cookbook-authoring-"));
try {
  await symlink(
    join(root, "apps/convention/node_modules"),
    join(fixture, "node_modules"),
    "dir",
  );
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await writeFile(
    join(fixture, "astro.config.mjs"),
    `import cookbook from "@tenphi/cookbook";export default {site:"https://docs.example.com",base:"/manual/",markdown:{shikiConfig:{langs:[{name:"acme",scopeName:"source.acme",patterns:[{match:"HELLO",name:"keyword.control.acme"}]}],transformers:[{name:"acme-marker",pre(node){this.addClassToHast(node,"acme-highlight")}}]}},integrations:[cookbook()]};`,
  );
  const config = {
    site: { title: "Authoring" },
    tableOfContents: { mobile: true },
    content: {
      sources: [
        { glob: "docs/**/*.{md,mdx}", base: "docs" },
        { openapi: "api.json", routeBase: "/api" },
      ],
    },
  };
  const writeConfig = () =>
    writeFile(
      join(fixture, "docs.config.ts"),
      `export default ${JSON.stringify(config)};`,
    );
  await writeConfig();
  await mkdir(join(fixture, "docs"));
  await writeFile(
    join(fixture, "docs/hero.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240"><rect width="720" height="240" fill="blue"/></svg>',
  );
  await writeFile(
    join(fixture, "docs/index.mdx"),
    '---\ntitle: Authoring\nhero:\n  image:\n    file: ./hero.svg\n    alt: Wide preview\n---\nimport {CodeGroup} from "@tenphi/cookbook/components";\n\n## Installation\n\n<CodeGroup items={[{label:"Custom",language:"acme",code:"HELLO world"},{label:"JavaScript",language:"js",code:"const answer = 42"}]} />\n\n## Usage\n\n```acme\nHELLO fence\n```\n',
  );
  await writeFile(
    join(fixture, "docs/quiet.md"),
    "---\ntitle: Quiet\ntableOfContents:\n  mobile: false\n---\n## First\n\nWords.\n\n## Second\n",
  );
  await writeFile(
    join(fixture, "api.json"),
    JSON.stringify({
      openapi: "3.1.0",
      info: { title: "Acme API", version: "1" },
      security: [{ Token: [] }],
      components: {
        securitySchemes: { Token: { type: "http", scheme: "bearer" } },
        examples: { Result: { value: { id: 0 } } },
      },
      paths: {
        "/items/{id}": {
          parameters: [
            { name: "id", in: "path", required: true, description: "Default" },
          ],
          get: {
            operationId: "getItem",
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                description: "Override",
                example: 0,
              },
            ],
            responses: {
              200: {
                description: "OK",
                content: {
                  "application/json": {
                    examples: {
                      result: { $ref: "#/components/examples/Result" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
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
  const w = new Window();
  w.document.write(await readFile(join(fixture, "dist/index.html"), "utf8"));
  const doc = w.document;
  const hero = doc.querySelector('img[alt="Wide preview"]');
  assert.equal(hero.getAttribute("width"), "720");
  assert.equal(hero.getAttribute("height"), "240");
  assert.equal(hero.getAttribute("fetchpriority"), "high");
  assert.ok(hero.getAttribute("src").startsWith("/manual/"));
  assert.equal(doc.querySelectorAll("pre.acme-highlight").length, 3);
  assert.equal(doc.querySelectorAll(".td-syntax-keyword").length, 3);
  assert.equal(
    doc.querySelectorAll("cookbook-code-block [data-copy-code]").length,
    3,
  );
  assert.ok(doc.querySelector('cookbook-mobile-toc a[href="#usage"]'));
  assert.ok(!doc.querySelector("[style]"));
  assert.ok(
    !(await readFile(join(fixture, "dist/quiet/index.html"), "utf8")).includes(
      'data-tasty-anatomy="MobileTableOfContents"',
    ),
  );
  const apiWindow = new Window();
  apiWindow.document.write(
    await readFile(join(fixture, "dist/api/get-item/index.html"), "utf8"),
  );
  const api = apiWindow.document;
  const article = api.querySelector(".sl-markdown-content").textContent;
  for (const text of ["HTTP bearer", "Override", "Example: result"])
    assert.ok(article.includes(text));
  assert.equal(api.querySelectorAll("tbody tr").length, 1);
  assert.ok(api.querySelector('a[href="/manual/api"]'));
  assert.ok(!api.querySelector("[style]"));
  await apiWindow.happyDOM.close();
  config.tableOfContents = false;
  await writeConfig();
  await build();
  assert.ok(
    !(await readFile(join(fixture, "dist/index.html"), "utf8")).includes(
      'data-tasty-anatomy="MobileTableOfContents"',
    ),
  );
  config.tableOfContents = { mobile: true };
  await writeConfig();
  if (process.env.COOKBOOK_KEEP_FIXTURE) await build();
  await w.happyDOM.close();
  console.log(
    "Authoring consumer passed: shared custom highlighting, code copy, optional mobile contents, non-square hero dimensions and base paths.",
  );
} finally {
  if (!process.env.COOKBOOK_KEEP_FIXTURE)
    await rm(fixture, { recursive: true, force: true });
  else console.log(`Fixture retained: ${fixture}`);
}
