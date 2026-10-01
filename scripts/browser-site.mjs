import { URL, pathToFileURL } from "node:url";
import { createServer } from "node:http";
import {
  cp,
  mkdtemp,
  symlink,
  writeFile,
  readFile,
  rm,
  stat,
} from "node:fs/promises";
import { join, extname, resolve, sep } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const root = process.cwd();
const fixture = await mkdtemp(join(root, ".cookbook-browser-"));
const source = join(root, "scripts/fixtures/browser");
const originalConfig = (
  await import(pathToFileURL(join(source, "docs.config.mjs")).href)
).default;
const outputs = new Map();
try {
  for (const name of ["manual", "wide-logo", "tall-logo", "custom-header"]) {
    const site = join(fixture, name);
    await cp(source, site, { recursive: true });
    await symlink(
      join(root, "apps/convention/node_modules"),
      join(site, "node_modules"),
      process.platform === "win32" ? "junction" : "dir",
    );
    await writeFile(join(site, "package.json"), '{"type":"module"}');
    await writeFile(
      join(site, "astro.config.mjs"),
      `import cookbook from "@tenphi/cookbook";export default {base:"/${name}/",integrations:[cookbook()]};`,
    );
    if (name === "custom-header") {
      await writeFile(
        join(site, "Header.astro"),
        "<div data-custom-header>Replacement header</div>",
      );
      await writeFile(
        join(site, "Head.astro"),
        "<title>Replacement head</title>",
      );
      await writeFile(
        join(site, "Hero.astro"),
        `---
import { CodeGroup } from "@tenphi/cookbook/components";
---
<section data-standalone-code-group>
  <CodeGroup items={[{ label: "Example", language: "js", code: "const standalone = true;" }]} />
</section>`,
      );
      const config = globalThis.structuredClone(originalConfig);
      config.components = {
        overrides: {
          Header: "./Header.astro",
          Head: "./Head.astro",
          Hero: "./Hero.astro",
        },
      };
      config.theme.presets = { body: { fontSize: "19px" } };
      config.theme.styles = {
        Pagination: { Link: { radius: "13px" } },
        Sidebar: { Link: { padding: "1x" } },
        Markdown: { Quote: { inlinePadding: "29px start" } },
        MarkdownCodeBlock: { Pre: { radius: "17px" } },
      };
      const guide = join(site, "docs/guide.mdx");
      await writeFile(
        guide,
        `${(await readFile(guide, "utf8")).replace("title: Guide", "title: Guide\nbanner:\n  content: 'Read <a href=\"/custom-header/\">the home page</a>'")}\n> Component-owned quotation.\n`,
      );
      await writeFile(
        join(site, "docs.config.mjs"),
        `export default ${JSON.stringify(config)};`,
      );
    } else if (name !== "manual") {
      const width = name === "wide-logo" ? 96 : 32;
      const height = name === "wide-logo" ? 32 : 96;
      await writeFile(
        join(site, "logo.svg"),
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#315efb"/></svg>`,
      );
      const config = globalThis.structuredClone(originalConfig);
      config.site.title = "Custom documentation";
      delete config.site.versions;
      config.site.logo = { light: "./logo.svg", dark: "./logo.svg" };
      config.theme.presets = {
        h4: {
          fontFamily: "serif",
          fontSize: "28px",
          fontWeight: 500,
          lineHeight: 1.5,
        },
        h5: {
          fontFamily: "serif",
          fontSize: "22px",
          fontWeight: 450,
          lineHeight: 1.6,
        },
        code: { fontSize: "16px", lineHeight: 1.8 },
      };
      config.theme.styles = { SiteLogo: { blockSize: "40px" } };
      await writeFile(
        join(site, "docs.config.mjs"),
        `export default ${JSON.stringify(config)};`,
      );
    }
    await promisify(execFile)(
      process.execPath,
      [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
      {
        cwd: site,
        maxBuffer: 8 * 1024 * 1024,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
      },
    );
    outputs.set(name, join(site, "dist"));
  }
} catch (error) {
  console.error(error.stdout, error.stderr);
  await rm(fixture, { recursive: true, force: true });
  process.exit(1);
}
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".md": "text/markdown",
};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const name = path.split("/")[1];
    const output = outputs.get(name);
    if (!output || !path.startsWith(`/${name}/`)) {
      res.writeHead(404).end();
      return;
    }
    let file = resolve(output, path.slice(name.length + 2));
    if (file !== output && !file.startsWith(`${output}${sep}`)) {
      res.writeHead(404).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.setHeader(
      "content-type",
      types[extname(file)] ?? "application/octet-stream",
    );
    res.setHeader("content-security-policy", "style-src-attr 'none'");
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end("Not found");
  }
});
server.listen(4350, "127.0.0.1", () =>
  console.log("Browser fixture ready at http://127.0.0.1:4350/manual/"),
);
async function stop() {
  server.closeAllConnections();
  server.close();
  await rm(fixture, { recursive: true, force: true });
  process.exit(0);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
