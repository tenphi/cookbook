import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  renderAgentMarkdown,
  routeUrl,
  type DocsGraph,
  type NavigationItem,
} from "@tenphi/docs";
import {
  defaultLocaleKey,
  localePath,
  localizedNavigation,
  localizedRoute,
} from "./localization.js";
import {
  activeNavigationTab,
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
 * Group pages as the default language's sidebar does: one section per sidebar
 * group (the top-level items, then each tab with items), pages in sidebar
 * order. A page goes in the section of the tab that pages select for it, as
 * readers see it. Pages that the sidebar does not list, such as translations,
 * follow in their own section.
 */
function llmsSections(
  graph: DocsGraph,
  entries: DocsEntry[],
): Array<[string, DocsEntry[]]> {
  const { locales, defaultLocale, translations } = graph.config;
  const options = { locales, defaultLocale, translations };
  const locale = defaultLocaleKey(options);
  // Pages narrow the sidebar to their language first; do the same here.
  const { layout, routes } = localizedNavigation(
    resolveNavigationLayout(graph.config.navigation),
    graph.routes,
    localizedRoute("/", locale, options),
    options,
  );
  const byRoute = new Map(entries.map((entry) => [entry.route, entry]));
  const entryFor = (link: string) =>
    /^(?:[a-z][a-z\d+.-]*:|\/\/|[?#])/i.test(link)
      ? undefined
      : byRoute.get(localizedRoute(link, locale, options));
  const pages = (items: PageSidebarItem[]): DocsEntry[] =>
    items.flatMap((item) => {
      if (!("link" in item)) return pages(item.items);
      const entry = entryFor(item.link);
      return entry ? [entry] : [];
    });
  // The sidebar that pages build from these items.
  const sidebar = (items?: NavigationItem[]) =>
    pages(
      pageSidebar(
        { ...(items ? { items } : {}), tabs: [], sectioned: false },
        routes,
      ),
    );
  const sections: Array<{ label: string; tab: number; pages: DocsEntry[] }> =
    [];
  if (!layout.sectioned || layout.fallbackSidebarGroup !== undefined)
    sections.push({
      label: "Documentation",
      tab: -1,
      pages: sidebar(layout.items),
    });
  if (layout.sectioned)
    for (const [index, tab] of layout.tabs.entries()) {
      if (tab.items === undefined) continue;
      const listed = tab.items.length ? sidebar(tab.items) : [];
      // A tab's own page leads its section, even when its items leave it out.
      const home = entryFor(tab.link);
      sections.push({
        label: tab.label,
        tab: index,
        pages: home && !listed.includes(home) ? [home, ...listed] : listed,
      });
    }
  // Pages show the sidebar of the tab they select, or the top-level items
  // when that tab has none (Sidebar.astro). A page that its own section does
  // not list stays where the sidebar lists it first.
  const sectionOf = (entry: DocsEntry): number => {
    const tab = layout.sectioned
      ? activeNavigationTab(layout.tabs, localePath(entry.route, options))
      : -1;
    const own = sections.findIndex(
      (section) => section.tab === (layout.tabs[tab]?.items ? tab : -1),
    );
    return own >= 0 && sections[own]!.pages.includes(entry)
      ? own
      : sections.findIndex((section) => section.pages.includes(entry));
  };
  const listed = new Set<DocsEntry>();
  const result = sections.map((section, index): [string, DocsEntry[]] => [
    section.label,
    section.pages.filter((entry) => {
      if (listed.has(entry) || sectionOf(entry) !== index) return false;
      listed.add(entry);
      return true;
    }),
  ]);
  const rest = entries.filter((entry) => !listed.has(entry));
  if (rest.length > 0) result.push(["Other pages", rest]);
  return result.filter(([, section]) => section.length > 0);
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
