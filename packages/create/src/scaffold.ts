import { spawn } from "node:child_process";
import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import creatorPackage from "../package.json" with { type: "json" };
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
    ? { ...lock, vendored: ".cookbook/vendor/package" }
    : lock;
  if (options.vendor && projectLock.vendored) {
    await mkdir(join(destination, ".cookbook", "vendor"), {
      recursive: true,
    });
    await cp(packageRoot, join(destination, projectLock.vendored), {
      recursive: true,
    });
  }

  await Promise.all([
    writeFile(
      join(destination, "package.json"),
      renderPackageJson(packageManager),
      "utf8",
    ),
    writeFile(
      join(destination, "astro.config.ts"),
      renderAstroConfig(options, discovery.manifest.name),
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
  if (options.deploy === "github-pages")
    await writeGithubWorkflow(destination, packageManager);
  if (options.install !== false)
    await installDependencies(destination, packageManager);
  return { destination, lock: projectLock, discovery, packageManager };
}

export function renderPackageJson(packageManager: PackageManager): string {
  const packageManagerVersion = {
    npm: "npm@11",
    pnpm: "pnpm@11",
    yarn: "yarn@4",
  }[packageManager];
  return `${JSON.stringify(
    {
      name: "cookbook-site",
      version: "0.0.0",
      private: true,
      type: "module",
      packageManager: packageManagerVersion,
      scripts: {
        dev: "astro dev",
        build: "astro build",
        preview: "astro preview",
        doctor: "cookbook doctor",
        update: "cookbook update",
      },
      dependencies: {
        astro: "^7.3.2",
        "@tenphi/cookbook": `^${creatorPackage.version}`,
      },
    },
    null,
    2,
  )}\n`;
}

export function renderAstroConfig(
  options: ScaffoldOptions,
  packageName: string,
): string {
  const source = {
    package: options.package,
    ...(options.trustPackage ? { trust: "mdx" as const } : {}),
  };
  const docsConfig = {
    site: {
      title: packageName,
      ...(options.site ? { url: options.site } : {}),
    },
    content: { sources: [source] },
    ...(options.brand ? { theme: { brand: { from: options.brand } } } : {}),
  };
  return `import { defineConfig } from 'astro/config';\nimport cookbook, { defineDocsConfig } from '@tenphi/cookbook';\n\nconst docs = defineDocsConfig(${JSON.stringify(docsConfig, null, 2)});\n\nexport default defineConfig({\n  ${options.base ? `base: ${JSON.stringify(options.base)},\n  ` : ""}output: 'static',\n  integrations: [cookbook({ config: docs })],\n});\n`;
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

async function writeGithubWorkflow(
  destination: string,
  packageManager: PackageManager,
): Promise<void> {
  const directory = join(destination, ".github", "workflows");
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, "deploy.yml"),
    renderGithubWorkflow(packageManager),
  );
}

export function renderGithubWorkflow(packageManager: PackageManager): string {
  const setup =
    packageManager === "pnpm"
      ? "      - uses: pnpm/action-setup@v6\n"
      : packageManager === "yarn"
        ? "      - run: corepack enable\n"
        : "";
  const install = {
    npm: "npm ci",
    pnpm: "pnpm install --frozen-lockfile",
    yarn: "yarn install --immutable",
  }[packageManager];

  return `name: Deploy documentation\n\non:\n  push:\n    branches: [main]\n  workflow_dispatch:\n\npermissions:\n  actions: read\n  contents: read\n  pages: write\n  id-token: write\n\nconcurrency:\n  group: github-pages\n  cancel-in-progress: false\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n${setup}      - uses: actions/setup-node@v7\n        with:\n          node-version: 22\n          cache: ${packageManager}\n      - run: ${install}\n      - run: ${packageManager} run build\n      - uses: actions/configure-pages@v6\n      - uses: actions/upload-pages-artifact@v5\n        with:\n          path: dist\n\n  deploy:\n    environment:\n      name: github-pages\n      url: \${{ steps.deployment.outputs.page_url }}\n    runs-on: ubuntu-latest\n    needs: build\n    steps:\n      - name: Deploy to GitHub Pages\n        id: deployment\n        uses: actions/deploy-pages@v5\n`;
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
