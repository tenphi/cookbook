import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Keep linked workspace dependencies under the same filesystem ancestor.
// Packed installations are exercised separately by check:install.
const temporary = await mkdtemp(join(workspace, ".cookbook-dev-"));
const app = join(temporary, "site");
const content = join(temporary, "content");
let child;
let logs = "";
let origin;
async function write(path, body) {
  const target = join(content, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, body);
}
async function waitFor(path, expected, status = 200) {
  const start = Date.now();
  let last = "";
  while (Date.now() - start < 30_000) {
    if (child.exitCode !== null)
      throw new Error(`Development server exited: ${logs}`);
    try {
      const response = await globalThis.fetch(`${origin}${path}`);
      last = await response.text();
      if (response.status === status && (!expected || last.includes(expected)))
        return last;
    } catch {
      /* Wait for startup or a configuration restart. */
    }
    await delay(150);
  }
  throw new Error(
    `Timed out waiting for ${path}: ${last.slice(0, 500)}\n${logs}`,
  );
}
try {
  await mkdir(app);
  await symlink(
    join(workspace, "apps/convention/node_modules"),
    join(app, "node_modules"),
    "dir",
  );
  await writeFile(join(app, "package.json"), '{"type":"module"}\n');
  await writeFile(
    join(app, "astro.config.mjs"),
    'import cookbook from "@tenphi/cookbook"; export default { integrations: [cookbook()] };\n',
  );
  const config = (title) =>
    `export default {root: "../content", site: {title: ${JSON.stringify(title)}}, redirects: { "/old-guide": "/guide" }};\n`;
  await writeFile(join(app, "docs.config.ts"), config("Development fixture"));
  await write("README.md", "# Initial home\n\n[Guide](./docs/guide.md)\n");
  await write("docs/guide.md", "# Initial guide\n");
  child = spawn(
    process.execPath,
    [
      join(workspace, "apps/convention/node_modules/astro/bin/astro.mjs"),
      "dev",
      "--host",
      "127.0.0.1",
      "--port",
      "0",
    ],
    {
      cwd: app,
      env: {
        ...process.env,
        ASTRO_DEV_BACKGROUND: "1",
        ASTRO_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (chunk) => {
      logs += chunk;
    });
  const started = Date.now();
  while (!origin && Date.now() - started < 30_000) {
    if (child.exitCode !== null) throw new Error(logs);
    origin = /http:\/\/127\.0\.0\.1:\d+/.exec(logs)?.[0];
    await delay(100);
  }
  if (!origin) throw new Error(`No development URL: ${logs}`);
  await waitFor("/", "Initial home");
  await write("docs/guide.md", "# Edited guide\n");
  await waitFor("/guide/", "Edited guide");
  await write("docs/new.md", "# Added page\n");
  await waitFor("/new/", "Added page");
  await rm(join(content, "docs/new.md"));
  await waitFor("/new/", "", 404);
  await write("docs/guide.md", "# Broken guide\n\n[Missing](./absent.md)\n");
  await waitFor("/guide/", "", 500);
  await write("docs/guide.md", "# Recovered guide\n");
  await waitFor("/guide/", "Recovered guide");
  await writeFile(join(app, "docs.config.ts"), config("Changed site title"));
  await waitFor("/", "Changed site title");
  const redirect = await globalThis.fetch(`${origin}/old-guide/`, {
    redirect: "manual",
  });
  assert.ok(
    [301, 302, 307, 308].includes(redirect.status),
    `Expected a redirect, received ${redirect.status}`,
  );
  assert.ok(redirect.headers.get("location")?.includes("/guide"));
  await write(
    "docs/guide.md",
    "---\naliases: [/renamed-guide]\n---\n# Recovered guide\n",
  );
  await waitFor("/renamed-guide/", "Recovered guide");
  const alias = await globalThis.fetch(`${origin}/renamed-guide/`, {
    redirect: "manual",
  });
  assert.equal(alias.status, 301);
  assert.ok(alias.headers.get("location")?.includes("/guide"));
  await write("docs/live.mdx", "# Live MDX\n\n[Next](./next.mdx)\n");
  await write("docs/next.mdx", "# Next MDX\n");
  await writeFile(
    join(app, "docs.config.ts"),
    `export default ${JSON.stringify({
      root: "../content",
      content: {
        sources: [
          { id: "v1", glob: "docs/*.mdx", base: "docs", routeBase: "/v1" },
          { id: "v2", glob: "docs/*.mdx", base: "docs", routeBase: "/v2" },
        ],
      },
    })};\n`,
  );
  await waitFor("/v1/live/", 'href="/v1/next"');
  await waitFor("/v2/live/", 'href="/v2/next"');
  await write("docs/live.mdx", "# Edited MDX\n\n[Next](./next.mdx)\n");
  await waitFor("/v2/live/", "Edited MDX");
  assert.ok(!logs.includes("Failed to resolve dependency"), logs);
  const stopped = new Promise((done) => child.once("exit", done));
  child.kill("SIGTERM");
  await stopped;
  child = undefined;
  await write(
    "docs/live.mdx",
    "---\naliases: [previous]\n---\n# Published MDX\n",
  );
  await writeFile(
    join(app, "astro.config.mjs"),
    'import cookbook from "@tenphi/cookbook"; export default { base: "/manual/", integrations: [cookbook()] };\n',
  );
  await promisify(execFile)(
    process.execPath,
    [
      join(workspace, "apps/convention/node_modules/astro/bin/astro.mjs"),
      "build",
    ],
    {
      cwd: app,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  const staticRedirect = await readFile(
    join(app, "dist/v2/previous/index.html"),
    "utf8",
  );
  assert.match(staticRedirect, /http-equiv="refresh"/);
  assert.ok(staticRedirect.includes("/manual/v2/live"));
  console.log(
    "Development smoke passed: startup, config discovery, external content root, edits, additions, removals, error recovery, config reload, live aliases, repeated MDX mounts, and static redirects under a URL base.",
  );
} finally {
  if (child && child.exitCode === null) {
    const stopped = new Promise((done) => child.once("exit", done));
    child.kill("SIGTERM");
    await stopped;
  }
  await rm(temporary, { recursive: true, force: true });
}
