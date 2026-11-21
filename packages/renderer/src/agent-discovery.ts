import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderAgentMarkdown, routeUrl, type DocsGraph } from "@tenphi/docs";
import { localizedNavigation, localizedRoute } from "./localization.js";
import {
  pageSidebar,
  resolveNavigationLayout,
  type PageSidebarItem,
} from "./navigation.js";
import { agentPagePath } from "./page-metadata.js";
import { outputPathForPublicAsset } from "./output-path.js";

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
  const discoverable = new Set(
    graph.routes
      .filter(
        (route) => route.discoverable !== false && route.sitemap !== false,
      )
      .map((route) => route.route),
  );
  const entries = graph.entries.filter((entry) =>
    discoverable.has(entry.route),
  );
  for (const [heading, section] of llmsSections(graph, entries)) {
    lines.push(`## ${singleLine(heading)}`, "");
    for (const entry of section) {
      const url = routeUrl(
        entry.route,
        build.base,
        site.url,
        build.trailingSlash,
      );
      lines.push(
        `- [${markdownLabel(entry.title)}](${url})${entry.description ? `: ${singleLine(entry.description)}` : ""}${site.seo?.copyPage === false ? "" : ` ([Markdown](${pageUrl(site.url, agentPagePath(entry.route, build.base))}))`}`,
      );
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

type DocsEntry = DocsGraph["entries"][number];

/**
 * Group pages as the default language's sidebar does: one section per
 * navigation tab (or one for an unsectioned sidebar), pages in sidebar order.
 * Pages that the sidebar does not list, such as translations, follow in their
 * own section.
 */
function llmsSections(
  graph: DocsGraph,
  entries: DocsEntry[],
): Array<[string, DocsEntry[]]> {
  const { locales, defaultLocale, translations } = graph.config;
  const options = { locales, defaultLocale, translations };
  const locale = locales
    ? (defaultLocale ?? (locales.root ? "root" : Object.keys(locales)[0]!))
    : "root";
  // Pages narrow the sidebar to their language first; do the same here.
  const localized = localizedNavigation(
    resolveNavigationLayout(graph.config.navigation),
    graph.routes,
    localizedRoute("/", locale, options),
    options,
  );
  const layout = localized.layout;
  const sidebar = pageSidebar(layout, localized.routes);
  const byRoute = new Map(entries.map((entry) => [entry.route, entry]));
  const listed = new Set<string>();
  const pages = (items: PageSidebarItem[]): DocsEntry[] =>
    items.flatMap((item) => {
      if (!("link" in item)) return pages(item.items);
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|[?#])/i.test(item.link)) return [];
      const entry = byRoute.get(localizedRoute(item.link, locale, options));
      if (!entry || listed.has(entry.route)) return [];
      listed.add(entry.route);
      return [entry];
    });
  const sections: Array<[string, DocsEntry[]]> = layout.sectioned
    ? sidebar.map((item) => [
        item.label,
        "link" in item ? pages([item]) : pages(item.items),
      ])
    : [["Documentation", pages(sidebar)]];
  const rest = entries.filter((entry) => !listed.has(entry.route));
  if (rest.length > 0) sections.push(["Other pages", rest]);
  return sections.filter(([, section]) => section.length > 0);
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
      url: routeUrl(
        entry.route,
        graph.config.build.base,
        graph.config.site.url,
        graph.config.build.trailingSlash,
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
    JSON.stringify(
      { base: graph.config.build.base, site: graph.config.site.url, pages },
      null,
      2,
    ) + "\n",
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
