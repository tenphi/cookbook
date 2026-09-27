import { readFile, readdir } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fromHtml } from "hast-util-from-html";
import type { Element, Root } from "hast";
import type { DocsDiagnostic, DocsGraph } from "../types.js";

export interface BuiltDocsOptions {
  directory: string;
  graph?: DocsGraph;
  /** Deployed base URL, including a path prefix when present. */
  deployedUrl?: string;
}
export interface BuiltDocsReport {
  ok: boolean;
  scope: "built-output" | "deployment";
  pages: number;
  assets: number;
  checkedUrls: number;
  diagnostics: DocsDiagnostic[];
}
type PublishedPage = {
  route: string;
  url: string;
  canonical?: string;
  index: boolean;
  sitemap: boolean;
  markdown?: string;
};
type Manifest = { base: string; site?: string; pages: PublishedPage[] };

/** Inspect actual output, then optionally fetch the same pages/assets from a host. */
export async function validateBuiltDocs(
  options: BuiltDocsOptions,
): Promise<BuiltDocsReport> {
  const directory = resolve(options.directory);
  const diagnostics: DocsDiagnostic[] = [];
  const error = (code: string, message: string, file?: string) =>
    diagnostics.push({
      code,
      severity: "error",
      message,
      ...(file ? { file } : {}),
    });
  let files: string[];
  let manifest: Manifest;
  try {
    files = (await readdir(directory, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) =>
        resolve(entry.parentPath, entry.name)
          .slice(directory.length + 1)
          .split(sep)
          .join("/"),
      );
    manifest = JSON.parse(
      await readFile(resolve(directory, "_cookbook/publishing.json"), "utf8"),
    );
    if (!manifest.base?.startsWith("/") || !Array.isArray(manifest.pages))
      throw Error("invalid publishing manifest");
  } catch (cause) {
    error(
      "DOCS_BUILD_MISSING",
      `Cannot read Cookbook output in ${directory}. Run astro build first. ${String(cause)}`,
    );
    return {
      ok: false,
      scope: options.deployedUrl ? "deployment" : "built-output",
      pages: 0,
      assets: 0,
      checkedUrls: 0,
      diagnostics,
    };
  }
  const base = manifest.base.replace(/\/$/, "");
  const origin =
    manifest.site ??
    manifest.pages.find((page) => /^https?:/.test(page.url))?.url ??
    "https://cookbook.invalid";
  const hasSite = new URL(origin).hostname !== "cookbook.invalid";
  if (!hasSite)
    diagnostics.push({
      code: "DOCS_SITE_URL_MISSING",
      severity: "warning",
      message:
        "No site.url (or Astro site) is configured; absolute canonicals and sitemap coverage cannot be verified.",
    });
  const fileSet = new Set(files);
  const pagePaths = new Map<string, string>();
  const documents = new Map<
    string,
    { ids: Set<string>; elements: Element[] }
  >();
  const urlForFile = (file: string) =>
    `${base}/${file.replace(/(^|\/)index\.html$/, "$1")}`;
  const normalizePath = (path: string) => path.replace(/\/$/, "") || "/";
  for (const file of files.filter((file) => file.endsWith(".html"))) {
    pagePaths.set(normalizePath(urlForFile(file)), file);
    pagePaths.set(normalizePath(`${base}/${file}`), file);
    const tree = fromHtml(await readFile(resolve(directory, file), "utf8"));
    const elements: Element[] = [];
    const visit = (node: Root | Element | Root["children"][number]) => {
      if (node.type === "element") elements.push(node);
      if ("children" in node) node.children.forEach(visit);
    };
    visit(tree);
    documents.set(file, {
      elements,
      ids: new Set(
        elements.flatMap((node) =>
          typeof node.properties.id === "string"
            ? [node.properties.id]
            : node.tagName === "a" && typeof node.properties.name === "string"
              ? [node.properties.name]
              : [],
        ),
      ),
    });
  }
  const requests = new Map<string, string>();
  const resolveLocal = (
    raw: string,
    owner: string,
  ): { file: string; url: URL } | undefined => {
    if (!raw || /^(?:data|mailto|tel|javascript|blob):/i.test(raw)) return;
    let url: URL;
    try {
      url = new URL(raw, new URL(owner, origin));
    } catch {
      error("DOCS_OUTPUT_URL_INVALID", `Invalid URL ${raw}.`, owner);
      return;
    }
    if (
      url.origin !== new URL(origin).origin ||
      (base && url.pathname !== base && !url.pathname.startsWith(`${base}/`))
    )
      return;
    let path: string;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      error("DOCS_OUTPUT_URL_INVALID", `Invalid encoded URL ${raw}.`, owner);
      return;
    }
    const file =
      pagePaths.get(normalizePath(path)) ??
      path.slice(base.length).replace(/^\//, "");
    if (!fileSet.has(file)) {
      error(
        "DOCS_OUTPUT_LINK_MISSING",
        `${raw} points to a missing page or asset.`,
        owner,
      );
      return;
    }
    if (url.hash && documents.has(file)) {
      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        id = url.hash.slice(1);
      }
      if (!documents.get(file)!.ids.has(id))
        error(
          "DOCS_OUTPUT_FRAGMENT_MISSING",
          `${raw} points to a missing heading or anchor.`,
          owner,
        );
    }
    requests.set(url.pathname, file);
    return { file, url };
  };
  for (const [file, { elements }] of documents) {
    const owner = urlForFile(file);
    requests.set(owner, file);
    for (const node of elements) {
      const p = node.properties;
      if (
        ["a", "link", "use"].includes(node.tagName) &&
        typeof p.href === "string" &&
        !(
          node.tagName === "link" &&
          Array.isArray(p.rel) &&
          p.rel.includes("canonical")
        )
      )
        resolveLocal(p.href, owner);
      if (typeof p.src === "string") resolveLocal(p.src, owner);
      if (typeof p.poster === "string") resolveLocal(p.poster, owner);
      if (typeof p.srcSet === "string" && !p.srcSet.startsWith("data:"))
        for (const candidate of p.srcSet.split(","))
          resolveLocal(candidate.trim().split(/\s+/)[0]!, owner);
      if (
        node.tagName === "meta" &&
        ["og:image", "twitter:image"].includes(String(p.property ?? p.name)) &&
        typeof p.content === "string"
      )
        resolveLocal(p.content, owner);
    }
  }
  for (const file of files.filter((file) => file.endsWith(".css"))) {
    const css = await readFile(resolve(directory, file), "utf8");
    for (const match of css.matchAll(/url\(\s*["']?([^"'()\s]+)["']?\s*\)/g))
      resolveLocal(match[1]!, `${base}/${file}`);
  }
  const expected = [...manifest.pages];
  if (options.graph)
    for (const route of options.graph.routes) {
      const url = `${base}${route.route === "/" ? "/" : `${route.route}/`}`;
      if (!resolveLocal(url, `${base}/`)) continue;
      if (!manifest.pages.some((page) => page.route === route.route)) {
        const entry = options.graph.entryByRoute(route.route);
        if (!entry?.frontmatter.draft)
          error(
            "DOCS_PUBLISHING_PAGE_MISSING",
            `Publishing manifest omits ${route.route}.`,
          );
        else
          expected.push({
            route: route.route,
            url,
            index: false,
            sitemap: false,
          });
      }
    }
  for (const page of expected) {
    const resolved = resolveLocal(page.url, `${base}/`);
    if (!resolved) continue;
    const nodes = documents.get(resolved.file)?.elements ?? [];
    const canonicals = nodes.filter(
      (n) =>
        n.tagName === "link" &&
        Array.isArray(n.properties.rel) &&
        n.properties.rel.includes("canonical"),
    );
    if (
      (hasSite && canonicals.length !== 1) ||
      (page.canonical?.startsWith("http") &&
        canonicals[0]?.properties.href !== page.canonical)
    )
      error(
        "DOCS_CANONICAL_INVALID",
        `Expected one canonical${page.canonical ? ` pointing to ${page.canonical}` : ""}.`,
        resolved.file,
      );
    const noindex = nodes.some(
      (n) =>
        n.tagName === "meta" &&
        n.properties.name === "robots" &&
        /\bnoindex\b/i.test(String(n.properties.content)),
    );
    if (page.index === noindex)
      error(
        "DOCS_INDEX_POLICY_MISMATCH",
        `Expected ${page.index ? "indexable" : "noindex"} metadata.`,
        resolved.file,
      );
    if (page.markdown) resolveLocal(page.markdown, page.url);
  }
  const sitemapUrls = new Set<string>();
  for (const file of files.filter((file) =>
    /(?:^|\/)sitemap[^/]*\.xml$/.test(file),
  )) {
    const xml = await readFile(resolve(directory, file), "utf8");
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = match[1]!.replace(/&amp;/g, "&");
      resolveLocal(url, `${base}/${file}`);
      if (!url.endsWith(".xml")) sitemapUrls.add(url);
    }
  }
  if (new URL(origin).hostname !== "cookbook.invalid")
    for (const page of expected) {
      if (page.sitemap && !sitemapUrls.has(page.url))
        error("DOCS_SITEMAP_PAGE_MISSING", `Sitemap omits ${page.url}.`);
      if (!page.sitemap && sitemapUrls.has(page.url))
        error(
          "DOCS_SITEMAP_UNLISTED_PAGE",
          `Sitemap includes unlisted ${page.url}.`,
        );
    }
  resolveLocal(`${base}/llms.txt`, `${base}/`);
  if (fileSet.has("llms.txt")) {
    const llms = await readFile(resolve(directory, "llms.txt"), "utf8");
    for (const match of llms.matchAll(/\]\(([^\s)]+)\)/g))
      resolveLocal(match[1]!, `${base}/llms.txt`);
    for (const page of expected.filter((page) => !page.sitemap)) {
      if (llms.includes(`](${page.url})`))
        error(
          "DOCS_AGENT_UNLISTED_PAGE",
          `llms.txt lists excluded ${page.url}.`,
        );
    }
  }
  if (!base && hasSite) resolveLocal("/robots.txt", "/");
  if (fileSet.has("robots.txt")) {
    const robots = await readFile(resolve(directory, "robots.txt"), "utf8");
    for (const match of robots.matchAll(/^Sitemap:\s*(\S+)/gim))
      resolveLocal(match[1]!, `${base}/robots.txt`);
  }
  let checkedUrls = 0;
  if (options.deployedUrl) {
    const deployed = new URL(
      options.deployedUrl.endsWith("/")
        ? options.deployedUrl
        : `${options.deployedUrl}/`,
    );
    if (!["http:", "https:"].includes(deployed.protocol))
      throw Error("Deployment URL must use HTTP or HTTPS.");
    const pending = [...requests.entries()];
    const worker = async () => {
      for (;;) {
        const next = pending.shift();
        if (!next) return;
        const [path, file] = next;
        const url = new URL(
          path.slice(base.length).replace(/^\//, ""),
          deployed,
        );
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(15000),
          });
          const body = new Uint8Array(await response.arrayBuffer());
          checkedUrls++;
          if (!response.ok && !(file === "404.html" && response.status === 404))
            error(
              "DOCS_DEPLOYMENT_HTTP",
              `${url.href} returned ${response.status}.`,
            );
          else if (file.endsWith(".html")) {
            const live = new TextDecoder().decode(body);
            const local = await readFile(resolve(directory, file), "utf8");
            if (publishingSignature(live) !== publishingSignature(local))
              error(
                "DOCS_DEPLOYMENT_PAGE_MISMATCH",
                `${url.href} serves different title, canonical, or indexing metadata.`,
              );
            if (
              /noindex/i.test(response.headers.get("x-robots-tag") ?? "") &&
              manifest.pages.some(
                (page) =>
                  normalizePath(new URL(page.url, origin).pathname) ===
                    normalizePath(path) && page.index,
              )
            )
              error(
                "DOCS_DEPLOYMENT_NOINDEX",
                `${url.href} has an unexpected X-Robots-Tag noindex header.`,
              );
          } else if (
            !body.length ||
            /text\/html/i.test(response.headers.get("content-type") ?? "")
          )
            error(
              "DOCS_DEPLOYMENT_ASSET_INVALID",
              `${url.href} did not return the expected asset.`,
            );
        } catch (cause) {
          error("DOCS_DEPLOYMENT_FETCH", `${url.href}: ${String(cause)}`);
        }
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  }
  return {
    ok: !diagnostics.some((d) => d.severity === "error"),
    scope: options.deployedUrl ? "deployment" : "built-output",
    pages: documents.size,
    assets: new Set(
      [...requests.values()].filter((file) => !documents.has(file)),
    ).size,
    checkedUrls,
    diagnostics,
  };
}

function publishingSignature(html: string): string {
  const values: string[] = [];
  const walk = (node: Root | Root["children"][number]) => {
    if (node.type === "element") {
      const p = node.properties;
      if (
        node.tagName === "link" &&
        Array.isArray(p.rel) &&
        p.rel.includes("canonical")
      )
        values.push(`canonical:${p.href}`);
      if (node.tagName === "meta" && p.name === "robots")
        values.push(`robots:${p.content}`);
      if (node.tagName === "title")
        values.push(
          `title:${node.children.map((child) => (child.type === "text" ? child.value : "")).join("")}`,
        );
    }
    if ("children" in node) node.children.forEach(walk);
  };
  walk(fromHtml(html));
  return JSON.stringify(values.sort());
}
