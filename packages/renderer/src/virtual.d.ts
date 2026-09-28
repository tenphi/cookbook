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
        hero?: Awaited<
          ReturnType<typeof import("./hero-image.js").resolveHeroMetadata>
        >;
        rendered?: { html: string; headings: DocsHeading[] };
      }
    >;
    routes: DocsRoute[];
    redirects: Record<string, string>;
    site: SiteConfig;
    base: string;
    search: boolean;
    tableOfContents: DocsConfig["tableOfContents"];
    logo: import("./site-logo.js").SiteLogoSet["logo"];
    locales: DocsConfig["locales"];
    defaultLocale: DocsConfig["defaultLocale"];
    translations: DocsConfig["translations"];
    head: DocsConfig["head"];
  };
  export const mdxLoaders: Record<
    string,
    () => Promise<{
      default: AstroComponentFactory;
      getHeadings?: () => DocsHeading[] | Promise<DocsHeading[]>;
    }>
  >;
}

declare module "virtual:cookbook/components/*" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const Component: AstroComponentFactory;
  export default Component;
}

declare module "virtual:cookbook/layout" {
  import type { ResolvedNavigationLayout } from "./navigation.js";
  export const layout: ResolvedNavigationLayout;
}
