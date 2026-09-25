import type { DocsRoute, SiteVersion } from "@tenphi/docs";
import { normalizeNavigationPath } from "./navigation.js";

export function versionLinks(
  versions: SiteVersion[],
  routes: DocsRoute[],
  currentPath: string,
  base = "/",
): { current?: SiteVersion; links: Array<SiteVersion & { href: string }> } {
  const path = normalizeNavigationPath(currentPath);
  const ordered = [...versions].sort(
    (left, right) => right.routeBase.length - left.routeBase.length,
  );
  const current = ordered.find(
    ({ routeBase }) =>
      routeBase === "/" ||
      path === routeBase ||
      path.startsWith(`${routeBase}/`),
  );
  const suffix = current
    ? path.slice(current.routeBase === "/" ? 0 : current.routeBase.length)
    : "";
  const available = new Set(routes.map((route) => route.route));
  const prefix = base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;
  return {
    ...(current ? { current } : {}),
    links: versions.map((version) => {
      const matching = normalizeNavigationPath(
        `${version.routeBase === "/" ? "" : version.routeBase}${suffix}`,
      );
      const route = available.has(matching) ? matching : version.routeBase;
      return { ...version, href: `${prefix}${route}` || "/" };
    }),
  };
}
