declare module "virtual:cookbook/config" {
  import type {
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
    site: SiteConfig;
    base: string;
    search: boolean;
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
