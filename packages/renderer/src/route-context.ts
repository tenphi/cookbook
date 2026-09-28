import type {
  DocsConfig,
  DocsHeading,
  DocsRoute,
  HeadConfig,
} from "@tenphi/docs";
import {
  localeHref,
  localizedNavigation,
  requestLanguage,
  routeLocale,
} from "./localization.js";
import {
  navigationPath,
  normalizeNavigationPath,
  pageSidebar,
  type ResolvedNavigationLayout,
  type PageSidebarItem,
} from "./navigation.js";

export type SidebarEntry =
  | {
      type: "link";
      label: string;
      href: string;
      isCurrent: boolean;
      attrs: Record<string, string>;
      badge?: { text: string; variant?: string; class?: string };
    }
  | {
      type: "group";
      label: string;
      entries: SidebarEntry[];
      badge?: { text: string; variant?: string; class?: string };
    };

export interface TocItem {
  slug: string;
  text: string;
  children: TocItem[];
}

export interface CookbookRoute {
  id: string;
  lang: string;
  dir: "ltr" | "rtl";
  hasSidebar: boolean;
  siteTitle: string;
  siteTitleHref: string;
  entry: { data: Record<string, any> };
  entryMeta: { lang: string; dir: "ltr" | "rtl"; locale: string };
  sidebar: SidebarEntry[];
  pagination: {
    prev?: { href: string; label: string };
    next?: { href: string; label: string };
  };
  toc?: { items: TocItem[] };
  head: HeadConfig[];
  editUrl?: string;
  lastUpdated?: Date;
}

type Content = {
  routes: DocsRoute[];
  base: string;
  site: { title?: string; description?: string };
  locales?: DocsConfig["locales"];
  defaultLocale?: string;
  translations?: DocsConfig["translations"];
  tableOfContents?: DocsConfig["tableOfContents"];
  head?: HeadConfig[];
};

export function createRouteContext(input: {
  pathname: string;
  frontmatter: Record<string, any>;
  headings: DocsHeading[];
  layout: ResolvedNavigationLayout;
  content: Content;
}): CookbookRoute {
  const { pathname, frontmatter, headings, layout, content } = input;
  const currentPath = navigationPath(pathname, content.base);
  const locale = routeLocale(currentPath, content);
  const lang = requestLanguage(pathname, content.base, content);
  const dir = content.locales?.[locale]?.dir ?? "ltr";
  const localized = localizedNavigation(
    layout,
    content.routes,
    currentPath,
    content,
  );
  const sidebar = resolveSidebar(
    pageSidebar(localized.layout, localized.routes),
    currentPath,
    content,
  );
  const links = flattenLinks(sidebar);
  const currentIndex = links.findIndex((link) => link.isCurrent);
  const previous = resolvePaginationLink(
    frontmatter.prev,
    currentIndex >= 0 ? links[currentIndex - 1] : undefined,
    content,
    currentPath,
  );
  const next = resolvePaginationLink(
    frontmatter.next,
    currentIndex >= 0 ? links[currentIndex + 1] : undefined,
    content,
    currentPath,
  );
  const pagination = {
    ...(previous ? { prev: previous } : {}),
    ...(next ? { next } : {}),
  };
  const toc = resolveToc(headings, frontmatter, content);
  const head: HeadConfig[] = [
    ...(content.head ?? []),
    ...(frontmatter.head ?? []),
    ...(frontmatter.description || content.site.description
      ? [
          {
            tag: "meta",
            attrs: {
              name: "description",
              content: frontmatter.description ?? content.site.description,
            },
          },
        ]
      : []),
  ];
  return {
    id: currentPath,
    lang,
    dir,
    hasSidebar: frontmatter.template !== "splash",
    siteTitle: content.site.title ?? "Documentation",
    siteTitleHref: content.base,
    entry: { data: frontmatter },
    entryMeta: { lang, dir, locale },
    sidebar,
    pagination,
    ...(toc ? { toc } : {}),
    head,
    ...(typeof frontmatter.editUrl === "string"
      ? { editUrl: frontmatter.editUrl }
      : {}),
    ...(frontmatter.lastUpdated instanceof Date
      ? { lastUpdated: frontmatter.lastUpdated }
      : {}),
  };
}

function resolveSidebar(
  items: PageSidebarItem[],
  currentPath: string,
  content: Content,
): SidebarEntry[] {
  return items.map((item): SidebarEntry => {
    if ("link" in item) {
      const href = localeHref(
        item.link,
        currentPath,
        content.routes,
        content,
        content.base,
      );
      return {
        type: "link",
        label: item.label,
        href,
        isCurrent:
          href.startsWith("/") &&
          !href.startsWith("//") &&
          navigationPath(
            new URL(href, "https://cookbook.invalid").pathname,
            content.base,
          ) === currentPath,
        attrs: item.attrs ?? {},
      };
    }
    return {
      type: "group",
      label: item.label,
      entries: resolveSidebar(item.items, currentPath, content),
    };
  });
}

function flattenLinks(
  items: SidebarEntry[],
): Extract<SidebarEntry, { type: "link" }>[] {
  return items.flatMap((item) =>
    item.type === "link" ? [item] : flattenLinks(item.entries),
  );
}

function resolvePaginationLink(
  configured: unknown,
  automatic: Extract<SidebarEntry, { type: "link" }> | undefined,
  content: Content,
  currentPath: string,
): { href: string; label: string } | undefined {
  if (configured === false) return undefined;
  if (configured === undefined)
    return automatic && { href: automatic.href, label: automatic.label };
  const link =
    typeof configured === "string"
      ? configured
      : configured &&
          typeof configured === "object" &&
          "link" in configured &&
          typeof configured.link === "string"
        ? configured.link
        : automatic?.href;
  if (!link) return undefined;
  const label =
    configured &&
    typeof configured === "object" &&
    "label" in configured &&
    typeof configured.label === "string"
      ? configured.label
      : (content.routes.find(
          (route) =>
            normalizeNavigationPath(route.route) ===
            normalizeNavigationPath(link),
        )?.title ??
        automatic?.label ??
        link);
  return {
    href: localeHref(link, currentPath, content.routes, content, content.base),
    label,
  };
}

function resolveToc(
  headings: DocsHeading[],
  frontmatter: Record<string, any>,
  content: Content,
): { items: TocItem[] } | undefined {
  const option =
    frontmatter.tableOfContents ??
    (frontmatter.template === "splash" ? false : content.tableOfContents);
  if (option === false) return undefined;
  const min = typeof option === "object" ? (option.minHeadingLevel ?? 2) : 2;
  const max = typeof option === "object" ? (option.maxHeadingLevel ?? 3) : 3;
  const roots: TocItem[] = [];
  const stack: Array<{ depth: number; item: TocItem }> = [];
  for (const heading of headings) {
    if (heading.depth < min || heading.depth > max) continue;
    const item: TocItem = {
      slug: heading.slug,
      text: heading.text,
      children: [],
    };
    while (stack.length && stack[stack.length - 1]!.depth >= heading.depth)
      stack.pop();
    if (stack.length) stack[stack.length - 1]!.item.children.push(item);
    else roots.push(item);
    stack.push({ depth: heading.depth, item });
  }
  return roots.length ? { items: roots } : undefined;
}
