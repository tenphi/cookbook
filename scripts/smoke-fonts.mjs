import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const root = process.cwd();
const fixture = await mkdtemp(join(root, ".cookbook-fonts-"));
try {
  await symlink(
    join(root, "apps/convention/node_modules"),
    join(fixture, "node_modules"),
    "dir",
  );
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await writeFile(
    join(fixture, "astro.config.mjs"),
    `import cookbook from '@tenphi/cookbook'; if(process.env.COOKBOOK_TEST_OFFLINE) globalThis.fetch = async()=>{throw new Error('Network is forbidden in the offline consumer build');}; export default {base:'/manual/',cacheDir:${JSON.stringify(join(root, "node_modules/.cache/cookbook-font-smoke"))},integrations:[cookbook()]};`,
  );
  const config = (cache) =>
    `export default { theme: {fonts:{body:'Inter',heading:'Newsreader',code:{family:'Local Mono',files:[{src:'/fonts/mono.woff2',weight:'100 800'}]}},fontLoading:{cache:'${cache}'},presets:{heading:{fontWeight:680}}}};`;
  await writeFile(join(fixture, "docs.config.ts"), config("reuse"));
  await mkdir(join(fixture, "public/fonts"), { recursive: true });
  await cp(
    join(
      root,
      "packages/starlight/node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
    ),
    join(fixture, "public/fonts/mono.woff2"),
  );
  await writeFile(
    join(fixture, "README.md"),
    "# Font showcase\n\nRegular body with **strong text** and *real italics*.\n\n## Heading weight 680\n\n```ts\nconst font = true;\n```\n",
  );
  const build = (offline) =>
    promisify(execFile)(
      process.execPath,
      [join(root, "apps/convention/node_modules/astro/bin/astro.mjs"), "build"],
      {
        cwd: fixture,
        env: {
          ...process.env,
          ASTRO_TELEMETRY_DISABLED: "1",
          ...(offline ? { COOKBOOK_TEST_OFFLINE: "1" } : {}),
        },
        maxBuffer: 8 * 1024 * 1024,
      },
    );
  await build(false);
  const readOutput = async () => {
    const paths = await readdir(join(fixture, "dist"), { recursive: true });
    return new Map(
      await Promise.all(
        paths
          .filter((p) => /\.(?:css|woff2)$/.test(p))
          .map(async (p) => [p, await readFile(join(fixture, "dist", p))]),
      ),
    );
  };
  const online = await readOutput();
  const css = [...online]
    .filter(([p]) => p.endsWith(".css"))
    .map(([, b]) => b.toString())
    .join("\n");
  assert.doesNotMatch(css, /fonts\.(?:googleapis|gstatic)\.com/);
  assert.match(css, /font-family:\s*["']?Inter/);
  assert.match(css, /font-family:\s*["']?Newsreader/);
  assert.match(css, /font-weight:\s*400 640/);
  assert.match(css, /font-weight:\s*680 720/);
  assert.match(css, /font-style:\s*italic/);
  assert.match(css, /\/manual\/_cookbook\/fonts\/[a-f0-9]{64}\.woff2/);
  assert.match(css, /\/manual\/fonts\/mono\.woff2/);
  assert.ok([...online.keys()].some((p) => p.startsWith("_cookbook/fonts/")));
  await writeFile(join(fixture, "docs.config.ts"), config("offline"));
  await build(true);
  assert.deepEqual(
    await readOutput(),
    online,
    "Offline CSS and font assets must exactly match the cached build",
  );
  console.log(
    "Font consumer passed: real variable families and italics, preset weights, local font/base paths, self-hosted assets, identical offline rebuild.",
  );
} finally {
  if (process.env.COOKBOOK_KEEP_FIXTURE)
    console.log(`Fixture retained: ${fixture}`);
  else await rm(fixture, { recursive: true, force: true });
}
