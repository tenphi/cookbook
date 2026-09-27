declare module "virtual:cookbook/config" {
  import type {
    DocsConfig,
    DocsEntry,
    DocsHeading,
    DocsRoute,
    SiteConfig,
  } from "@tenphi/docs";
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  export const content: {
    entries: Array<
      DocsEntry & {
        mdx?: boolean;
        rendered?: { html: string; headings: DocsHeading[] };
      }
    >;
    routes: DocsRoute[];
    redirects: Record<string, string>;
    site: SiteConfig;
    base: string;
    search: boolean;
    locales: DocsConfig["locales"];
    defaultLocale: DocsConfig["defaultLocale"];
    translations: DocsConfig["translations"];
    componentStyles: Record<string, import("@tenphi/tasty").Styles>;
    tastyRuntime: Pick<
      NonNullable<DocsConfig["theme"]>,
      "units" | "recipes" | "states" | "presets"
    >;
  };
  export const mdxLoaders: Record<
    string,
    () => Promise<{
      default: AstroComponentFactory;
      getHeadings?: () => DocsHeading[] | Promise<DocsHeading[]>;
    }>
  >;
}

declare module "virtual:cookbook/layout" {
  import type { ResolvedNavigationLayout } from "./navigation.js";
  export const layout: ResolvedNavigationLayout;
}
