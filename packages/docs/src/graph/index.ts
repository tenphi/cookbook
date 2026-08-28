import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import matter from "gray-matter";
import type { Image, Link, Root } from "mdast";
import { glob } from "tinyglobby";
import { visit } from "unist-util-visit";
import { normalizeDocsConfig } from "../config/index.js";
import {
  cloneAst,
  parseMarkdown,
  removeRenderedTitle,
  serializeMarkdown,
  stripLeadingBadgeBlock,
} from "../markdown/index.js";
import {
  discoverPackage,
  lockForSource,
  materializePackage,
  readDocsLock,
} from "../npm/index.js";
import type {
  CreateDocsGraphOptions,
  DocsAsset,
  DocsDiagnostic,
  DocsEntry,
  DocsFrontmatter,
  DocsGraph,
  DocsRoute,
  DocsSource,
  NavigationItem,
  NormalizedDocsConfig,
  PackageLockSource,
} from "../types.js";

interface CollectedSource {
  absolutePath: string;
  sourcePath: string;
  sourceRoot: string;
  route?: string;
  title?: string;
  description?: string;
  trust: "markdown" | "mdx";
  packageLock?: PackageLockSource;
}

const MARKDOWN_EXTENSIONS = [".md", ".mdx"];
const FRONTMATTER_KEYS = new Set([
  "title",
  "description",
  "slug",
  "draft",
  "sidebar",
  "toc",
  "editUrl",
  "prev",
  "next",
  "search",
  "head",
]);

export async function createDocsGraph(
  options: CreateDocsGraphOptions = {},
): Promise<DocsGraph> {
  const root = resolve(options.root ?? process.cwd());
  const config = normalizeDocsConfig(options.config);
  const diagnostics: DocsDiagnostic[] = [];
  const lock = options.lock ?? (await readDocsLock(root));
  const collected = await collectSources(root, config, lock, diagnostics);
  const entries: DocsEntry[] = [];
  const routeMap = new Map<string, DocsEntry>();
  const absoluteMap = new Map<string, DocsEntry>();
  const sourceMap = new Map<string, DocsEntry>();

  for (const source of collected) {
    const entry = await readEntry(source, config, diagnostics);
    if (!entry) continue;
    const existing = routeMap.get(entry.route);
    if (existing) {
      diagnostics.push({
        code: "DOCS_DUPLICATE_ROUTE",
        severity: "error",
        message: `Route ${entry.route} is owned by both ${existing.sourcePath} and ${entry.sourcePath}.`,
        file: entry.sourcePath,
        related: [{ file: existing.sourcePath, message: "First route owner." }],
      });
      continue;
    }
    routeMap.set(entry.route, entry);
    absoluteMap.set(normalizeFs(entry.absolutePath), entry);
    sourceMap.set(entry.sourcePath, entry);
    sourceMap.set(entry.id, entry);
    entries.push(entry);
  }

  for (const entry of entries) {
    await transformEntry(entry, absoluteMap, routeMap, config, diagnostics);
  }
  validateNavigation(config.navigation.items ?? [], routeMap, diagnostics);
  validateNavigation(
    (config.navigation.tabs ?? []).map(({ label, link }) => ({ label, link })),
    routeMap,
    diagnostics,
  );

  entries.sort((left, right) => left.route.localeCompare(right.route));
  const routes: DocsRoute[] = entries.map((entry) => ({
    route: entry.route,
    entryId: entry.id,
    sourcePath: entry.sourcePath,
    title: entry.title,
  }));
  const assets = entries.flatMap((entry) => entry.assets);
  return {
    root,
    config,
    entries,
    routes,
    assets,
    diagnostics,
    entryByRoute(route) {
      return routeMap.get(normalizeRoute(route));
    },
    entryBySource(sourcePath) {
      return sourceMap.get(sourcePath);
    },
  };
}

async function collectSources(
  root: string,
  config: NormalizedDocsConfig,
  lock: CreateDocsGraphOptions["lock"],
  diagnostics: DocsDiagnostic[],
): Promise<CollectedSource[]> {
  const declarations = config.content.sources?.length
    ? config.content.sources
    : await conventionSources(root);
  const results: CollectedSource[] = [];
  const identities = new Set<string>();

  for (const declaration of declarations) {
    try {
      const found = await collectDeclaration(root, declaration, config, lock);
      if (found.length === 0) {
        diagnostics.push({
          code: "DOCS_SOURCE_NOT_FOUND",
          severity: "error",
          message: `Source did not match any files: ${sourceLabel(declaration)}.`,
        });
      }
      for (const source of found) {
        const identity = normalizeFs(source.absolutePath);
        if (identities.has(identity)) continue;
        identities.add(identity);
        results.push(source);
      }
    } catch (error) {
      diagnostics.push({
        code:
          error instanceof OutsideRootError
            ? "DOCS_SOURCE_OUTSIDE_ROOT"
            : "DOCS_SOURCE_NOT_FOUND",
        severity: "error",
        message: errorMessage(error),
      });
    }
  }
  return results;
}

async function conventionSources(root: string): Promise<DocsSource[]> {
  const sources: DocsSource[] = [];
  if (await isFile(resolve(root, "README.md")))
    sources.push({ file: "README.md", route: "/" });
  const docs = resolve(root, "docs");
  if (await isDirectory(docs)) {
    sources.push({ glob: "docs/**/*.{md,mdx}", base: "docs" });
  }
  return sources;
}

async function collectDeclaration(
  root: string,
  declaration: DocsSource,
  config: NormalizedDocsConfig,
  lock: CreateDocsGraphOptions["lock"],
): Promise<CollectedSource[]> {
  if ("package" in declaration) {
    const packageLock = lockForSource(lock, declaration.package);
    const sourceRoot = await materializePackage(
      packageLock,
      config.build,
      root,
    );
    const discovery = await discoverPackage(sourceRoot);
    const patterns = declaration.include?.length
      ? declaration.include
      : discovery.pages;
    const files = declaration.include?.length
      ? await glob(patterns, {
          cwd: sourceRoot,
          onlyFiles: true,
          ignore: declaration.exclude ?? [],
        })
      : discovery.pages.filter(
          (path) => !(declaration.exclude ?? []).includes(path),
        );
    const index = declaration.index ?? discovery.home;
    return files
      .filter((path) =>
        MARKDOWN_EXTENSIONS.includes(extname(path).toLowerCase()),
      )
      .map((path) => ({
        absolutePath: resolve(sourceRoot, path),
        sourcePath: path,
        sourceRoot,
        route:
          path === index
            ? normalizeRoute(declaration.routeBase ?? "/")
            : routeForPath(path, "docs", declaration.routeBase),
        trust: declaration.trust ?? "markdown",
        packageLock,
      }));
  }

  if ("file" in declaration) {
    const absolutePath = resolveSourcePath(
      root,
      declaration.file,
      config.content.allowOutsideRoot,
    );
    if (!(await isFile(absolutePath))) return [];
    return [
      {
        absolutePath,
        sourcePath: toPosix(relative(root, absolutePath)),
        sourceRoot: root,
        ...(declaration.route ? { route: declaration.route } : {}),
        ...(declaration.title ? { title: declaration.title } : {}),
        ...(declaration.description
          ? { description: declaration.description }
          : {}),
        trust: "mdx",
      },
    ];
  }

  const patterns = Array.isArray(declaration.glob)
    ? declaration.glob
    : [declaration.glob];
  const paths = await glob(patterns, {
    cwd: root,
    onlyFiles: true,
    dot: false,
    ignore: ["**/_*/**", "**/_*", ...(declaration.exclude ?? [])],
  });
  return paths.map((path) => {
    const absolutePath = resolveSourcePath(
      root,
      path,
      config.content.allowOutsideRoot,
    );
    return {
      absolutePath,
      sourcePath: toPosix(relative(root, absolutePath)),
      sourceRoot: root,
      route: routeForPath(path, declaration.base, declaration.routeBase),
      trust: "mdx",
    };
  });
}

async function readEntry(
  source: CollectedSource,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<DocsEntry | undefined> {
  if (
    extname(source.sourcePath).toLowerCase() === ".mdx" &&
    source.trust !== "mdx"
  ) {
    diagnostics.push({
      code: "DOCS_UNTRUSTED_MDX",
      severity: "error",
      message: `Package MDX requires trust: 'mdx': ${source.sourcePath}.`,
      file: source.sourcePath,
      hint: "Keep package sources in Markdown-safe mode or explicitly trust this locked artifact.",
    });
    return undefined;
  }
  const original = await readFile(source.absolutePath, "utf8");
  const parsedMatter = matter(original);
  const frontmatter = parsedMatter.data as DocsFrontmatter;
  for (const key of Object.keys(parsedMatter.data)) {
    if (!FRONTMATTER_KEYS.has(key)) {
      diagnostics.push({
        code: "DOCS_FRONTMATTER_INVALID",
        severity: "error",
        message: `Unknown frontmatter key "${key}".`,
        file: source.sourcePath,
      });
    }
  }
  const parsed = parseMarkdown(parsedMatter.content);
  const route = normalizeRoute(
    frontmatter.slug ?? source.route ?? routeForPath(source.sourcePath),
  );
  const title =
    frontmatter.title ??
    source.title ??
    parsed.firstHeading ??
    titleFromFile(source.sourcePath);
  const description =
    frontmatter.description ?? source.description ?? parsed.description;
  const duplicateTitles = new Map<string, number>();
  for (const heading of parsed.headings) {
    const count = (duplicateTitles.get(heading.text) ?? 0) + 1;
    duplicateTitles.set(heading.text, count);
    if (count > 1) {
      diagnostics.push({
        code: "DOCS_HEADING_DUPLICATE",
        severity: "warning",
        message: `Repeated heading "${heading.text}" receives the generated ID "${heading.slug}".`,
        file: source.sourcePath,
        ...(heading.line ? { line: heading.line } : {}),
      });
    }
  }
  const idPrefix = source.packageLock?.resolved ?? "local";
  return {
    id: `${idPrefix}:${source.sourcePath}`,
    sourcePath: source.sourcePath,
    absolutePath: source.absolutePath,
    sourceRoot: source.sourceRoot,
    route,
    title,
    ...(description ? { description } : {}),
    frontmatter,
    headings: parsed.headings,
    body: parsedMatter.content,
    transformedBody: parsedMatter.content,
    ast: parsed.ast,
    links: [],
    assets: [],
    trust: source.trust,
    ...(source.packageLock
      ? {
          package: {
            requested: source.packageLock.requested,
            resolved: source.packageLock.resolved,
          },
        }
      : {}),
  };
}

async function transformEntry(
  entry: DocsEntry,
  absoluteMap: Map<string, DocsEntry>,
  routeMap: Map<string, DocsEntry>,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  const ast = cloneAst(entry.ast);
  if (config.markdown.stripLeadingBadges) stripLeadingBadgeBlock(ast);
  removeRenderedTitle(ast, entry.title);

  visit(ast, (node) => {
    if (node.type === "html" && entry.trust === "markdown") {
      const unsafe = /<\s*script\b|\son[a-z]+\s*=|javascript:/i.test(
        node.value,
      );
      if (unsafe) {
        diagnostics.push({
          code: "DOCS_UNSAFE_HTML",
          severity: "error",
          message: "Script-capable HTML is not allowed in package Markdown.",
          file: entry.sourcePath,
          ...(node.position?.start.line
            ? { line: node.position.start.line }
            : {}),
        });
        node.value = "";
      }
    }
  });

  const linkTasks: Promise<void>[] = [];
  visit(ast, (node) => {
    if (node.type === "link") {
      linkTasks.push(
        rewriteLink(node, entry, absoluteMap, routeMap, config, diagnostics),
      );
    } else if (node.type === "image") {
      linkTasks.push(rewriteAsset(node, entry, config, diagnostics));
    }
  });
  await Promise.all(linkTasks);
  entry.ast = ast;
  entry.transformedBody = serializeMarkdown(ast);
}

async function rewriteLink(
  node: Link,
  entry: DocsEntry,
  absoluteMap: Map<string, DocsEntry>,
  routeMap: Map<string, DocsEntry>,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  const reference: import("../types.js").DocsReference = {
    original: node.url,
    ...lineData(node),
  };
  entry.links.push(reference);
  if (unsafeProtocol(node.url)) {
    diagnostic(
      diagnostics,
      "DOCS_LINK_UNSAFE",
      `Unsafe URL protocol: ${node.url}.`,
      entry,
      node,
    );
    return;
  }
  if (isExternal(node.url) || node.url.startsWith("#")) return;
  const { pathname, query, fragment } = splitReference(node.url);
  if (pathname.startsWith("/")) {
    const target = routeMap.get(normalizeRoute(pathname));
    if (!target) missingLink(diagnostics, entry, node, node.url, config);
    else validateFragment(fragment, target, entry, node, diagnostics, config);
    return;
  }
  const decoded = safeDecode(pathname);
  const targetPath = resolve(dirname(entry.absolutePath), decoded);
  if (!inside(entry.sourceRoot, targetPath)) {
    diagnostic(
      diagnostics,
      "DOCS_SOURCE_OUTSIDE_ROOT",
      `Link escapes its allowed source root: ${node.url}.`,
      entry,
      node,
    );
    return;
  }
  const target = findDocument(targetPath, absoluteMap);
  if (!target) {
    if (await isFile(targetPath)) return;
    missingLink(diagnostics, entry, node, node.url, config);
    return;
  }
  node.url = `${withBase(target.route, config.build.base)}${query}${fragment ? `#${fragment}` : ""}`;
  reference.resolved = node.url;
  reference.targetSource = target.sourcePath;
  if (fragment) reference.fragment = fragment;
  validateFragment(fragment, target, entry, node, diagnostics, config);
}

async function rewriteAsset(
  node: Image,
  entry: DocsEntry,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  const asset: DocsAsset = {
    original: node.url,
    ...lineData(node),
  };
  entry.assets.push(asset);
  if (isExternal(node.url)) return;
  if (unsafeProtocol(node.url)) {
    diagnostic(
      diagnostics,
      "DOCS_ASSET_UNSAFE",
      `Unsafe asset URL: ${node.url}.`,
      entry,
      node,
    );
    return;
  }
  const { pathname, query, fragment } = splitReference(node.url);
  const absolute = resolve(dirname(entry.absolutePath), safeDecode(pathname));
  if (!inside(entry.sourceRoot, absolute)) {
    diagnostic(
      diagnostics,
      "DOCS_SOURCE_OUTSIDE_ROOT",
      `Asset escapes its allowed source root: ${node.url}.`,
      entry,
      node,
    );
    return;
  }
  try {
    const info = await stat(absolute);
    if (!info.isFile()) throw new Error("not a file");
    if (info.size > config.build.maxAssetBytes) {
      throw new Error(`asset exceeds ${config.build.maxAssetBytes} bytes`);
    }
    const hash = createHash("sha256")
      .update(await readFile(absolute))
      .digest("hex")
      .slice(0, 12);
    const publicPath = withBase(
      `/_tasty-assets/${hash}-${basename(absolute)}`,
      config.build.base,
    );
    node.url = `${publicPath}${query}${fragment ? `#${fragment}` : ""}`;
    Object.assign(asset, {
      resolved: node.url,
      sourcePath: absolute,
      publicPath,
      hash,
      bytes: info.size,
    });
  } catch (error) {
    diagnostic(
      diagnostics,
      "DOCS_ASSET_NOT_FOUND",
      `Asset not found or invalid: ${node.url} (${errorMessage(error)}).`,
      entry,
      node,
    );
  }
}

function findDocument(
  path: string,
  absoluteMap: Map<string, DocsEntry>,
): DocsEntry | undefined {
  const candidates = [
    path,
    ...MARKDOWN_EXTENSIONS.map((extension) => `${path}${extension}`),
    ...MARKDOWN_EXTENSIONS.map((extension) =>
      resolve(path, `README${extension}`),
    ),
    ...MARKDOWN_EXTENSIONS.map((extension) =>
      resolve(path, `index${extension}`),
    ),
  ];
  for (const candidate of candidates) {
    const entry = absoluteMap.get(normalizeFs(candidate));
    if (entry) return entry;
  }
  return undefined;
}

function validateFragment(
  fragment: string,
  target: DocsEntry,
  source: DocsEntry,
  node: Link,
  diagnostics: DocsDiagnostic[],
  config: NormalizedDocsConfig,
): void {
  if (!fragment) return;
  const decoded = safeDecode(fragment);
  if (!target.headings.some((heading) => heading.slug === decoded)) {
    diagnostics.push({
      code: "DOCS_FRAGMENT_NOT_FOUND",
      severity: config.build.ci ? "error" : "warning",
      message: `Heading fragment #${fragment} does not exist on ${target.route}.`,
      file: source.sourcePath,
      ...lineData(node),
      hint: `Known headings: ${target.headings.map((heading) => `#${heading.slug}`).join(", ") || "(none)"}.`,
    });
  }
}

function missingLink(
  diagnostics: DocsDiagnostic[],
  entry: DocsEntry,
  node: Link,
  url: string,
  config: NormalizedDocsConfig,
): void {
  diagnostics.push({
    code: "DOCS_LINK_NOT_FOUND",
    severity: config.build.strict ? "error" : "warning",
    message: `Internal link target not found: ${url}.`,
    file: entry.sourcePath,
    ...lineData(node),
  });
}

function validateNavigation(
  items: NavigationItem[],
  routes: Map<string, DocsEntry>,
  diagnostics: DocsDiagnostic[],
): void {
  for (const item of items) {
    if (typeof item === "string") {
      if (!routes.has(normalizeRoute(item))) {
        diagnostics.push({
          code: "DOCS_NAV_TARGET_NOT_FOUND",
          severity: "error",
          message: `Navigation target does not exist: ${item}.`,
        });
      }
    } else if ("items" in item) {
      validateNavigation(item.items, routes, diagnostics);
    } else if (
      "link" in item &&
      item.link.startsWith("/") &&
      !routes.has(normalizeRoute(item.link))
    ) {
      diagnostics.push({
        code: "DOCS_NAV_TARGET_NOT_FOUND",
        severity: "error",
        message: `Navigation target does not exist: ${item.link}.`,
      });
    }
  }
}

export function normalizeRoute(route: string): string {
  const clean =
    route
      .split(/[?#]/, 1)[0]
      ?.replace(/\\/g, "/")
      .replace(/\/{2,}/g, "/") ?? "/";
  const segments = clean.split("/").filter(Boolean);
  if (segments.some((segment) => segment === ".."))
    throw new Error(`Route may not contain "..": ${route}.`);
  const normalized = `/${segments.join("/")}`;
  return normalized === "/" ? "/" : normalized.replace(/\/$/, "");
}

export function routeForPath(
  path: string,
  base?: string,
  routeBase?: string,
): string {
  let relativePath = toPosix(path);
  if (base) {
    const normalizedBase = toPosix(base)
      .replace(/^\.\//, "")
      .replace(/\/$/, "");
    if (relativePath === normalizedBase) relativePath = "";
    else if (relativePath.startsWith(`${normalizedBase}/`))
      relativePath = relativePath.slice(normalizedBase.length + 1);
  }
  relativePath = relativePath.replace(/\.(md|mdx)$/i, "");
  relativePath = relativePath
    .replace(/(^|\/)README$/i, "$1")
    .replace(/(^|\/)index$/i, "$1");
  return normalizeRoute(`${routeBase ?? ""}/${relativePath}`);
}

function resolveSourcePath(
  root: string,
  path: string,
  allowOutsideRoot: boolean,
): string {
  const absolute = isAbsolute(path) ? resolve(path) : resolve(root, path);
  if (!allowOutsideRoot && !inside(root, absolute))
    throw new OutsideRootError(path);
  return absolute;
}

function inside(root: string, path: string): boolean {
  const rel = relative(resolve(root), resolve(path));
  return (
    rel === "" ||
    (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))
  );
}

function splitReference(url: string): {
  pathname: string;
  query: string;
  fragment: string;
} {
  const hashIndex = url.indexOf("#");
  const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const queryIndex = withoutHash.indexOf("?");
  return {
    pathname: queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash,
    query: queryIndex >= 0 ? withoutHash.slice(queryIndex) : "",
    fragment,
  };
}

function isExternal(url: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url);
}

function unsafeProtocol(url: string): boolean {
  return /^(?:javascript|vbscript|data):/i.test(url.trim());
}

function withBase(route: string, base: string): string {
  const normalizedBase =
    base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;
  return `${normalizedBase}${normalizeRoute(route)}` || "/";
}

function titleFromFile(path: string): string {
  const raw = basename(path, extname(path)).replace(
    /^README$/i,
    basename(dirname(path)) || "Documentation",
  );
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function diagnostic(
  diagnostics: DocsDiagnostic[],
  code: string,
  message: string,
  entry: DocsEntry,
  node: PositionedNode,
): void {
  diagnostics.push({
    code,
    severity: "error",
    message,
    file: entry.sourcePath,
    ...lineData(node),
  });
}

type PositionedNode = { position?: { start: { line: number } } | undefined };

function lineOf(node: PositionedNode): number | undefined {
  return node.position?.start.line;
}

function lineData(
  node: PositionedNode,
): { line: number } | Record<string, never> {
  const line = lineOf(node);
  return line === undefined ? {} : { line };
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sourceLabel(source: DocsSource): string {
  if ("file" in source) return source.file;
  if ("glob" in source)
    return Array.isArray(source.glob) ? source.glob.join(", ") : source.glob;
  return source.package;
}

function normalizeFs(path: string): string {
  return resolve(path);
}

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

class OutsideRootError extends Error {
  constructor(path: string) {
    super(`Source path is outside the repository root: ${path}.`);
    this.name = "OutsideRootError";
  }
}
