import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
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
import { promisify } from "node:util";
import type { Definition, Image, Link, Root } from "mdast";
import { glob } from "tinyglobby";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { sanitizeMarkup } from "../html/index.js";
import { normalizeDocsConfig } from "../config/index.js";
import {
  cloneAst,
  parseMarkdown,
  removeRenderedTitle,
  serializeMarkdown,
  stripLeadingBadgeBlock,
} from "../markdown/index.js";
import {
  assertSafePackagePath,
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
  NavigationPlacement,
  PackageLockSource,
} from "../types.js";

interface RepositoryMetadata {
  url: string;
  directory?: string;
}

interface CollectedSource {
  sourceId: string;
  routeBase?: string;
  absolutePath: string;
  sourcePath: string;
  sourceRoot: string;
  editPath?: string;
  route?: string;
  title?: string;
  description?: string;
  navigation?: false | NavigationPlacement;
  trust: "markdown" | "mdx";
  packageLock?: PackageLockSource;
  repository?: RepositoryMetadata;
}

const MARKDOWN_EXTENSIONS = [".md", ".mdx"];
const execFileAsync = promisify(execFile);
const FRONTMATTER_KEYS = new Set([
  "aliases",
  "title",
  "description",
  "slug",
  "draft",
  "sidebar",
  "tableOfContents",
  "editUrl",
  "template",
  "hero",
  "lastUpdated",
  "prev",
  "next",
  "banner",
  "pagefind",
  "head",
]);

export async function createDocsGraph(
  options: CreateDocsGraphOptions = {},
): Promise<DocsGraph> {
  const root = resolve(options.root ?? process.cwd());
  const normalized = normalizeDocsConfig(options.config);
  const config: NormalizedDocsConfig = options.base
    ? { ...normalized, build: { ...normalized.build, base: options.base } }
    : normalized;
  const diagnostics: DocsDiagnostic[] = [];
  const lock = options.lock ?? (await readDocsLock(root));
  const collected = await collectSources(root, config, lock, diagnostics);
  const entries: DocsEntry[] = [];
  const routeMap = new Map<string, DocsEntry>();
  const absoluteMap = new Map<string, DocsEntry[]>();
  const sourceMap = new Map<string, DocsEntry[]>();
  const repositoryMap = new Map<string, RepositoryMetadata>();

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
    const absolute = normalizeFs(entry.absolutePath);
    absoluteMap.set(absolute, [...(absoluteMap.get(absolute) ?? []), entry]);
    sourceMap.set(entry.sourcePath, [
      ...(sourceMap.get(entry.sourcePath) ?? []),
      entry,
    ]);
    sourceMap.set(entry.id, [entry]);
    if (source.repository) repositoryMap.set(entry.id, source.repository);
    entries.push(entry);
  }

  if (entries.length === 0) {
    diagnostics.push({
      code: "DOCS_NO_PAGES",
      severity: "error",
      message:
        "No documentation pages were found. Add README.md, docs/**/*.md, or configure content.sources.",
    });
  }

  const redirects = resolveRedirects(
    config.redirects,
    entries,
    routeMap,
    diagnostics,
  );
  for (const [alias, target] of Object.entries(redirects)) {
    const entry = routeMap.get(target);
    if (entry) routeMap.set(alias, entry);
  }
  for (const entry of entries) {
    await transformEntry(
      entry,
      absoluteMap,
      routeMap,
      repositoryMap,
      config,
      diagnostics,
    );
  }
  validateNavigation(config.navigation.items ?? [], routeMap, diagnostics);
  for (const tab of config.navigation.tabs ?? []) {
    validateNavigation(
      [{ label: tab.label, link: tab.link }],
      routeMap,
      diagnostics,
    );
    validateNavigation(tab.items ?? [], routeMap, diagnostics);
  }

  entries.sort((left, right) => left.route.localeCompare(right.route));
  const routes: DocsRoute[] = entries.map((entry) => ({
    route: entry.route,
    entryId: entry.id,
    sourcePath: entry.sourcePath,
    title: entry.title,
    ...(entry.frontmatter.sidebar !== undefined
      ? { sidebar: entry.frontmatter.sidebar }
      : {}),
  }));
  const assets = Array.from(
    new Map(
      entries
        .flatMap((entry) => entry.assets)
        .map((asset) => [
          asset.publicPath ?? `${asset.original}:${asset.line ?? ""}`,
          asset,
        ]),
    ).values(),
  );
  return {
    redirects,
    root,
    config,
    entries,
    routes,
    assets,
    diagnostics,
    entryByRoute(route) {
      return routeMap.get(normalizeRoute(route));
    },
    entryBySource(sourcePath, sourceId) {
      const matches = sourceMap.get(sourcePath) ?? [];
      return sourceId
        ? matches.find((entry) => entry.sourceId === sourceId)
        : matches.length === 1
          ? matches[0]
          : undefined;
    },
  };
}

function resolveRedirects(
  configured: Record<string, string>,
  entries: DocsEntry[],
  routes: Map<string, DocsEntry>,
  diagnostics: DocsDiagnostic[],
): Record<string, string> {
  const requested = new Map<string, string>();
  const error = (message: string) =>
    diagnostics.push({
      code: "DOCS_REDIRECT_INVALID",
      severity: "error",
      message,
    });
  const add = (from: string, to: string) => {
    try {
      const alias = normalizeRoute(from);
      const target = normalizeRoute(to);
      if (routes.has(alias) || requested.has(alias))
        error(`Redirect ${alias} conflicts with an existing page or redirect.`);
      else requested.set(alias, target);
    } catch (cause) {
      error(errorMessage(cause));
    }
  };
  for (const [from, to] of Object.entries(configured)) add(from, to);
  for (const entry of entries) {
    for (const alias of entry.frontmatter.aliases ?? [])
      add(`${entry.routeBase}/${alias}`, entry.route);
  }
  const result: Record<string, string> = {};
  for (const [alias, target] of requested) {
    const seen = new Set([alias]);
    let current = target;
    while (requested.has(current) && !seen.has(current)) {
      seen.add(current);
      current = requested.get(current)!;
    }
    if (seen.has(current)) error(`Redirect cycle includes ${alias}.`);
    else if (!routes.has(current))
      error(`Redirect ${alias} points to missing document ${current}.`);
    else result[alias] = current;
  }
  return result;
}

async function collectSources(
  root: string,
  config: NormalizedDocsConfig,
  lock: CreateDocsGraphOptions["lock"],
  diagnostics: DocsDiagnostic[],
): Promise<CollectedSource[]> {
  const declarations =
    config.content.sources ?? (await conventionSources(root));
  const results: CollectedSource[] = [];
  const identities = new Set<string>();

  const sourceIds = new Set<string>();
  for (const [index, declaration] of declarations.entries()) {
    const sourceId = declaration.id ?? `source-${index + 1}`;
    if (sourceIds.has(sourceId)) {
      diagnostics.push({
        code: "DOCS_DUPLICATE_SOURCE",
        severity: "error",
        message: `Source id ${sourceId} is declared more than once.`,
      });
      continue;
    }
    sourceIds.add(sourceId);
    try {
      const found = await collectDeclaration(
        root,
        declaration,
        config,
        lock,
        sourceId,
      );
      if (found.length === 0) {
        diagnostics.push({
          code: "DOCS_SOURCE_NOT_FOUND",
          severity: "error",
          message: `Source did not match any files: ${sourceLabel(declaration)}.`,
        });
      }
      for (const source of found) {
        const identity = `${sourceId}:${normalizeFs(source.absolutePath)}`;
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
  sourceId: string,
): Promise<CollectedSource[]> {
  if ("package" in declaration) {
    const packageLock = lockForSource(lock, declaration.package);
    if (declaration.registry && packageLock.registry !== declaration.registry) {
      throw new Error(
        `Registry changed for ${declaration.package}. Run "cookbook update".`,
      );
    }
    const sourceRoot = await materializePackage(
      packageLock,
      config.build,
      root,
    );
    const discovery = await discoverPackage(sourceRoot);
    const repository = config.content.localizeRepositoryLinks
      ? repositoryMetadata(discovery.manifest.repository)
      : undefined;
    const patterns = declaration.include?.length
      ? declaration.include
      : discovery.pages;
    for (const pattern of patterns) {
      assertSafePackagePath(pattern, "Package source include");
    }
    for (const pattern of declaration.exclude ?? []) {
      assertSafePackagePath(pattern, "Package source exclude");
    }
    if (declaration.index) {
      assertSafePackagePath(declaration.index, "Package source index");
    }
    const files = await glob(patterns, {
      cwd: sourceRoot,
      onlyFiles: true,
      ignore: declaration.exclude ?? [],
    });
    const index = declaration.index ?? discovery.home;
    return files
      .filter((path) =>
        MARKDOWN_EXTENSIONS.includes(extname(path).toLowerCase()),
      )
      .map((path) => {
        assertSafePackagePath(path, "Discovered package source");
        const absolutePath = resolve(sourceRoot, path);
        if (!inside(sourceRoot, absolutePath)) throw new OutsideRootError(path);
        return {
          sourceId,
          ...(declaration.routeBase
            ? { routeBase: declaration.routeBase }
            : {}),
          absolutePath,
          sourcePath: path,
          sourceRoot,
          route:
            path === index
              ? normalizeRoute(declaration.routeBase ?? "/")
              : routeForPath(path, "docs", declaration.routeBase),
          trust: declaration.trust ?? "markdown",
          packageLock,
          ...(repository ? { repository } : {}),
        };
      });
  }

  const sourceRoot = resolve(root, declaration.root ?? ".");
  const repository = config.content.localizeRepositoryLinks
    ? repositoryMetadata(config.site.repository)
    : undefined;

  if ("file" in declaration) {
    const absolutePath = resolveSourcePath(
      sourceRoot,
      declaration.file,
      config.content.allowOutsideRoot,
    );
    if (!(await isFile(absolutePath))) return [];
    return [
      {
        sourceId,
        ...(declaration.routeBase ? { routeBase: declaration.routeBase } : {}),
        absolutePath,
        sourcePath: toPosix(relative(sourceRoot, absolutePath)),
        editPath: toPosix(
          relative(
            inside(root, absolutePath) ? root : sourceRoot,
            absolutePath,
          ),
        ),
        sourceRoot,
        route: declaration.route
          ? normalizeRoute(
              `${declaration.routeBase ?? ""}/${declaration.route}`,
            )
          : routeForPath(declaration.file, undefined, declaration.routeBase),
        ...(declaration.title ? { title: declaration.title } : {}),
        ...(declaration.description
          ? { description: declaration.description }
          : {}),
        ...(declaration.navigation !== undefined
          ? { navigation: declaration.navigation }
          : {}),
        trust: "mdx",
        ...(repository ? { repository } : {}),
      },
    ];
  }

  const patterns = Array.isArray(declaration.glob)
    ? declaration.glob
    : [declaration.glob];
  const paths = await glob(patterns, {
    cwd: sourceRoot,
    onlyFiles: true,
    dot: false,
    ignore: ["**/_*/**", "**/_*", ...(declaration.exclude ?? [])],
  });
  return paths.map((path) => {
    const absolutePath = resolveSourcePath(
      sourceRoot,
      path,
      config.content.allowOutsideRoot,
    );
    return {
      sourceId,
      ...(declaration.routeBase ? { routeBase: declaration.routeBase } : {}),
      absolutePath,
      sourcePath: toPosix(relative(sourceRoot, absolutePath)),
      editPath: toPosix(
        relative(inside(root, absolutePath) ? root : sourceRoot, absolutePath),
      ),
      sourceRoot,
      route: routeForPath(path, declaration.base, declaration.routeBase),
      ...(declaration.navigation === false ? { navigation: false } : {}),
      trust: "mdx",
      ...(repository ? { repository } : {}),
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
  let parsedMatter: ReturnType<typeof parseFrontmatter>;
  try {
    parsedMatter = parseFrontmatter(original);
  } catch (error) {
    diagnostics.push({
      code: "DOCS_FRONTMATTER_INVALID",
      severity: "error",
      message: `Could not parse frontmatter: ${errorMessage(error)}.`,
      file: source.sourcePath,
    });
    return undefined;
  }
  const frontmatter = parsedMatter.data;
  if (frontmatter.sidebar === undefined && source.navigation !== undefined) {
    frontmatter.sidebar = source.navigation;
  }
  const diagnosticCount = diagnostics.length;
  const metadata: Record<string, unknown> = {};
  for (const key of Object.keys(frontmatter)) {
    if (!FRONTMATTER_KEYS.has(key)) {
      if (config.content.frontmatter !== "reject") {
        metadata[key] = (frontmatter as Record<string, unknown>)[key];
        delete (frontmatter as Record<string, unknown>)[key];
        continue;
      }
      diagnostics.push({
        code: "DOCS_FRONTMATTER_INVALID",
        severity: "error",
        message: `Unknown frontmatter key "${key}".`,
        file: source.sourcePath,
      });
    }
  }
  validateFrontmatter(frontmatter, source.sourcePath, diagnostics);
  if (diagnostics.length > diagnosticCount) return undefined;
  const mdx = extname(source.sourcePath).toLowerCase() === ".mdx";
  const parsed = parseMarkdown(parsedMatter.content, { mdx });
  const route = normalizeRoute(
    frontmatter.slug !== undefined
      ? `${source.routeBase ?? ""}/${frontmatter.slug}`
      : (source.route ?? routeForPath(source.sourcePath)),
  );
  const title =
    frontmatter.title ??
    source.title ??
    parsed.firstHeading ??
    titleFromFile(source.sourcePath);
  const description =
    frontmatter.description ?? source.description ?? parsed.description;
  await resolvePageMetadata(frontmatter, source, config);
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
  return {
    id: `${source.sourceId}:${source.sourcePath}`,
    sourceId: source.sourceId,
    routeBase: source.routeBase ?? "/",
    metadata,
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

async function resolvePageMetadata(
  frontmatter: DocsFrontmatter,
  source: CollectedSource,
  config: NormalizedDocsConfig,
): Promise<void> {
  if (frontmatter.editUrl === undefined && config.editLink) {
    const baseUrl = config.editLink.baseUrl.endsWith("/")
      ? config.editLink.baseUrl
      : `${config.editLink.baseUrl}/`;
    frontmatter.editUrl = `${baseUrl}${(source.editPath ?? source.sourcePath).replace(/^\/+/, "")}`;
  }

  if (frontmatter.lastUpdated === false) return;
  if (frontmatter.lastUpdated === undefined && config.lastUpdated === false) {
    return;
  }
  if (frontmatter.lastUpdated instanceof Date) return;

  try {
    const { stdout } = await execFileAsync(
      "git",
      ["log", "-1", "--format=%ct", "--", source.absolutePath],
      { cwd: source.sourceRoot },
    );
    const timestamp = Number(stdout.trim());
    if (Number.isFinite(timestamp) && timestamp > 0) {
      frontmatter.lastUpdated = new Date(timestamp * 1000);
    }
  } catch {
    // Sources can come from npm caches or directories without Git history.
  }
}

async function transformEntry(
  entry: DocsEntry,
  absoluteMap: Map<string, DocsEntry[]>,
  routeMap: Map<string, DocsEntry>,
  repositoryMap: Map<string, RepositoryMetadata>,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  sanitizeUntrustedFrontmatter(entry, config, diagnostics);
  const ast = cloneAst(entry.ast);
  if (config.markdown.stripLeadingBadges) stripLeadingBadgeBlock(ast);
  removeRenderedTitle(ast, entry.title);

  const htmlTasks: Promise<void>[] = [];
  visit(ast, "html", (node) => {
    const policy = rawHtmlPolicy(entry, config);
    if (policy === "allow") return;
    if (policy === "sanitize") {
      htmlTasks.push(
        sanitizeMarkup(node.value, async (url, kind) => {
          const reference: Link = {
            type: "link",
            url,
            children: [],
            ...(node.position ? { position: node.position } : {}),
          };
          if (kind === "link") {
            await rewriteLink(
              reference,
              entry,
              absoluteMap,
              routeMap,
              repositoryMap,
              config,
              diagnostics,
            );
          } else {
            const image: Image = {
              type: "image",
              url,
              alt: "",
              ...(node.position ? { position: node.position } : {}),
            };
            await rewriteAsset(image, entry, config, diagnostics);
            reference.url = image.url;
          }
          return reference.url;
        }).then((html) => {
          node.value = html;
        }),
      );
      return;
    }
    diagnostics.push({
      code:
        policy === "reject"
          ? "DOCS_RAW_HTML_REJECTED"
          : "DOCS_RAW_HTML_STRIPPED",
      severity: policy === "reject" ? "error" : "warning",
      message: `Raw HTML was ${policy === "reject" ? "rejected" : "removed"}: ${entry.sourcePath}.`,
      file: entry.sourcePath,
      ...lineData(node),
    });
    node.value = "";
  });
  await Promise.all(htmlTasks);

  const referenceKinds = new Map<string, "link" | "image" | "mixed">();
  visit(ast, (node) => {
    if (node.type !== "linkReference" && node.type !== "imageReference") {
      return;
    }
    const key = node.identifier.toLowerCase();
    const kind = node.type === "imageReference" ? "image" : "link";
    const previous = referenceKinds.get(key);
    referenceKinds.set(key, previous && previous !== kind ? "mixed" : kind);
  });

  const linkTasks: Promise<void>[] = [];
  visit(ast, (node) => {
    if (node.type === "link") {
      linkTasks.push(
        rewriteLink(
          node,
          entry,
          absoluteMap,
          routeMap,
          repositoryMap,
          config,
          diagnostics,
        ),
      );
    } else if (node.type === "image") {
      linkTasks.push(rewriteAsset(node, entry, config, diagnostics));
    } else if (node.type === "definition") {
      const kind = referenceKinds.get(node.identifier.toLowerCase());
      if (kind === "image") {
        linkTasks.push(rewriteAsset(node, entry, config, diagnostics));
      } else if (kind === "link") {
        linkTasks.push(
          rewriteLink(
            node,
            entry,
            absoluteMap,
            routeMap,
            repositoryMap,
            config,
            diagnostics,
          ),
        );
      } else if (kind === "mixed") {
        linkTasks.push(
          rewriteDefinition(
            node,
            entry,
            absoluteMap,
            routeMap,
            repositoryMap,
            config,
            diagnostics,
          ),
        );
      }
    }
  });
  await Promise.all(linkTasks);
  await rewriteFrontmatterReferences(
    entry,
    absoluteMap,
    routeMap,
    repositoryMap,
    config,
    diagnostics,
  );
  entry.ast = ast;
  entry.transformedBody = serializeMarkdown(ast, {
    mdx: extname(entry.sourcePath).toLowerCase() === ".mdx",
  });
}

function sanitizeUntrustedFrontmatter(
  entry: DocsEntry,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): void {
  if (entry.trust !== "markdown") return;
  let removed = false;
  const plainText = (value: string): string => {
    const sanitized = value.replace(/<!--[\s\S]*?-->|<[^>]*>/g, "");
    if (sanitized !== value) removed = true;
    return sanitized;
  };

  entry.title = plainText(entry.title);
  if (entry.frontmatter.title !== undefined) {
    entry.frontmatter.title = plainText(entry.frontmatter.title);
  }
  const hero = entry.frontmatter.hero;
  if (hero?.title !== undefined) hero.title = plainText(hero.title);
  if (hero?.tagline !== undefined) hero.tagline = plainText(hero.tagline);
  if (hero?.image && "html" in hero.image) {
    delete hero.image;
    removed = true;
  }
  if (entry.frontmatter.banner) {
    entry.frontmatter.banner.content = plainText(
      entry.frontmatter.banner.content,
    );
  }
  if (entry.frontmatter.head) {
    delete entry.frontmatter.head;
    removed = true;
  }

  if (removed) {
    diagnostics.push({
      code:
        config.markdown.rawHtml === "reject"
          ? "DOCS_RAW_HTML_REJECTED"
          : "DOCS_UNTRUSTED_HTML",
      severity: config.markdown.rawHtml === "reject" ? "error" : "warning",
      message:
        config.markdown.rawHtml === "reject"
          ? `HTML-capable frontmatter is not allowed by markdown.rawHtml: ${entry.sourcePath}.`
          : "HTML-capable frontmatter was sanitized in package Markdown. Use trust: 'mdx' only for packages you trust.",
      file: entry.sourcePath,
    });
  }
}

function rawHtmlPolicy(
  entry: DocsEntry,
  config: NormalizedDocsConfig,
): NormalizedDocsConfig["markdown"]["rawHtml"] {
  if (config.markdown.rawHtml === "reject") return "reject";
  if (config.markdown.rawHtml === "strip") return "strip";
  return entry.trust === "markdown" ? "sanitize" : config.markdown.rawHtml;
}

async function rewriteFrontmatterReferences(
  entry: DocsEntry,
  absoluteMap: Map<string, DocsEntry[]>,
  routeMap: Map<string, DocsEntry>,
  repositoryMap: Map<string, RepositoryMetadata>,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  for (const action of entry.frontmatter.hero?.actions ?? []) {
    const node: Link = { type: "link", url: action.link, children: [] };
    await rewriteLink(
      node,
      entry,
      absoluteMap,
      routeMap,
      repositoryMap,
      config,
      diagnostics,
    );
    action.link = node.url;
  }

  const image = entry.frontmatter.hero?.image;
  if (!image || "html" in image) return;
  if ("file" in image) {
    image.file = await rewriteFrontmatterAsset(
      image.file,
      entry,
      config,
      diagnostics,
    );
    return;
  }
  const [dark, light] = await Promise.all([
    rewriteFrontmatterAsset(image.dark, entry, config, diagnostics),
    rewriteFrontmatterAsset(image.light, entry, config, diagnostics),
  ]);
  image.dark = dark;
  image.light = light;
}

async function rewriteFrontmatterAsset(
  url: string,
  entry: DocsEntry,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<string> {
  const asset = await materializeAsset(url, entry, config, diagnostics, {});
  entry.assets.push(asset);
  return asset.resolved ?? url;
}

async function rewriteLink(
  node: Link | Definition,
  entry: DocsEntry,
  absoluteMap: Map<string, DocsEntry[]>,
  routeMap: Map<string, DocsEntry>,
  repositoryMap: Map<string, RepositoryMetadata>,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  const reference: import("../types.js").DocsReference = {
    original: node.url,
    ...lineData(node),
  };
  entry.links.push(reference);
  if (node.url.startsWith("source:")) {
    const { pathname, query, fragment } = splitReference(node.url.slice(7));
    const slash = pathname.indexOf("/");
    const sourceId = slash < 0 ? pathname : pathname.slice(0, slash);
    const sourcePath = safeDecode(pathname.slice(slash + 1));
    const target = [...absoluteMap.values()]
      .flat()
      .find(
        (candidate) =>
          candidate.sourceId === sourceId &&
          candidate.sourcePath === sourcePath,
      );
    if (!target || slash < 0)
      missingLink(diagnostics, entry, node, node.url, config);
    else {
      node.url = `${withBase(target.route, config.build.base)}${query}${fragment ? `#${fragment}` : ""}`;
      reference.resolved = node.url;
      reference.targetSource = target.sourcePath;
      validateFragment(fragment, target, entry, node, diagnostics, config);
    }
    return;
  }
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
  if (isExternal(node.url)) {
    const target = config.content.localizeRepositoryLinks
      ? localizedRepositoryTarget(
          node.url,
          entry,
          absoluteMap,
          repositoryMap.get(entry.id),
        )
      : undefined;
    if (!target) return;
    const { query, fragment } = splitReference(node.url);
    node.url = `${withBase(target.route, config.build.base)}${query}${fragment ? `#${fragment}` : ""}`;
    reference.resolved = node.url;
    reference.targetSource = target.sourcePath;
    if (fragment) reference.fragment = fragment;
    validateFragment(fragment, target, entry, node, diagnostics, config);
    return;
  }
  if (node.url.startsWith("#")) return;
  const { pathname, query, fragment } = splitReference(node.url);
  if (pathname.startsWith("/")) {
    const target = routeMap.get(normalizeRoute(pathname));
    if (!target) missingLink(diagnostics, entry, node, node.url, config);
    else {
      node.url = `${withBase(target.route, config.build.base)}${query}${fragment ? `#${fragment}` : ""}`;
      reference.resolved = node.url;
      reference.targetSource = target.sourcePath;
      if (fragment) reference.fragment = fragment;
      validateFragment(fragment, target, entry, node, diagnostics, config);
    }
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
  const target = findDocument(targetPath, absoluteMap, entry.sourceId);
  if (!target) {
    if (documentMatches(targetPath, absoluteMap).length > 1) {
      diagnostic(
        diagnostics,
        "DOCS_AMBIGUOUS_LINK",
        `Link matches multiple source mounts: ${node.url}. Use source:<id>/<path> to choose a source.`,
        entry,
        node,
      );
      return;
    }
    if (await isFile(targetPath)) {
      const asset = await materializeAsset(
        node.url,
        entry,
        config,
        diagnostics,
        node,
      );
      if (asset.resolved) {
        node.url = asset.resolved;
        reference.resolved = asset.resolved;
      }
      entry.assets.push(asset);
      return;
    }
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
  node: Image | Definition,
  entry: DocsEntry,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  const asset = await materializeAsset(
    node.url,
    entry,
    config,
    diagnostics,
    node,
  );
  entry.assets.push(asset);
  if (asset.resolved) node.url = asset.resolved;
}

async function materializeAsset(
  url: string,
  entry: DocsEntry,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
  node: PositionedNode,
): Promise<DocsAsset> {
  const asset: DocsAsset = { original: url, ...lineData(node) };
  if (unsafeProtocol(url)) {
    diagnostic(
      diagnostics,
      "DOCS_ASSET_UNSAFE",
      `Unsafe asset URL: ${url}.`,
      entry,
      node,
    );
    return asset;
  }
  if (isExternal(url) || url.startsWith("#")) return asset;
  const { pathname, query, fragment } = splitReference(url);
  const absolute = resolve(dirname(entry.absolutePath), safeDecode(pathname));
  if (!inside(entry.sourceRoot, absolute)) {
    diagnostic(
      diagnostics,
      "DOCS_SOURCE_OUTSIDE_ROOT",
      `Asset escapes its allowed source root: ${url}.`,
      entry,
      node,
    );
    return asset;
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
    const resolved = `${publicPath}${query}${fragment ? `#${fragment}` : ""}`;
    Object.assign(asset, {
      resolved,
      sourcePath: absolute,
      publicPath,
      hash,
      bytes: info.size,
    });
  } catch (error) {
    diagnostic(
      diagnostics,
      "DOCS_ASSET_NOT_FOUND",
      `Asset not found or invalid: ${url} (${errorMessage(error)}).`,
      entry,
      node,
    );
  }
  return asset;
}

async function rewriteDefinition(
  node: Definition,
  entry: DocsEntry,
  absoluteMap: Map<string, DocsEntry[]>,
  routeMap: Map<string, DocsEntry>,
  repositoryMap: Map<string, RepositoryMetadata>,
  config: NormalizedDocsConfig,
  diagnostics: DocsDiagnostic[],
): Promise<void> {
  const { pathname } = splitReference(node.url);
  const targetPath = resolve(dirname(entry.absolutePath), safeDecode(pathname));
  if (
    documentMatches(targetPath, absoluteMap).length > 0 ||
    node.url.startsWith("source:") ||
    pathname.startsWith("/")
  ) {
    await rewriteLink(
      node,
      entry,
      absoluteMap,
      routeMap,
      repositoryMap,
      config,
      diagnostics,
    );
  } else {
    await rewriteAsset(node, entry, config, diagnostics);
  }
}

function findDocument(
  path: string,
  absoluteMap: Map<string, DocsEntry[]>,
  sourceId?: string,
): DocsEntry | undefined {
  const matches = documentMatches(path, absoluteMap);
  return (
    matches.find((item) => item.sourceId === sourceId) ??
    (matches.length === 1 ? matches[0] : undefined)
  );
}

function documentMatches(
  path: string,
  absoluteMap: Map<string, DocsEntry[]>,
): DocsEntry[] {
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
    const matches = absoluteMap.get(normalizeFs(candidate)) ?? [];
    if (matches.length) return matches;
  }
  return [];
}

function validateFragment(
  fragment: string,
  target: DocsEntry,
  source: DocsEntry,
  node: Link | Definition,
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
  node: Link | Definition,
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
    } else if (
      item.link?.startsWith("/") &&
      !routes.has(normalizeRoute(item.link))
    ) {
      diagnostics.push({
        code: "DOCS_NAV_TARGET_NOT_FOUND",
        severity: "error",
        message: `Navigation target does not exist: ${item.link}.`,
      });
    }
    if (typeof item !== "string" && "items" in item) {
      validateNavigation(item.items, routes, diagnostics);
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

function localizedRepositoryTarget(
  value: string,
  entry: DocsEntry,
  entries: Map<string, DocsEntry[]>,
  metadata: RepositoryMetadata | undefined,
): DocsEntry | undefined {
  if (!metadata) return undefined;
  let link: URL;
  let repository: URL;
  try {
    link = new URL(value);
    repository = new URL(metadata.url);
  } catch {
    return undefined;
  }
  const repositoryPath = repository.pathname.replace(/\/+$/, "");
  if (
    link.origin !== repository.origin ||
    !link.pathname.startsWith(`${repositoryPath}/`)
  ) {
    return undefined;
  }
  const repositoryRelative = safeDecode(
    link.pathname.slice(repositoryPath.length + 1),
  );
  if (
    !/^(?:-\/(?:blob|tree|raw)|blob|tree|raw|src)\//.test(repositoryRelative)
  ) {
    return undefined;
  }

  const directory = metadata.directory?.replace(/^\/+|\/+$/g, "");
  const matches = [...entries.values()]
    .flat()
    .filter((candidate) => candidate.sourceRoot === entry.sourceRoot)
    .flatMap((candidate) => {
      const sourcePath = candidate.sourcePath.replace(/^\/+/, "");
      const paths = [sourcePath];
      if (/(?:^|\/)(?:README|index)\.mdx?$/i.test(sourcePath)) {
        paths.push(sourcePath.replace(/(?:^|\/)(?:README|index)\.mdx?$/i, ""));
      }
      const repositoryPaths = paths
        .flatMap((path) => [
          path,
          ...(directory ? [`${directory}/${path}`] : []),
        ])
        .map((path) => path.replace(/\/+$/, ""))
        .filter(Boolean);
      const matched = repositoryPaths.find(
        (path) =>
          repositoryRelative === path ||
          repositoryRelative.endsWith(`/${path}`),
      );
      return matched ? [{ candidate, length: matched.length }] : [];
    })
    .sort(
      (left, right) =>
        Number(right.candidate.sourceId === entry.sourceId) -
          Number(left.candidate.sourceId === entry.sourceId) ||
        right.length - left.length,
    );
  return matches[0]?.candidate;
}

function repositoryMetadata(
  repository:
    string | { type?: string; url?: string; directory?: string } | undefined,
): RepositoryMetadata | undefined {
  let raw = typeof repository === "string" ? repository : repository?.url;
  if (!raw) return undefined;
  raw = raw.replace(/^git\+/, "");
  const scp = /^git@([^:]+):(.+)$/.exec(raw);
  if (scp) raw = `https://${scp[1]}/${scp[2]}`;
  try {
    let url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      if (!url.hostname || !["git:", "ssh:"].includes(url.protocol)) {
        return undefined;
      }
      url = new URL(`https://${url.hostname}${url.pathname}`);
    }
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\.git\/?$/, "").replace(/\/+$/, "");
    const directory =
      typeof repository === "object"
        ? repository.directory?.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "")
        : undefined;
    return {
      url: url.href.replace(/\/$/, ""),
      ...(directory ? { directory } : {}),
    };
  } catch {
    return undefined;
  }
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

function parseFrontmatter(source: string): {
  data: DocsFrontmatter;
  content: string;
} {
  const match =
    /^(?:\uFEFF)?---[\t ]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[\t ]*(?:\r?\n|$)/.exec(
      source,
    );
  if (!match) return { data: {}, content: source };
  const value = parseYaml(match[1] ?? "");
  if (value !== null && !isPlainRecord(value)) {
    throw new Error("Markdown frontmatter must be a YAML object.");
  }
  const data = (value ?? {}) as DocsFrontmatter;
  if (
    typeof data.lastUpdated === "string" &&
    !Number.isNaN(Date.parse(data.lastUpdated))
  ) {
    data.lastUpdated = new Date(data.lastUpdated);
  }
  return { data, content: source.slice(match[0].length) };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateFrontmatter(
  value: DocsFrontmatter,
  file: string,
  diagnostics: DocsDiagnostic[],
): void {
  const record = value as Record<string, unknown>;
  const error = (message: string) =>
    diagnostics.push({
      code: "DOCS_FRONTMATTER_INVALID",
      severity: "error",
      message,
      file,
    });
  if (
    value.aliases !== undefined &&
    (!Array.isArray(value.aliases) ||
      value.aliases.some((alias) => typeof alias !== "string"))
  )
    error("aliases must be an array of route strings.");
  for (const key of ["title", "description", "slug"] as const) {
    if (record[key] !== undefined && typeof record[key] !== "string") {
      error(`${key} must be a string.`);
    }
  }
  for (const key of ["draft", "pagefind"] as const) {
    if (record[key] !== undefined && typeof record[key] !== "boolean") {
      error(`${key} must be a boolean.`);
    }
  }
  if (
    record.template !== undefined &&
    record.template !== "doc" &&
    record.template !== "splash"
  ) {
    error('template must be "doc" or "splash".');
  }
  for (const key of ["sidebar", "tableOfContents"] as const) {
    const entry = record[key];
    if (entry !== undefined && entry !== false && !isPlainRecord(entry)) {
      error(`${key} must be false or an object.`);
    }
  }
  if (isPlainRecord(record.sidebar)) {
    validateOptionalStrings(
      record.sidebar,
      ["label", "group"],
      "sidebar",
      error,
    );
    if (
      record.sidebar.order !== undefined &&
      typeof record.sidebar.order !== "number"
    ) {
      error("sidebar.order must be a number.");
    }
  }
  if (isPlainRecord(record.tableOfContents)) {
    for (const key of ["minHeadingLevel", "maxHeadingLevel"] as const) {
      const level = record.tableOfContents[key];
      if (
        level !== undefined &&
        (!Number.isInteger(level) || Number(level) < 1 || Number(level) > 6)
      ) {
        error(`tableOfContents.${key} must be an integer from 1 to 6.`);
      }
    }
  }
  if (
    record.editUrl !== undefined &&
    record.editUrl !== false &&
    typeof record.editUrl !== "string"
  ) {
    error("editUrl must be false or a string.");
  }
  if (
    record.lastUpdated !== undefined &&
    typeof record.lastUpdated !== "boolean" &&
    !(record.lastUpdated instanceof Date)
  ) {
    error("lastUpdated must be a date or boolean.");
  }
  if (record.hero !== undefined) {
    if (!isPlainRecord(record.hero)) {
      error("hero must be an object.");
    } else {
      validateHero(record.hero, error);
    }
  }
  if (record.banner !== undefined) {
    if (!isPlainRecord(record.banner)) {
      error("banner must be an object.");
    } else if (typeof record.banner.content !== "string") {
      error("banner.content must be a string.");
    }
  }
  for (const key of ["prev", "next"] as const) {
    const adjacent = record[key];
    if (
      adjacent !== undefined &&
      adjacent !== false &&
      typeof adjacent !== "string" &&
      !isPlainRecord(adjacent)
    ) {
      error(`${key} must be false, a string, or an object.`);
    } else if (isPlainRecord(adjacent)) {
      validateOptionalStrings(adjacent, ["link", "label"], key, error);
    }
  }
  if (
    record.head !== undefined &&
    (!Array.isArray(record.head) || !record.head.every(isPlainRecord))
  ) {
    error("head must be an array of objects.");
  }
}

function validateHero(
  hero: Record<string, unknown>,
  error: (message: string) => void,
): void {
  validateOptionalStrings(hero, ["title", "tagline"], "hero", error);
  if (hero.image !== undefined) {
    if (!isPlainRecord(hero.image)) {
      error("hero.image must be an object.");
    } else {
      const image = hero.image;
      const shapes = ["html", "file", "dark"].filter(
        (key) => image[key] !== undefined,
      );
      if (shapes.length !== 1) {
        error(
          "hero.image must define exactly one of html, file, or dark/light.",
        );
      }
      for (const key of ["html", "file", "dark", "light", "alt"] as const) {
        if (image[key] !== undefined && typeof image[key] !== "string") {
          error(`hero.image.${key} must be a string.`);
        }
      }
      if (image.dark !== undefined && typeof image.light !== "string") {
        error("hero.image.light must accompany hero.image.dark.");
      }
      if (image.light !== undefined && typeof image.dark !== "string") {
        error("hero.image.dark must accompany hero.image.light.");
      }
    }
  }
  if (hero.actions !== undefined) {
    if (!Array.isArray(hero.actions)) {
      error("hero.actions must be an array.");
    } else {
      for (const [index, action] of hero.actions.entries()) {
        if (!isPlainRecord(action)) {
          error(`hero.actions[${index}] must be an object.`);
          continue;
        }
        for (const key of ["text", "link"] as const) {
          if (typeof action[key] !== "string") {
            error(`hero.actions[${index}].${key} must be a string.`);
          }
        }
        if (
          action.variant !== undefined &&
          !["primary", "secondary", "minimal"].includes(String(action.variant))
        ) {
          error(
            `hero.actions[${index}].variant must be primary, secondary, or minimal.`,
          );
        }
      }
    }
  }
}

function validateOptionalStrings(
  record: Record<string, unknown>,
  keys: readonly string[],
  prefix: string,
  error: (message: string) => void,
): void {
  for (const key of keys) {
    if (record[key] !== undefined && typeof record[key] !== "string") {
      error(`${prefix}.${key} must be a string.`);
    }
  }
}
