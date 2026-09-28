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
  const convert = (items: NavigationItem[]): NavigationItem[] =>
    items.flatMap((item): NavigationItem[] => {
      const link = typeof item === "string" ? item : item.link;
      const internal = link?.startsWith("/") && !link.startsWith("//");
      const translated = internal ? localePath(link!, options) : link;
      if (typeof item === "string")
        return !internal || available.has(translated!) ? [translated!] : [];
      if ("items" in item || "autogenerate" in item) {
        const { link: _link, ...group } = item;
        return [
          {
            ...group,
            label: label(group.label),
            ...(translated && (!internal || available.has(translated))
              ? { link: translated }
              : {}),
            ...("items" in item
              ? { items: convert(item.items) }
              : {
                  autogenerate: {
                    directory: localePath(item.autogenerate.directory, options),
                  },
                }),
          },
        ];
      }
      return !internal || available.has(translated!)
        ? [{ ...item, label: label(item.label), link: translated! }]
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

export const ENGLISH_MESSAGES = {
  copyPage: "Copy page",
  viewMarkdown: "Download Markdown",
  pageCopied: "Page copied",
  pageCopyError: "Could not copy. Download Markdown to read or copy the text.",
  draftTitle: "Draft",
  draftNotice:
    "This page is available by direct link and excluded from navigation and indexes.",
  searchError: "Search could not load. Close and try again.",
  appearance: "Appearance",
  colorScheme: "Color scheme",
  contrast: "Contrast",
  normalContrast: "Normal",
  highContrast: "High",
  auto: "Auto",
  closeNavigation: "Close navigation",
  primary: "Primary",
  sections: "Sections",
  chooseSection: "Choose section",
  headerLinks: "Header links",
  more: "More",
  closeMore: "Close more menu",
  moreLinks: "More links",
  versions: "Versions",
  documentationVersion: "Documentation version",
  documentationVersions: "Documentation versions",
  version: "Version",
  home: "Home",
  generatedWith: "Generated with",
  viewSource: "View source",
  copyCode: "Copy code",
  codeCopied: "Code copied",
  codeCopyError: "Could not copy code",
  copyHeading: "Copy link to “{heading}”",
  linkCopied: "Link copied",
  linkCopyError: "Could not copy link",
  notFound: "Page not found",
  notFoundDescription: "The page you requested could not be found.",
  fallback: "fallback",
} as const;
export type MessageKey = keyof typeof ENGLISH_MESSAGES;
const FRENCH_MESSAGES: Record<MessageKey, string> = {
  copyPage: "Copier la page",
  viewMarkdown: "Télécharger le Markdown",
  pageCopied: "Page copiée",
  pageCopyError:
    "Copie impossible. Téléchargez le Markdown pour lire ou copier le texte.",
  draftTitle: "Brouillon",
  draftNotice:
    "Cette page est accessible par son lien direct et exclue de la navigation et des index.",
  searchError: "La recherche n’a pas pu se charger. Fermez et réessayez.",
  appearance: "Apparence",
  colorScheme: "Thème de couleur",
  contrast: "Contraste",
  normalContrast: "Normal",
  highContrast: "Élevé",
  auto: "Auto",
  closeNavigation: "Fermer la navigation",
  primary: "Navigation principale",
  sections: "Sections",
  chooseSection: "Choisir une section",
  headerLinks: "Liens d’en-tête",
  more: "Plus",
  closeMore: "Fermer le menu",
  moreLinks: "Autres liens",
  versions: "Versions",
  documentationVersion: "Version de la documentation",
  documentationVersions: "Versions de la documentation",
  version: "Version",
  home: "Accueil",
  generatedWith: "Créé avec",
  viewSource: "Voir le code source",
  copyCode: "Copier le code",
  codeCopied: "Code copié",
  codeCopyError: "Impossible de copier le code",
  copyHeading: "Copier le lien vers « {heading} »",
  linkCopied: "Lien copié",
  linkCopyError: "Impossible de copier le lien",
  notFound: "Page introuvable",
  notFoundDescription: "La page demandée est introuvable.",
  fallback: "langue de secours",
};
export function messages(
  lang: string,
  options: LocaleOptions = {},
): Record<MessageKey, string> {
  const language = lang.split("-")[0] ?? "en";
  return {
    ...ENGLISH_MESSAGES,
    ...(language === "fr" ? FRENCH_MESSAGES : {}),
    ...options.translations?.[language],
    ...options.translations?.[lang],
  };
}

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
