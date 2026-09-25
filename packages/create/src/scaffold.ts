import { spawn } from "node:child_process";
import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import creatorPackage from "../package.json" with { type: "json" };
import {
  defaultLock,
  normalizeDocsConfig,
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
  package?: string;
  /** Existing repository to document; omit both source and package for a starter. */
  source?: string;
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
  lock?: PackageLockSource;
  discovery?: PackageDiscovery;
  packageManager: PackageManager;
}

export async function scaffold(
  options: ScaffoldOptions,
): Promise<ScaffoldResult> {
  if (options.package && options.source)
    throw new Error("Choose either --package or --source.");
  if ((options.vendor || options.trustPackage) && !options.package)
    throw new Error("--vendor and --trust-package require --package.");
  normalizeDocsConfig({
    ...(options.site ? { site: { url: options.site } } : {}),
    ...(options.brand ? { theme: { brand: options.brand } } : {}),
  });
  const packageName = options.package
    ? packageNameFromSpecifier(options.package)
    : undefined;
  const destination = resolve(
    options.destination ??
      (packageName
        ? `${packageName.replace(/^@[^/]+\//, "")}-docs`
        : "docs-site"),
  );
  const packageManager = options.packageManager ?? inferPackageManager();
  let existing: string[] = [];
  try {
    existing = await readdir(destination);
  } catch (error) {
    if (!(
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ))
      throw error;
  }
  if (existing.length > 0 && !(await options.confirmNonEmpty?.(destination)))
    throw new Error(`Destination is not empty: ${destination}.`);
  if (options.source) await readdir(resolve(options.source));
  const lock = options.package
    ? await resolvePackageLock(options.package)
    : undefined;
  const buildDefaults = normalizeDocsConfig().build;
  const packageRoot = lock
    ? await materializePackage(lock, buildDefaults)
    : undefined;
  const discovery = packageRoot
    ? await discoverPackage(packageRoot)
    : undefined;
  await mkdir(destination, { recursive: true });

  const projectLock =
    lock && options.vendor
      ? { ...lock, vendored: ".cookbook/vendor/package" }
      : lock;
  if (packageRoot && projectLock?.vendored) {
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
      renderAstroConfig(options),
      "utf8",
    ),
    writeFile(join(destination, "tsconfig.json"), tsconfig(), "utf8"),
    writeFile(
      join(destination, ".gitignore"),
      "node_modules/\ndist/\n.astro/\n",
      "utf8",
    ),
    writeFile(
      join(destination, "docs.config.ts"),
      renderDocsConfig(
        options,
        discovery?.manifest.name ??
          (options.source
            ? basename(resolve(options.source))
            : "Documentation"),
        destination,
      ),
      "utf8",
    ),
    ...(projectLock
      ? [writeDocsLock(destination, defaultLock([projectLock]))]
      : []),
    ...(!options.package && !options.source
      ? [
          writeFile(
            join(destination, "README.md"),
            "# Documentation\n\nWelcome to your documentation. Add Markdown pages in `docs/` to get started.\n",
            "utf8",
          ),
        ]
      : []),
  ]);
  await writeAgentInstructions(destination, options, packageManager);
  if (options.deploy === "github-pages")
    await writeGithubWorkflow(destination, packageManager);
  if (options.install !== false)
    await installDependencies(destination, packageManager);
  return {
    destination,
    ...(projectLock ? { lock: projectLock } : {}),
    ...(discovery ? { discovery } : {}),
    packageManager,
  };
}

function renderAgentInstructions(
  options: ScaffoldOptions,
  packageManager: PackageManager,
): string {
  const contentLocation = options.source
    ? "Edit the source repository's README.md and docs/ files. The `root` in `docs.config.ts` points there; this app reads them without copying."
    : options.package
      ? `Documentation comes from the package pinned in \`cookbook.lock.json\`. Use \`${packageManager} run update\` to refresh the lock; add local pages through \`content.sources\` in \`docs.config.ts\`.`
      : "Edit `README.md` for the home page and add Markdown or MDX pages under `docs/` for other pages.";
  return `# Cookbook site instructions for coding agents\n\n${contentLocation}\n\n- Read \`docs.config.ts\` before changing content, navigation, or theme. \`astro.config.ts\` loads Cookbook.\n- Read \`node_modules/@tenphi/cookbook/docs/getting-started.md\` and \`node_modules/@tenphi/cookbook/docs/customization-rules.md\` for supported workflows. The installed package also includes the theme and configuration references.\n- Configure the public HTTPS origin in \`site.url\` in \`docs.config.ts\` before deployment. For a site hosted under a path, set Astro's \`base\` in \`astro.config.ts\`.\n- Run \`${packageManager} run doctor\` and \`${packageManager} run build\` after changes. The build writes static HTML, a sitemap when \`site.url\` is set, and \`llms.txt\` into \`dist/\`. At an origin root it also writes \`robots.txt\` with the sitemap URL.\n- Keep headings descriptive and links meaningful. Check the built HTML and discovery files before publishing.\n`;
}

async function writeAgentInstructions(
  destination: string,
  options: ScaffoldOptions,
  packageManager: PackageManager,
): Promise<void> {
  try {
    await writeFile(
      join(destination, "AGENTS.md"),
      renderAgentInstructions(options, packageManager),
      { flag: "wx" },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "EEXIST"
    )
      return;
    throw error;
  }
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

export function renderAstroConfig(options: ScaffoldOptions): string {
  return `import { defineConfig } from 'astro/config';\nimport cookbook from '@tenphi/cookbook';\n\nexport default defineConfig({\n  ${options.base ? `base: ${JSON.stringify(options.base)},\n  ` : ""}integrations: [cookbook()],\n});\n`;
}

export function renderDocsConfig(
  options: ScaffoldOptions,
  title: string,
  destination = resolve(options.destination ?? "docs-site"),
): string {
  const config = {
    ...(options.source
      ? {
          root:
            relative(destination, resolve(options.source)).replaceAll(
              "\\",
              "/",
            ) || ".",
        }
      : {}),
    site: { title, ...(options.site ? { url: options.site } : {}) },
    ...(options.package
      ? {
          content: {
            sources: [
              {
                package: options.package,
                ...(options.trustPackage ? { trust: "mdx" } : {}),
              },
            ],
          },
        }
      : {}),
    ...(options.brand ? { theme: { brand: options.brand } } : {}),
  };
  return `import { defineDocsConfig } from '@tenphi/cookbook/config';\n\nexport default defineDocsConfig(${JSON.stringify(config, null, 2)});\n`;
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
