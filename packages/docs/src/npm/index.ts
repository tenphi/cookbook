import { createHash } from "node:crypto";
import { homedir } from "node:os";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import npa from "npm-package-arg";
import pacote from "pacote";
import { glob } from "tinyglobby";
import type {
  NormalizedDocsConfig,
  PackageDiscovery,
  PackageLockSource,
  PackageManifest,
  CookbookLock,
} from "../types.js";

const DEFAULT_REGISTRY = "https://registry.npmjs.org/";
const LOCK_FILE = "cookbook.lock.json";

export interface ResolvePackageOptions {
  registry?: string;
  cacheDir?: string;
}

export async function resolvePackageLock(
  requested: string,
  options: ResolvePackageOptions = {},
): Promise<PackageLockSource> {
  const parsed = npa(requested);
  if (!["tag", "version", "range"].includes(parsed.type)) {
    throw new Error(
      `Only npm registry package specifiers are supported (received ${parsed.type}).`,
    );
  }
  const registry = options.registry ?? DEFAULT_REGISTRY;
  const manifest = (await pacote.manifest(requested, {
    registry,
    ...(options.cacheDir ? { cache: options.cacheDir } : {}),
    fullMetadata: true,
  })) as PackageManifest;
  if (!manifest.name || !manifest.version || !manifest._integrity) {
    throw new Error(
      `Registry metadata for ${requested} did not include version and integrity.`,
    );
  }
  return {
    requested,
    resolved: `${manifest.name}@${manifest.version}`,
    registry,
    integrity: manifest._integrity,
  };
}

export async function readDocsLock(
  root: string,
): Promise<CookbookLock | undefined> {
  try {
    const value = JSON.parse(
      await readFile(join(root, LOCK_FILE), "utf8"),
    ) as CookbookLock;
    validateLock(value);
    return value;
  } catch (error) {
    if (isMissing(error)) return undefined;
    throw error;
  }
}

export async function writeDocsLock(
  root: string,
  lock: CookbookLock,
): Promise<void> {
  validateLock(lock);
  await writeFile(
    join(root, LOCK_FILE),
    `${JSON.stringify(lock, null, 2)}\n`,
    "utf8",
  );
}

export function validateLock(lock: CookbookLock): void {
  if (lock.schemaVersion !== 1 || !Array.isArray(lock.sources)) {
    throw new Error("Unsupported or invalid cookbook.lock.json.");
  }
  for (const source of lock.sources) {
    if (
      !source.requested ||
      !source.resolved ||
      !source.registry ||
      !source.integrity
    ) {
      throw new Error(
        "Every lock source requires requested, resolved, registry, and integrity.",
      );
    }
    const parsed = npa(source.resolved);
    if (parsed.type !== "version") {
      throw new Error(
        `Locked source must use an exact version: ${source.resolved}.`,
      );
    }
    if (
      source.vendored &&
      (source.vendored.startsWith("/") ||
        source.vendored.split(/[\\/]/).includes(".."))
    ) {
      throw new Error(
        `Vendored package path must stay within the project: ${source.vendored}.`,
      );
    }
  }
}

export async function materializePackage(
  source: PackageLockSource,
  config: NormalizedDocsConfig["build"],
  projectRoot?: string,
): Promise<string> {
  if (source.vendored) {
    if (!projectRoot) {
      throw new Error(
        `Vendored source ${source.resolved} requires a project root.`,
      );
    }
    const vendored = resolve(projectRoot, source.vendored);
    if (!inside(projectRoot, vendored)) {
      throw new Error(
        `Vendored package path escapes the project root: ${source.vendored}.`,
      );
    }
    const marker = (
      await readFile(join(vendored, ".cookbook-integrity"), "utf8")
    ).trim();
    if (marker !== source.integrity) {
      throw new Error(
        `Vendored package integrity marker does not match ${source.resolved}.`,
      );
    }
    await validateExtractedTree(vendored, config);
    return vendored;
  }
  const cacheRoot = resolve(
    config.cacheDir || join(homedir(), ".cache", "cookbook"),
    "artifacts",
  );
  const key = createHash("sha256").update(source.integrity).digest("hex");
  const destination = join(cacheRoot, key);
  const marker = join(destination, ".cookbook-integrity");
  try {
    if ((await readFile(marker, "utf8")).trim() === source.integrity)
      return destination;
  } catch (error) {
    if (!isMissing(error)) throw error;
  }

  await mkdir(cacheRoot, { recursive: true });
  const temporary = await mkdtemp(join(cacheRoot, ".extract-"));
  try {
    const tarball = await pacote.tarball(source.resolved, {
      registry: source.registry,
      integrity: source.integrity,
      cache: join(cacheRoot, "_cacache"),
    });
    if (tarball.byteLength > config.maxArtifactBytes) {
      throw new Error(
        `Package artifact is ${tarball.byteLength} bytes; limit is ${config.maxArtifactBytes}.`,
      );
    }
    await pacote.extract(source.resolved, temporary, {
      registry: source.registry,
      integrity: source.integrity,
      cache: join(cacheRoot, "_cacache"),
    });
    await validateExtractedTree(temporary, config);
    await writeFile(
      join(temporary, ".cookbook-integrity"),
      `${source.integrity}\n`,
    );
    await rm(destination, { recursive: true, force: true });
    await rename(temporary, destination);
    return destination;
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}

async function validateExtractedTree(
  root: string,
  config: NormalizedDocsConfig["build"],
): Promise<void> {
  let files = 0;
  let bytes = 0;
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    if (!directory) break;
    for (const name of await readdir(directory)) {
      if (name === ".cookbook-integrity") continue;
      const path = join(directory, name);
      const info = await lstat(path);
      const rel = relative(root, path);
      if (rel.startsWith(`..${sep}`) || rel === "..") {
        throw new Error(`Package path escapes artifact root: ${rel}.`);
      }
      if (rel.split(sep).length > config.maxPathDepth) {
        throw new Error(`Package path exceeds maximum depth: ${rel}.`);
      }
      if (info.isSymbolicLink()) {
        throw new Error(`Package symlinks are not allowed: ${rel}.`);
      }
      if (info.isDirectory()) {
        pending.push(path);
      } else if (info.isFile()) {
        files += 1;
        bytes += info.size;
        if (info.size > config.maxAssetBytes) {
          throw new Error(`Package file exceeds maximum size: ${rel}.`);
        }
        if (files > config.maxFiles || bytes > config.maxUnpackedBytes) {
          throw new Error(
            "Package exceeds configured file-count or unpacked-size limit.",
          );
        }
      } else {
        throw new Error(`Unsupported package entry type: ${rel}.`);
      }
    }
  }
}

export async function discoverPackage(root: string): Promise<PackageDiscovery> {
  const manifest = JSON.parse(
    await readFile(join(root, "package.json"), "utf8"),
  ) as PackageManifest;
  const hints = manifest.cookbook;
  const homeCandidates = [hints?.index, "README.md", "readme.md"].filter(
    (candidate): candidate is string => Boolean(candidate),
  );
  let home: string | undefined;
  for (const candidate of homeCandidates) {
    try {
      if ((await stat(join(root, candidate))).isFile()) {
        home = candidate;
        break;
      }
    } catch (error) {
      if (!isMissing(error)) throw error;
    }
  }

  const patterns = hints?.include?.length
    ? hints.include
    : [
        "docs/**/*.{md,mdx}",
        "docs/**/*.{png,jpg,jpeg,gif,webp,avif,svg,pdf,txt,zip}",
      ];
  const discovered = await glob(patterns, {
    cwd: root,
    onlyFiles: true,
    dot: false,
    ignore: hints?.exclude ?? [],
  });
  const pages = discovered.filter((path) => /\.mdx?$/i.test(path));
  if (home && !pages.includes(home)) pages.unshift(home);
  const assets = discovered.filter((path) => !/\.mdx?$/i.test(path));
  return { root, manifest, ...(home ? { home } : {}), pages, assets };
}

export function packageNameFromSpecifier(specifier: string): string {
  const parsed = npa(specifier);
  if (!parsed.name)
    throw new Error(`Invalid npm package specifier: ${specifier}.`);
  return parsed.name;
}

export function lockForSource(
  lock: CookbookLock | undefined,
  requested: string,
): PackageLockSource {
  const match = lock?.sources.find(
    (source) =>
      source.requested === requested ||
      packageNameFromSpecifier(source.requested) ===
        packageNameFromSpecifier(requested),
  );
  if (!match) {
    throw new Error(
      `Package source ${requested} is not locked. Run "cookbook update" to create ${LOCK_FILE}.`,
    );
  }
  return match;
}

export function defaultLock(sources: PackageLockSource[]): CookbookLock {
  return { schemaVersion: 1, sources };
}

function isMissing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function inside(root: string, path: string): boolean {
  const rel = relative(resolve(root), resolve(path));
  return (
    rel === "" ||
    (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))
  );
}
