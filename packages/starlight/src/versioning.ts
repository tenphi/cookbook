import {
  routeVersion,
  type DocsConfig,
  type DocsRoute,
  type SiteVersion,
} from "@tenphi/docs";
import { normalizeNavigationPath } from "./navigation.js";

export function versionLinks(
  versions: SiteVersion[],
  routes: DocsRoute[],
  currentPath: string,
  base = "/",
  options: Pick<DocsConfig, "locales" | "defaultLocale"> = {},
): { current?: SiteVersion; links: Array<SiteVersion & { href: string }> } {
  const path = normalizeNavigationPath(currentPath);
  const first = path.split("/")[1];
  const locale =
    first && first !== "root" && options.locales?.[first] ? first : "root";
  const localePrefix = locale === "root" ? "" : `/${locale}`;
  const versionPath = path.slice(localePrefix.length) || "/";
  const current = routeVersion(path, { site: { versions }, ...options });
  const suffix = current
    ? versionPath.slice(
        current.routeBase === "/" ? 0 : current.routeBase.length,
      )
    : "";
  const available = new Set(
    routes
      .filter((route) => route.discoverable !== false)
      .map((route) => route.route),
  );
  const prefix = base.replace(/\/$/, "");
  const defaultLocale =
    options.defaultLocale ??
    (options.locales?.root
      ? "root"
      : (Object.keys(options.locales ?? {})[0] ?? "root"));
  const locales = [
    locale,
    defaultLocale,
    "root",
    ...Object.keys(options.locales ?? {}),
  ];
  return {
    ...(current ? { current } : {}),
    links: versions.flatMap((version) => {
      const root = version.routeBase === "/" ? "" : version.routeBase;
      const candidates = [
        ...locales
          .slice(0, 2)
          .map((lang) =>
            normalizeNavigationPath(
              `${lang === "root" ? "" : `/${lang}`}${root}${suffix}`,
            ),
          ),
        ...locales.map((lang) =>
          normalizeNavigationPath(
            `${lang === "root" ? "" : `/${lang}`}${root}`,
          ),
        ),
      ];
      const route = candidates.find((route) => available.has(route));
      return route ? [{ ...version, href: `${prefix}${route}` || "/" }] : [];
    }),
  };
}
