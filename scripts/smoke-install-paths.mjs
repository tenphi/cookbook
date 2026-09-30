import spawn from "cross-spawn";
import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join, sep } from "node:path";
import { checkStyleLinting } from "./smoke-style-linting.mjs";

// cross-spawn handles Windows .cmd launchers and argument quoting without
// executing arbitrary test arguments through a shell.
const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "",
      stderr = "";
    const collect = (target, chunk) => {
      if (target === "stdout") stdout += chunk;
      else stderr += chunk;
      if (
        stdout.length + stderr.length >
        (options.maxBuffer ?? 8 * 1024 * 1024)
      )
        child.kill();
    };
    child.stdout.on("data", (chunk) => collect("stdout", chunk));
    child.stderr.on("data", (chunk) => collect("stderr", chunk));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve({ stdout, stderr })
        : reject(
            Object.assign(new Error(`${command} exited ${code}: ${stderr}`), {
              stdout,
              stderr,
              code,
            }),
          ),
    );
  });
const manager = process.env.COOKBOOK_TEST_MANAGER ?? "npm";
if (!["npm", "pnpm", "yarn"].includes(manager))
  throw Error(`Unsupported test manager ${manager}`);
const runManager = (args, options) =>
  manager === "yarn"
    ? run("corepack", ["yarn", ...args], options)
    : run(manager, args, options);

const root = process.cwd();
const temporary = await mkdtemp(join(tmpdir(), "cookbook-install-"));
const packed = join(temporary, "packed");
const site = join(temporary, "site");

try {
  await mkdir(packed, { recursive: true });
  await mkdir(site, { recursive: true });
  for (const directory of ["docs", "renderer", "facade", "create"]) {
    await run("pnpm", ["pack", "--pack-destination", packed], {
      cwd: join(root, "packages", directory),
    });
  }
  const tarballs = await readdir(packed);
  const byPrefix = (prefix) =>
    join(packed, tarballs.find((name) => name.startsWith(prefix)) ?? "missing");
  // Relative file specs avoid Windows short-path URL escaping (RUNNER~1).
  const fileDependency = (prefix) =>
    `file:../packed/${basename(byPrefix(prefix))}`;
  if (manager === "npm") {
    const creator = join(temporary, "creator");
    const generated = join(temporary, "generated");
    await mkdir(creator);
    await writeFile(
      join(creator, "package.json"),
      JSON.stringify({
        name: "cookbook-isolated-creator-smoke",
        private: true,
        dependencies: {
          "@tenphi/create-cookbook": fileDependency("tenphi-create-cookbook-"),
          "@tenphi/docs": fileDependency("tenphi-docs-"),
        },
        overrides: { "@tenphi/docs": "$@tenphi/docs" },
      }),
    );
    await run(
      "npm",
      ["install", "--ignore-scripts", "--no-audit", "--no-fund"],
      {
        cwd: creator,
      },
    );
    await run(
      process.execPath,
      [
        join(creator, "node_modules/@tenphi/create-cookbook/dist/cli.js"),
        generated,
        "--yes",
        "--no-install",
      ],
      { cwd: creator },
    );
    const generatedPackage = JSON.parse(
      await readFile(join(generated, "package.json"), "utf8"),
    );
    generatedPackage.dependencies["@tenphi/cookbook"] =
      fileDependency("tenphi-cookbook-");
    generatedPackage.overrides = {
      "@tenphi/docs": fileDependency("tenphi-docs-"),
      "@tenphi/renderer": fileDependency("tenphi-renderer-"),
    };
    await writeFile(
      join(generated, "package.json"),
      JSON.stringify(generatedPackage),
    );
    await run(
      "npm",
      ["install", "--ignore-scripts", "--no-audit", "--no-fund"],
      {
        cwd: generated,
      },
    );
    await mkdir(join(generated, "docs", "components"), { recursive: true });
    await writeFile(
      join(generated, "docs", "components", "Note.astro"),
      "<aside><slot /></aside>\n",
    );
    await run("npm", ["run", "validate"], { cwd: generated });

    const configPath = join(generated, "docs.config.ts");
    const validConfig = await readFile(configPath, "utf8");
    for (const [theme, property] of [
      ['{ presets: { h1: { fontSizee: "3rem" } } }', "fontSizee"],
      ['{ styles: { Sidebar: { LinkLabel: { colorr: "#text" } } } }', "colorr"],
    ]) {
      await writeFile(
        configPath,
        validConfig.replace(
          "defineDocsConfig({",
          `defineDocsConfig({\n  theme: ${theme},`,
        ),
      );
      try {
        await run("npm", ["run", "typecheck"], { cwd: generated });
        throw new Error(`Generated typecheck accepted invalid theme: ${theme}`);
      } catch (error) {
        if (error.message.startsWith("Generated typecheck accepted"))
          throw error;
        if (!`${error.stdout}\n${error.stderr}`.includes(property))
          throw new Error(
            `Generated typecheck failed without reporting ${property}: ${error.stdout}\n${error.stderr}`,
            { cause: error },
          );
      }
    }
    await writeFile(configPath, validConfig);
  }
  let astro = JSON.parse(
    await readFile(
      join(root, "apps/convention/node_modules/astro/package.json"),
      "utf8",
    ),
  ).version;
  if (process.env.COOKBOOK_TEST_UPSTREAM === "1") {
    const packedManifest = JSON.parse(
      (
        await run("tar", [
          "-xOf",
          byPrefix("tenphi-cookbook-"),
          "package/package.json",
        ])
      ).stdout,
    );
    const { stdout } = await run("npm", [
      "view",
      `astro@${packedManifest.peerDependencies.astro}`,
      "version",
      "--json",
    ]);
    const versions = JSON.parse(stdout);
    astro = (Array.isArray(versions) ? versions : [versions])
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .at(-1);
  }
  const packageJson = {
    name: "cookbook-clean-install-smoke",
    version: "0.0.0",
    private: true,
    type: "module",
    packageManager:
      manager === "yarn"
        ? "yarn@4.18.1"
        : manager === "pnpm"
          ? "pnpm@11.24.0"
          : "npm@11.10.0",
    scripts: { build: "astro build", "check-build": "cookbook check-build" },
    dependencies: {
      "@tenphi/docs": fileDependency("tenphi-docs-"),
      "@tenphi/renderer": fileDependency("tenphi-renderer-"),
      astro,
      "@tenphi/cookbook": fileDependency("tenphi-cookbook-"),
    },
    devDependencies: {
      "@types/react": "^19.0.0",
      typescript: "6.0.3",
      "@typescript-eslint/parser": "8.70.0",
      eslint: "10.9.1",
      oxlint: "1.83.0",
    },
  };
  const local = Object.fromEntries(
    Object.entries(packageJson.dependencies).filter(([name]) =>
      name.startsWith("@tenphi/"),
    ),
  );
  if (manager === "pnpm")
    await writeFile(
      join(site, "pnpm-workspace.yaml"),
      JSON.stringify({ overrides: local }),
    );
  else if (manager === "yarn") {
    packageJson.resolutions = local;
    await writeFile(
      join(site, ".yarnrc.yml"),
      // This fresh consumer deliberately has no lockfile yet. Keep the repo
      // install frozen; allow only this generated fixture to create its lock.
      "nodeLinker: node-modules\nenableScripts: false\nenableImmutableInstalls: false\n",
    );
  } else
    packageJson.overrides = Object.fromEntries(
      Object.keys(local).map((name) => [name, `$${name}`]),
    );
  await writeFile(
    join(site, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  await writeFile(
    join(site, "README.md"),
    "# Packed site\n\n[Read more](./docs/guide.md).\n\n## Example\n\n```js\nconst ready = true;\n```\n",
  );
  await mkdir(join(site, "public", "fonts"), { recursive: true });
  await cp(
    join(
      root,
      "packages/renderer/node_modules/@fontsource-variable/onest/files/onest-latin-wght-normal.woff2",
    ),
    join(site, "public", "fonts", "consumer-mono.woff2"),
  );
  await writeFile(
    join(site, "astro.config.mjs"),
    `import { defineConfig } from 'astro/config';
import cookbook, { defineDocsConfig } from '@tenphi/cookbook';
const config = defineDocsConfig({
  theme: {
    fonts: {
      code: {
        family: 'Consumer Mono',
        files: [{ src: '/fonts/consumer-mono.woff2', weight: '100 900' }],
      },
    },
    states: {
      '@mobile': '@media(w < 43rem)',
      '@consumer-narrow': '@media(w < 37rem)',
    },
    presets: { 'consumer-title': { fontSize: '1.3125rem', fontWeight: 650 } },
    styles: {
      Header: { Logo: { hide: true } },
    },
    customStyles: {
      ConsumerSiteTitle: { Logo: { inlineSize: { '@mobile': '1.625rem' } } },
      ConsumerGlobal: { Label: { blockSize: '1.125rem' } },
      ConsumerAnatomy: { color: '#text' },
      ConsumerUnused: { color: '#text' },
    },
  },
  components: { overrides: { SiteTitle: './docs/components/SiteTitle.astro' } },
});
export default defineConfig({ base: '/manual/', integrations: [cookbook({ config })] });
`,
  );
  await cp(
    join(root, "scripts/fixtures/styling"),
    join(site, "docs/components"),
    { recursive: true },
  );
  await mkdir(join(site, "docs"), { recursive: true });
  await writeFile(
    join(site, "docs", "guide.md"),
    "# Guide\n\nBuilt only from packed package artifacts.\n",
  );
  await runManager(
    manager === "npm"
      ? ["install", "--ignore-scripts", "--no-audit", "--no-fund"]
      : manager === "pnpm"
        ? [
            "install",
            "--ignore-scripts",
            "--config.manage-package-manager-versions=false",
          ]
        : ["install"],
    {
      cwd: site,
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  await run(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
import { readFile } from 'node:fs/promises';
const guide = new URL(import.meta.resolve('@tenphi/cookbook/docs/customization-rules.md'));
const contents = await readFile(guide, 'utf8');
if (!contents.includes('./upstream/tasty/docs/ai-agents.md'))
  throw new Error('Installed customization guide lacks local upstream references.');
for (const path of ['upstream/tasty/docs/ai-agents.md', 'upstream/glaze/docs/api.md']) {
  if (!(await readFile(new URL(path, guide), 'utf8')).length)
    throw new Error('Installed documentation is empty: ' + path);
}
`,
    ],
    { cwd: site },
  );
  await checkStyleLinting({ site, root, run });
  await writeFile(
    join(site, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: "ES2023",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        types: ["react"],
      },
      include: [
        "docs/components/*.ts",
        "linting/api.ts",
        "linting/tasty.config.ts",
      ],
    }),
  );
  await run("pnpm", ["exec", "tsc", "-p", join(site, "tsconfig.json")], {
    cwd: root,
    maxBuffer: 8 * 1024 * 1024,
  });
  const build = await runManager(["run", "build"], {
    cwd: site,
    maxBuffer: 8 * 1024 * 1024,
  });
  const buildLog = `${build.stdout}\n${build.stderr}`;
  if (
    !buildLog.includes("theme.customStyles.ConsumerUnused did not match") ||
    buildLog.includes("theme.customStyles.ConsumerSiteTitle did not match") ||
    buildLog.includes("theme.customStyles.ConsumerGlobal did not match") ||
    !buildLog.includes("theme.customStyles.ConsumerAnatomy did not match")
  ) {
    throw new Error(
      `Custom component style usage diagnostics were incorrect: ${buildLog}`,
    );
  }
  await runManager(["run", "check-build"], {
    cwd: site,
    maxBuffer: 8 * 1024 * 1024,
  });
  const html = await readFile(join(site, "dist", "index.html"), "utf8");
  const agentIndex = await readFile(join(site, "dist", "llms.txt"), "utf8");
  if (
    !agentIndex.includes("[Packed site](/manual/)") ||
    !agentIndex.includes("[Guide](/manual/guide/)")
  ) {
    throw new Error(
      "Packed-package site did not index its published pages for agents.",
    );
  }
  if (!html.includes("Packed site") || !html.includes('href="/manual/guide"')) {
    throw new Error(
      "Packed-package site did not contain the expected generated content.",
    );
  }
  for (const marker of ["data-has-toc", "td-header", "right-sidebar"]) {
    if (!html.includes(marker)) {
      throw new Error(
        `Packed convention page did not use the default Cookbook theme: missing ${marker}.`,
      );
    }
  }
  const outputEntries = (
    await readdir(join(site, "dist"), { recursive: true })
  ).map((name) => name.split(sep).join("/"));
  if (outputEntries.includes("robots.txt")) {
    throw new Error(
      "A path-hosted site must not publish origin-level robots rules.",
    );
  }
  const cssEntries = outputEntries.filter((name) => extname(name) === ".css");
  if (
    cssEntries.length === 0 ||
    cssEntries.some(
      (name) => !/^_astro\/tasty\.(?:shared|page)\.[\w-]+\.css$/.test(name),
    )
  ) {
    throw new Error(
      `Packed convention page must ship only extracted Tasty CSS: ${cssEntries.join(", ")}.`,
    );
  }
  const css = (
    await Promise.all(
      cssEntries.map((name) => readFile(join(site, "dist", name), "utf8")),
    )
  ).join("\n");
  assert.doesNotMatch(css, /\[data-tasty-anatomy="ConsumerAnatomy"\]/);
  if (
    /--sl-|@layer\s+starlight|expressive-code|--ec-/i.test(`${html}\n${css}`)
  ) {
    throw new Error(
      "Packed convention page contains Starlight or Expressive Code styles.",
    );
  }
  if (/react-dom|tasty\/client|data-reactroot/i.test(html)) {
    throw new Error(
      "Packed convention page unexpectedly includes a hydration runtime.",
    );
  }
  const title = html.match(
    /<a\b[^>]*class="[^"]*consumer-title[^"]*"[^>]*>[\s\S]*?<\/a>/,
  )?.[0];
  if (
    !title?.includes('href="/manual/"') ||
    !title.includes("<svg") ||
    !title.includes('translate="no"')
  ) {
    throw new Error(
      "Consumer SiteTitle must include its logo and label in the home link.",
    );
  }
  if (/<style\b|<astro-island\b/.test(html) || /\sstyle=/.test(title)) {
    throw new Error(
      "Consumer styling must extract CSS without inline styles or hydration.",
    );
  }
  for (const value of [
    "1.625rem",
    "1.75rem",
    "1.3125rem",
    "2.25rem",
    "1.125rem",
    "37rem",
    "43rem",
    "var(--gap)",
    "var(--accent-text-color)",
    ".consumer-global",
    "/manual/fonts/consumer-mono.woff2",
  ]) {
    if (!css.includes(value)) {
      throw new Error(
        `Consumer styling is missing extracted CSS for ${value}.`,
      );
    }
  }
  if (
    !css.includes('font-family: "Consumer Mono"') ||
    css.includes('font-family: "JetBrains Mono Variable"')
  ) {
    throw new Error(
      "The packed site did not apply the local code font and remove the unused default.",
    );
  }
  if (
    !/@media\s*\(width\s*<\s*43rem\)\s*\{\s*[^{}]*>\s*svg\s*\{[^}]*inline-size:\s*1\.625rem/.test(
      css,
    )
  ) {
    throw new Error(
      "The consumer's @mobile override was not applied to its logo.",
    );
  }
  console.log(
    `Clean ${manager} installation, custom styling, Astro ${astro} build and output check passed using only packed workspace artifacts.`,
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
