declare module "virtual:tasty-docs/config" {
  import type { DocsEntry, DocsRoute, SiteConfig } from "@tenphi/docs";
  export const content: {
    entries: DocsEntry[];
    routes: DocsRoute[];
    site: SiteConfig;
    base: string;
    search: boolean;
  };
}
