declare module "virtual:cookbook/config" {
  import type {
    DocsEntry,
    DocsHeading,
    DocsRoute,
    SiteConfig,
  } from "@tenphi/docs";
  export const content: {
    entries: Array<
      DocsEntry & {
        rendered?: { html: string; headings: DocsHeading[] };
      }
    >;
    routes: DocsRoute[];
    site: SiteConfig;
    base: string;
    search: boolean;
  };
}

declare module "virtual:cookbook/layout" {
  import type { ResolvedNavigationLayout } from "./navigation.js";
  export const layout: ResolvedNavigationLayout;
}
