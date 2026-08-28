import { spawn } from "node:child_process";
import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  defaultLock,
  discoverPackage,
  materializePackage,
  packageNameFromSpecifier,
  resolvePackageLock,
  writeDocsLock,
  type PackageDiscovery,
  type PackageLockSource,
} from "@tenphi/docs";

export type PackageManager = "npm" | "pnpm" | "yarn";

export interface ScaffoldOptions {
  package: string;
  destination?: string;
  packageManager?: PackageManager;
  install?: boolean;
  brand?: string;
  site?: string;
  base?: string;
  deploy?: "github-pages" | "none";
  trustPackage?: boolean;
  vendor?: boolean;
  confirmNonEmpty?: (destination: string) => Promise<boolean>;
}

export interface ScaffoldResult {
  destination: string;
  lock: PackageLockSource;
  discovery: PackageDiscovery;
  packageManager: PackageManager;
}

export async function scaffold(
  options: ScaffoldOptions,
): Promise<ScaffoldResult> {
  const packageName = packageNameFromSpecifier(options.package);
  const destination = resolve(
    options.destination ?? `${packageName.replace(/^@[^/]+\//, "")}-docs`,
  );
  const packageManager = options.packageManager ?? inferPackageManager();
  const lock = await resolvePackageLock(options.package);
  const buildDefaults = {
    strict: true,
    ci: false,
    base: "/",
    cacheDir: "",
    maxArtifactBytes: 25 * 1024 * 1024,
    maxUnpackedBytes: 100 * 1024 * 1024,
    maxFiles: 10_000,
    maxPathDepth: 24,
    maxAssetBytes: 20 * 1024 * 1024,
  };
  const packageRoot = await materializePackage(lock, buildDefaults);
  const discovery = await discoverPackage(packageRoot);

  await mkdir(destination, { recursive: true });
  const existing = await readdir(destination);
  if (existing.length > 0) {
    const confirmed = await options.confirmNonEmpty?.(destination);
    if (!confirmed)
      throw new Error(`Destination is not empty: ${destination}.`);
  }

  const projectLock = options.vendor
    ? { ...lock, vendored: ".tasty-docs/vendor/package" }
    : lock;
  if (options.vendor && projectLock.vendored) {
    await mkdir(join(destination, ".tasty-docs", "vendor"), {
      recursive: true,
    });
    await cp(packageRoot, join(destination, projectLock.vendored), {
      recursive: true,
    });
  }

  await Promise.all([
    writeFile(
      join(destination, "package.json"),
      packageJson(packageManager),
      "utf8",
    ),
    writeFile(
      join(destination, "astro.config.ts"),
      astroConfig(options),
      "utf8",
    ),
    writeFile(join(destination, "tsconfig.json"), tsconfig(), "utf8"),
    writeFile(
      join(destination, ".gitignore"),
      "node_modules/\ndist/\n.astro/\n",
      "utf8",
    ),
    writeDocsLock(destination, defaultLock([projectLock])),
  ]);
  if (options.deploy === "github-pages") await writeGithubWorkflow(destination);
  if (options.install !== false)
    await installDependencies(destination, packageManager);
  return { destination, lock: projectLock, discovery, packageManager };
}

function packageJson(packageManager: PackageManager): string {
  const packageManagerVersion = {
    npm: "npm@11",
    pnpm: "pnpm@11",
    yarn: "yarn@4",
  }[packageManager];
  return `${JSON.stringify(
    {
      name: "tasty-docs-site",
      version: "0.0.0",
      private: true,
      type: "module",
      packageManager: packageManagerVersion,
      scripts: {
        dev: "astro dev",
        build: "astro build",
        preview: "astro preview",
        doctor: "tasty-docs doctor",
        update: "tasty-docs update",
      },
      dependencies: { astro: "^7.2.9", "tasty-docs": "^0.1.0" },
    },
    null,
    2,
  )}\n`;
}

function astroConfig(options: ScaffoldOptions): string {
  const source = {
    package: options.package,
    ...(options.trustPackage ? { trust: "mdx" as const } : {}),
  };
  const docsConfig = {
    ...(options.site ? { site: { url: options.site } } : {}),
    content: { sources: [source] },
    ...(options.brand ? { theme: { brand: { from: options.brand } } } : {}),
    ...(options.base ? { build: { base: options.base } } : {}),
  };
  return `import { defineConfig } from 'astro/config';\nimport tastyDocs from 'tasty-docs';\n\nconst docs = ${JSON.stringify(docsConfig, null, 2)};\n\nexport default defineConfig({\n  ${options.site ? `site: ${JSON.stringify(options.site)},\n  ` : ""}${options.base ? `base: ${JSON.stringify(options.base)},\n  ` : ""}output: 'static',\n  integrations: [tastyDocs({ config: docs })],\n});\n`;
}

function tsconfig(): string {
  return `${JSON.stringify(
    {
      extends: "astro/tsconfigs/strict",
      include: [".astro/types.d.ts", "**/*"],
      exclude: ["dist"],
    },
    null,
    2,
  )}\n`;
}

async function writeGithubWorkflow(destination: string): Promise<void> {
  const directory = join(destination, ".github", "workflows");
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, "deploy.yml"),
    `name: Deploy documentation\non:\n  push:\n    branches: [main]\npermissions:\n  contents: read\n  pages: write\n  id-token: write\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n      - run: npm ci\n      - run: npm run build\n      - uses: actions/upload-pages-artifact@v3\n        with:\n          path: dist\n      - uses: actions/deploy-pages@v4\n`,
  );
}

async function installDependencies(
  destination: string,
  manager: PackageManager,
): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(manager, ["install"], {
      cwd: destination,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolvePromise()
        : reject(new Error(`${manager} install exited with ${code}.`)),
    );
  });
}

export function inferPackageManager(
  userAgent = process.env.npm_config_user_agent,
): PackageManager {
  if (userAgent?.startsWith("pnpm/")) return "pnpm";
  if (userAgent?.startsWith("yarn/")) return "yarn";
  return "npm";
}
