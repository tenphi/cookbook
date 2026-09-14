import { execFile } from "node:child_process";
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
import { extname, join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const temporary = await mkdtemp(join(tmpdir(), "cookbook-install-"));
const packed = join(temporary, "packed");
const site = join(temporary, "site");

try {
  await mkdir(packed, { recursive: true });
  await mkdir(site, { recursive: true });
  for (const directory of ["docs", "starlight", "facade", "create"]) {
    await run("pnpm", ["pack", "--pack-destination", packed], {
      cwd: join(root, "packages", directory),
    });
  }
  const tarballs = await readdir(packed);
  const byPrefix = (prefix) =>
    join(packed, tarballs.find((name) => name.startsWith(prefix)) ?? "missing");
  const packageJson = {
    name: "cookbook-clean-install-smoke",
    version: "0.0.0",
    private: true,
    type: "module",
    scripts: { build: "astro build" },
    dependencies: {
      "@tenphi/docs": `file:${byPrefix("tenphi-docs-")}`,
      "@tenphi/starlight": `file:${byPrefix("tenphi-starlight-")}`,
      astro: "7.2.9",
      "@tenphi/cookbook": `file:${byPrefix("tenphi-cookbook-")}`,
    },
    devDependencies: { "@types/react": "^19.0.0" },
  };
  await writeFile(
    join(site, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  await writeFile(
    join(site, "README.md"),
    "# Packed site\n\n[Read more](./docs/guide.md).\n\n## Example\n\n```js\nconst ready = true;\n```\n",
  );
  await writeFile(
    join(site, "astro.config.mjs"),
    `import { defineConfig } from 'astro/config';
import cookbook, { defineDocsConfig } from '@tenphi/cookbook';
const config = defineDocsConfig({
  theme: {
    states: {
      '@mobile': '@media(w < 43rem)',
      '@consumer-narrow': '@media(w < 37rem)',
    },
    presets: { 'consumer-title': { fontSize: '1.3125rem', fontWeight: 650 } },
    styles: {
      StarlightHeader: { Logo: { hide: true } },
      ConsumerSiteTitle: { Logo: { inlineSize: { '@mobile': '1.625rem' } } },
      ConsumerGlobal: { Label: { blockSize: '1.125rem' } },
    },
  },
  components: { overrides: { SiteTitle: './docs/components/SiteTitle.astro' } },
});
export default defineConfig({ integrations: [cookbook({ config })] });
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
  await run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: site,
    maxBuffer: 8 * 1024 * 1024,
  });
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
      include: ["docs/components/*.ts"],
    }),
  );
  await run("pnpm", ["exec", "tsc", "-p", join(site, "tsconfig.json")], {
    cwd: root,
    maxBuffer: 8 * 1024 * 1024,
  });
  await run("npm", ["run", "build"], { cwd: site, maxBuffer: 8 * 1024 * 1024 });
  const html = await readFile(join(site, "dist", "index.html"), "utf8");
  if (!html.includes("Packed site") || !html.includes('href="/guide"')) {
    throw new Error(
      "Packed-package site did not contain the expected generated content.",
    );
  }
  for (const marker of ["data-has-toc", "td-header", "right-sidebar"]) {
    if (!html.includes(marker)) {
      throw new Error(
        `Packed convention page did not use the default Starlight theme: missing ${marker}.`,
      );
    }
  }
  const outputEntries = await readdir(join(site, "dist"), { recursive: true });
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
    !title?.includes('href="/"') ||
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
  ]) {
    if (!css.includes(value)) {
      throw new Error(
        `Consumer styling is missing extracted CSS for ${value}.`,
      );
    }
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
    "Clean npm installation, custom styling, and Astro build passed using only packed workspace artifacts.",
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
