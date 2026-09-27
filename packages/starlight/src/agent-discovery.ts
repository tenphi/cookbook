import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderAgentMarkdown, type DocsGraph } from "@tenphi/docs";
import { agentPagePath } from "./page-metadata.js";
import { outputPathForPublicAsset } from "./output-path.js";

function sitePath(base: string, route: string): string {
  const prefix = base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;
  return `${prefix}${route === "/" ? "/" : `${route}/`}`;
}

function pageUrl(site: string | undefined, path: string): string {
  return site ? new URL(path, site).href : path;
}

function singleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function markdownLabel(value: string): string {
  return singleLine(value).replace(/[\\[\]]/g, "\\$&");
}

export function renderLlmsTxt(graph: DocsGraph): string {
  const { site, build } = graph.config;
  const lines = [`# ${singleLine(site.title ?? "Documentation")}`, ""];
  if (site.description) lines.push(`> ${singleLine(site.description)}`, "");
  lines.push("## Documentation", "");
  const discoverable = new Set(
    graph.routes
      .filter(
        (route) => route.discoverable !== false && route.sitemap !== false,
      )
      .map((route) => route.route),
  );
  for (const entry of graph.entries) {
    if (!discoverable.has(entry.route)) continue;
    const url = pageUrl(site.url, sitePath(build.base, entry.route));
    lines.push(
      `- [${markdownLabel(entry.title)}](${url})${entry.description ? `: ${singleLine(entry.description)}` : ""}${site.seo?.copyPage === false ? "" : ` ([Markdown](${pageUrl(site.url, agentPagePath(entry.route, build.base))}))`}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function renderRobotsTxt(site: string, sitemap = true): string {
  return `User-agent: *\nAllow: /\n${sitemap ? `Sitemap: ${new URL("/sitemap-index.xml", site).href}\n` : ""}`;
}

async function writeUnlessPresent(path: string, body: string): Promise<void> {
  try {
    await writeFile(path, body, { flag: "wx" });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "EEXIST"
    ) {
      return;
    }
    throw error;
  }
}

export async function writeAgentDiscovery(
  output: string,
  graph: DocsGraph,
): Promise<void> {
  await writeUnlessPresent(join(output, "llms.txt"), renderLlmsTxt(graph));
  await mkdir(join(output, "_cookbook/pages"), { recursive: true });
  const pages = [];
  for (const entry of graph.entries) {
    if (entry.frontmatter.draft) continue;
    const route = graph.routes.find((route) => route.route === entry.route)!;
    const markdown =
      !entry.frontmatter.draft && graph.config.site.seo?.copyPage !== false
        ? agentPagePath(entry.route, graph.config.build.base)
        : undefined;
    if (markdown)
      await writeFile(
        join(
          output,
          outputPathForPublicAsset(markdown, graph.config.build.base),
        ),
        renderAgentMarkdown(entry, graph.config),
      );
    pages.push({
      route: entry.route,
      url: pageUrl(
        graph.config.site.url,
        sitePath(graph.config.build.base, entry.route),
      ),
      canonical: route.canonical,
      index: route.indexable !== false,
      discoverable: route.discoverable !== false,
      sitemap: route.sitemap !== false,
      ...(markdown ? { markdown } : {}),
    });
  }
  await writeFile(
    join(output, "_cookbook/publishing.json"),
    JSON.stringify({ base: graph.config.build.base, pages }, null, 2) + "\n",
  );
  if (graph.config.build.base === "/" && graph.config.site.url) {
    await writeUnlessPresent(
      join(output, "robots.txt"),
      renderRobotsTxt(
        graph.config.site.url,
        graph.routes.some((route) => route.sitemap !== false),
      ),
    );
  }
}
