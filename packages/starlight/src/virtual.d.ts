declare module "virtual:cookbook/config" {
  import type { DocsEntry, DocsRoute, SiteConfig } from "@tenphi/docs";
  export const content: {
    entries: DocsEntry[];
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
