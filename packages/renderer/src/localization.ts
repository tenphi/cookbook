import type { DocsConfig, DocsRoute, NavigationItem } from "@tenphi/docs";
import {
  normalizeNavigationPath,
  type ResolvedNavigationLayout,
} from "./navigation.js";

type LocaleOptions = {
  locales?: DocsConfig["locales"] | undefined;
  defaultLocale?: DocsConfig["defaultLocale"] | undefined;
  translations?: DocsConfig["translations"] | undefined;
};

export function routeLocale(path: string, options: LocaleOptions): string {
  const first = normalizeNavigationPath(path).split("/")[1];
  return first && first !== "root" && options.locales?.[first] ? first : "root";
}

/** Author components can render before the page initializes route locals. */
export function requestLanguage(
  pathname: string,
  base: string,
  options: LocaleOptions,
): string {
  const prefix = base.replace(/\/$/, "");
  const path =
    prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))
      ? pathname.slice(prefix.length)
      : pathname;
  const locale = routeLocale(path, options);
  return options.locales?.[locale]?.lang ?? (locale === "root" ? "en" : locale);
}

export function localePath(path: string, options: LocaleOptions): string {
  const route = normalizeNavigationPath(path);
  const locale = routeLocale(route, options);
  return locale === "root"
    ? route
    : normalizeNavigationPath(route.slice(locale.length + 1));
}

export function localizedRoute(
  path: string,
  locale: string,
  options: LocaleOptions,
): string {
  const suffix = localePath(path, options);
  return normalizeNavigationPath(
    `${locale === "root" ? "" : `/${locale}`}${suffix}`,
  );
}

/** Missing translations use a real default-language page, then a real locale home. */
export function localeTarget(
  path: string,
  locale: string,
  routes: DocsRoute[],
  options: LocaleOptions,
): string | undefined {
  const visible = new Set(
    routes
      .filter((route) => route.discoverable !== false)
      .map((route) => route.route),
  );
  const fallback =
    options.defaultLocale ??
    (options.locales?.root
      ? "root"
      : (Object.keys(options.locales ?? {})[0] ?? "root"));
  return [
    localizedRoute(path, locale, options),
    localizedRoute(path, fallback, options),
    localizedRoute("/", locale, options),
    localizedRoute("/", fallback, options),
  ].find((route) => visible.has(route));
}

export function localeHref(
  link: string,
  currentPath: string,
  routes: DocsRoute[],
  options: LocaleOptions,
  base = "/",
): string {
  if (!link.startsWith("/") || link.startsWith("//")) return link;
  const suffix = /[?#].*$/.exec(link)?.[0] ?? "";
  const path = suffix ? link.slice(0, -suffix.length) : link;
  const target = options.locales
    ? localeTarget(path, routeLocale(currentPath, options), routes, options)
    : normalizeNavigationPath(path);
  return (
    `${base.replace(/\/$/, "")}${target ?? normalizeNavigationPath(path)}${suffix}` ||
    "/"
  );
}

/** Resolve navigation against the current locale's available routes. */
export function localizedNavigation(
  layout: ResolvedNavigationLayout,
  routes: DocsRoute[],
  currentPath: string,
  options: LocaleOptions,
): { layout: ResolvedNavigationLayout; routes: DocsRoute[] } {
  if (!options.locales) return { layout, routes };
  const locale = routeLocale(currentPath, options);
  const language =
    options.locales[locale]?.lang ?? (locale === "root" ? "en" : locale);
  const label = (value: string) =>
    options.translations?.[language]?.[`navigation.${value}`] ??
    options.translations?.[language.split("-")[0]!]?.[`navigation.${value}`] ??
    value;
  const localRoutes = routes
    .filter((route) => routeLocale(route.route, options) === locale)
    .map((route) => ({ ...route, route: localePath(route.route, options) }));
  const available = new Set(
    localRoutes
      .filter((route) => route.discoverable !== false)
      .map((route) => route.route),
  );
  const visibleRoutes = new Map(
    routes
      .filter((route) => route.discoverable !== false)
      .map((route) => [route.route, route]),
  );
  const fallbackLocale =
    options.defaultLocale ??
    (options.locales.root ? "root" : Object.keys(options.locales)[0]!);
  const convert = (items: NavigationItem[]): NavigationItem[] =>
    items.flatMap((item): NavigationItem[] => {
      const link = typeof item === "string" ? item : item.link;
      const internal = link?.startsWith("/") && !link.startsWith("//");
      const translated = internal ? localePath(link!, options) : link;
      const fallback = internal
        ? localizedRoute(link!, fallbackLocale, options)
        : undefined;
      const target =
        !internal || available.has(translated!)
          ? translated
          : fallback && visibleRoutes.has(fallback)
            ? fallback
            : undefined;
      if (typeof item === "string") {
        if (!target) return [];
        if (!internal || available.has(translated!)) return [target];
        const route = visibleRoutes.get(target)!;
        return [
          {
            label:
              typeof route.sidebar === "object" && route.sidebar.label
                ? route.sidebar.label
                : route.title,
            link: target,
          },
        ];
      }
      if ("items" in item || "autogenerate" in item) {
        const { link: _link, ...group } = item;
        const children = "items" in item ? convert(item.items) : undefined;
        if (children?.length === 0 && !target) return [];
        return [
          {
            ...group,
            label: label(group.label),
            ...(target ? { link: target } : {}),
            ...("items" in item
              ? { items: children! }
              : {
                  autogenerate: {
                    directory: localePath(item.autogenerate.directory, options),
                  },
                }),
          },
        ];
      }
      return target
        ? [{ ...item, label: label(item.label), link: target }]
        : [];
    });
  return {
    layout: {
      ...layout,
      ...(layout.items ? { items: convert(layout.items) } : {}),
      tabs: layout.tabs.map((tab) => ({
        ...tab,
        label: label(tab.label),
        link:
          tab.link.startsWith("/") && !tab.link.startsWith("//")
            ? localePath(tab.link, options)
            : tab.link,
        ...(tab.items ? { items: convert(tab.items) } : {}),
      })),
    },
    routes: localRoutes,
  };
}

export { ENGLISH_MESSAGES, messages, type MessageKey } from "./messages.js";

export function localeAlternates(
  path: string,
  routes: DocsRoute[],
  options: LocaleOptions,
): Array<{ lang: string; route: string }> {
  const available = new Set(
    routes
      .filter((route) => route.discoverable !== false)
      .map((route) => route.route),
  );
  if (!options.locales || !available.has(path)) return [];
  const alternates = Object.entries(options.locales).flatMap(
    ([locale, config]) => {
      const route = localizedRoute(path, locale, options);
      return available.has(route)
        ? [{ lang: config.lang ?? locale, route }]
        : [];
    },
  );
  const fallback = localizedRoute(
    path,
    options.defaultLocale ??
      (options.locales.root ? "root" : Object.keys(options.locales)[0]!),
    options,
  );
  if (available.has(fallback))
    alternates.push({ lang: "x-default", route: fallback });
  return alternates;
}
