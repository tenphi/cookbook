import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DocsGraph } from "@tenphi/docs";

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
  for (const entry of graph.entries) {
    if (entry.frontmatter.draft) continue;
    const url = pageUrl(site.url, sitePath(build.base, entry.route));
    lines.push(
      `- [${markdownLabel(entry.title)}](${url})${entry.description ? `: ${singleLine(entry.description)}` : ""}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function renderRobotsTxt(site: string): string {
  return `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap-index.xml", site).href}\n`;
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
  if (graph.config.build.base === "/" && graph.config.site.url) {
    await writeUnlessPresent(
      join(output, "robots.txt"),
      renderRobotsTxt(graph.config.site.url),
    );
  }
}
