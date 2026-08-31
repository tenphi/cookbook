import type {
  DocsConfig,
  DocsRoute,
  NavigationItem,
  NavigationTab,
} from "@tenphi/docs";

export interface ResolvedNavigationTab extends NavigationTab {
  /** Index of the tab's resolved Starlight sidebar group. */
  sidebarGroup?: number;
}

export interface ResolvedNavigationLayout {
  fallbackSidebarGroup?: number;
  items?: NavigationItem[];
  tabs: ResolvedNavigationTab[];
  sectioned: boolean;
}

export type StarlightPageSidebarItem =
  | { label: string; link: string }
  | { label: string; items: StarlightPageSidebarItem[] };

export function resolveNavigationLayout(
  navigation: DocsConfig["navigation"],
): ResolvedNavigationLayout {
  const items = Array.isArray(navigation) ? navigation : navigation?.items;
  const configuredTabs = Array.isArray(navigation)
    ? []
    : (navigation?.tabs ?? []);
  const fallbackSidebarGroup = items !== undefined ? 0 : undefined;
  let sidebarGroup = fallbackSidebarGroup === undefined ? 0 : 1;
  const tabs = configuredTabs.map((tab) => ({
    ...tab,
    ...(tab.items !== undefined ? { sidebarGroup: sidebarGroup++ } : {}),
  }));

  return {
    ...(fallbackSidebarGroup !== undefined ? { fallbackSidebarGroup } : {}),
    ...(items !== undefined ? { items } : {}),
    tabs,
    sectioned: tabs.some((tab) => tab.sidebarGroup !== undefined),
  };
}

export function navigationItemsForPath(
  layout: ResolvedNavigationLayout,
  pathname: string,
): NavigationItem[] | undefined {
  const active = activeNavigationTab(layout.tabs, pathname);
  return active >= 0 && layout.tabs[active]?.items !== undefined
    ? layout.tabs[active].items
    : layout.items;
}

/** Build a manual Starlight sidebar for graph-backed custom pages. */
export function starlightPageSidebar(
  layout: ResolvedNavigationLayout,
  routes: DocsRoute[],
): StarlightPageSidebarItem[] {
  const titles = new Map(routes.map((route) => [route.route, route.title]));
  const labelFor = (route: string) =>
    titles.get(normalizeNavigationPath(route)) ??
    normalizeNavigationPath(route).split("/").filter(Boolean).at(-1) ??
    "Home";
  const generatedItems = (directory: string) => {
    const root = normalizeNavigationPath(directory);
    return routes
      .filter(
        (route) =>
          root === "/" ||
          route.route === root ||
          route.route.startsWith(`${root}/`),
      )
      .map((route) => ({ label: route.title, link: route.route }));
  };
  const convert = (item: NavigationItem): StarlightPageSidebarItem => {
    if (typeof item === "string") {
      return { label: labelFor(item), link: item };
    }
    if ("items" in item) {
      return { label: item.label, items: item.items.map(convert) };
    }
    if ("autogenerate" in item) {
      return {
        label: item.label,
        items: generatedItems(item.autogenerate.directory),
      };
    }
    return item;
  };
  const fallback = layout.items?.length
    ? layout.items.map(convert)
    : routes.map((route) => ({ label: route.title, link: route.route }));
  if (!layout.sectioned) return fallback;

  return [
    ...(layout.fallbackSidebarGroup !== undefined
      ? [{ label: "Documentation", items: fallback }]
      : []),
    ...layout.tabs.flatMap((tab) =>
      tab.items !== undefined
        ? [{ label: tab.label, items: tab.items.map(convert) }]
        : [],
    ),
  ];
}

/** Pick one tab, preferring its own URL before routes owned by its sidebar. */
export function activeNavigationTab(
  tabs: NavigationTab[],
  pathname: string,
): number {
  const current = normalizeNavigationPath(pathname);
  let winner = -1;
  let winningScore = -1;

  for (const [index, tab] of tabs.entries()) {
    const score = Math.max(
      linkMatchScore(tab.link, current, 30_000),
      navigationMatchScore(tab.items ?? [], current),
    );
    if (score > winningScore) {
      winner = index;
      winningScore = score;
    }
  }

  return winningScore >= 0 ? winner : -1;
}

export function navigationPath(pathname: string, base = "/"): string {
  const normalizedBase = normalizeNavigationPath(base);
  const withoutBase =
    normalizedBase !== "/" &&
    (pathname === normalizedBase || pathname.startsWith(`${normalizedBase}/`))
      ? pathname.slice(normalizedBase.length) || "/"
      : pathname;
  return normalizeNavigationPath(withoutBase);
}

export function normalizeNavigationPath(path: string): string {
  const clean = path.split(/[?#]/, 1)[0]?.replace(/\\/g, "/") ?? "/";
  const normalized = `/${clean.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? normalized : normalized.replace(/\/$/, "");
}

function navigationMatchScore(
  items: NavigationItem[],
  current: string,
): number {
  let score = -1;
  for (const item of items) {
    if (typeof item === "string") {
      if (normalizeNavigationPath(item) === current)
        score = Math.max(score, 20_000);
      continue;
    }
    if ("items" in item) {
      score = Math.max(score, navigationMatchScore(item.items, current));
      continue;
    }
    if ("autogenerate" in item) {
      score = Math.max(
        score,
        directoryMatchScore(item.autogenerate.directory, current),
      );
      continue;
    }
    score = Math.max(score, linkMatchScore(item.link, current, 20_000));
  }
  return score;
}

function linkMatchScore(link: string, current: string, base: number): number {
  if (!link.startsWith("/")) return -1;
  const target = normalizeNavigationPath(link);
  if (target === current) return base + 1_000 + target.length;
  if (target !== "/" && current.startsWith(`${target}/`)) {
    return base + target.length;
  }
  return -1;
}

function directoryMatchScore(directory: string, current: string): number {
  const target = normalizeNavigationPath(directory);
  if (target === "/") return 10_000;
  return current === target || current.startsWith(`${target}/`)
    ? 10_000 + target.length
    : -1;
}
