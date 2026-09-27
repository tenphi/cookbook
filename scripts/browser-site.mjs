import { URL } from "node:url";
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
await cp(join(root, "scripts/fixtures/browser"), fixture, { recursive: true });
await symlink(
  join(root, "apps/convention/node_modules"),
  join(fixture, "node_modules"),
  process.platform === "win32" ? "junction" : "dir",
);
await writeFile(join(fixture, "package.json"), '{"type":"module"}');
await writeFile(
  join(fixture, "astro.config.mjs"),
  'import cookbook from "@tenphi/cookbook";export default {base:"/manual/",integrations:[cookbook()]};',
);
try {
  await promisify(execFile)(
    process.execPath,
    [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
    {
      cwd: fixture,
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    },
  );
} catch (error) {
  console.error(error.stdout, error.stderr);
  await rm(fixture, { recursive: true, force: true });
  process.exit(1);
}
const output = join(fixture, "dist");
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
    if (!path.startsWith("/manual/")) {
      res.writeHead(404).end();
      return;
    }
    let file = resolve(output, path.slice("/manual/".length));
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
