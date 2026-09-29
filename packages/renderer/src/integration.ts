import { resolveHeroMetadata } from "./hero-image.js";
import {
  validatePluginFrontmatter,
  type FrontmatterSchema,
} from "./plugin-contract.js";
import { resolveSiteLogo, type SiteLogoSet } from "./site-logo.js";
import { assertTastyOutput } from "./output-styles.js";
import { adaptPagefindUI } from "./pagefind-adapter.js";
import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import mdx from "@astrojs/mdx";
import * as pagefind from "pagefind";
import sitemap from "@astrojs/sitemap";
import { localeAlternates } from "./localization.js";
import {
  createDocsGraph,
  assertValidDocs,
  resolveDocsProject,
  type DocsConfig,
} from "@tenphi/docs";
import {
  configure,
  type ConfigTokens,
  type Styles,
  type TypographyPreset,
} from "@tenphi/tasty/core";
import { tastyIntegration } from "@tenphi/tasty/ssr/astro";
import type { AstroIntegration, HookParameters } from "astro";
import {
  navigationPath,
  resolveNavigationLayout,
  type ResolvedNavigationLayout,
} from "./navigation.js";
import { rehypeMermaid, satteriMermaid } from "./markdown/rehype-mermaid.js";
import { rehypeAlerts, satteriAlerts } from "./markdown/rehype-alerts.js";
import {
  rehypeTableScroll,
  satteriTableScroll,
} from "./markdown/rehype-table-scroll.js";
import {
  rehypePageAffordances,
  satteriPageAffordances,
} from "./markdown/rehype-page-affordances.js";
import { resolveDocsTheme } from "./theme/index.js";
import { configureFontFaces } from "./theme/fonts.js";
import { resolveThemeFonts, type FontAsset } from "./theme/font-loading.js";
import {
  cookbookShikiConfig,
  configureCodeHighlighting,
} from "./theme/shiki-theme.js";
import { TASTY_UNITS, tastyTokens } from "./theme/tasty-config.js";
import {
  configureComponentStyles,
  resolveLegacyAnatomyStyles,
  unusedCustomStyleNames,
} from "./components/component-styles.js";
import { resolveComponentOverrides } from "./component-overrides.js";
import { cookbookStates } from "./components/tasty-states.js";
import { createSiteIcons, type SiteIconSet } from "./site-icons.js";
import {
  createDefaultSocialImage,
  type GeneratedSocialImage,
} from "./social-image.js";
import { outputPathForPublicAsset } from "./output-path.js";
import { agentPagePath } from "./page-metadata.js";
import { renderAgentMarkdown } from "@tenphi/docs";
import { writeAgentDiscovery } from "./agent-discovery.js";

const stylingRuntimeError =
  "Cookbook styles are build/server-only. Do not import @tenphi/cookbook/styling, Tasty, or Glaze in browser scripts or client:* islands. Render styled markup on the server and attach a small client script for interactions.";
function isStylingRuntime(id: string): boolean {
  const path = id.replaceAll("\\", "/");
  return (
    /^@tenphi\/(?:tasty|glaze)(?:\/|$)/.test(path) ||
    /^@tenphi\/(?:cookbook|renderer)\/styling$/.test(path) ||
    /(?:^|\/)node_modules\/@tenphi\/(?:tasty|glaze)(?:\/|$)/.test(path)
  );
}

const packageRequire = createRequire(import.meta.url);
const tastyStaticMiddleware = packageRequire.resolve(
  "@tenphi/tasty/ssr/astro-middleware-static",
);
const tastyExtractStaticMiddleware = packageRequire.resolve(
  "@tenphi/tasty/ssr/astro-middleware-extract-static",
);
const astroReactServer = packageRequire.resolve("@astrojs/react/server.js");
const astroReactClient = packageRequire.resolve("@astrojs/react/client.js");
const astroReactIntegration = packageRequire.resolve("@astrojs/react");
const importNative = new Function("specifier", "return import(specifier)") as (
  specifier: string,
) => Promise<{ default: () => AstroIntegration }>;

export interface CookbookOptions {
  config?: DocsConfig;
  root?: string;
  configFile?: string | false;
  /** Validate custom metadata only; reserved routing/frontmatter fields cannot be changed. */
  frontmatterSchema?: FrontmatterSchema;
}

export default function cookbook(
  options: CookbookOptions = {},
): AstroIntegration {
  let integration: AstroIntegration | undefined;
  return {
    name: "cookbook",
    hooks: {
      "astro:config:setup": async (context) => {
        if (context.config.output !== "static") {
          throw new Error(
            `Cookbook requires Astro output: "static"; this project uses "${context.config.output}". Use a separate static Astro project for documentation.`,
          );
        }
        const project = await resolveDocsProject({
          ...options,
          root: options.root ?? fileURLToPath(context.config.root),
        });
        if (project.configFile) context.addWatchFile(project.configFile);
        integration = configuredCookbook({
          config: project.config,
          root: project.root,
          ...(options.frontmatterSchema
            ? { frontmatterSchema: options.frontmatterSchema }
            : {}),
        });
        await callInner([integration], "astro:config:setup", context);
      },
      "astro:config:done": async (context) => {
        if (integration)
          await callInner([integration], "astro:config:done", context);
      },
      "astro:server:setup": async (context) => {
        if (integration)
          await callInner([integration], "astro:server:setup", context);
      },
      "astro:build:start": async (context) => {
        if (integration)
          await callInner([integration], "astro:build:start", context);
      },
      "astro:build:done": async (context) => {
        if (integration)
          await callInner([integration], "astro:build:done", context);
      },
    },
  };
}

function configuredCookbook(options: CookbookOptions): AstroIntegration {
  const docsTheme = resolveDocsTheme(options.config?.theme);
  if (
    docsTheme.diagnostics.some((diagnostic) => diagnostic.severity === "error")
  ) {
    throw new Error(
      docsTheme.diagnostics.map((diagnostic) => diagnostic.message).join("\n"),
    );
  }
  configureTastyTheme(options.config?.theme, docsTheme);
  configureComponentStyles({
    ...options.config?.theme?.customStyles,
    ...options.config?.theme?.styles,
  });
  const headerPath = fileURLToPath(
    new URL("./overrides/Header.astro", import.meta.url),
  );
  const footerPath = fileURLToPath(
    new URL("./overrides/Footer.astro", import.meta.url),
  );
  const heroPath = fileURLToPath(
    new URL("./overrides/Hero.astro", import.meta.url),
  );
  const emptyFooterPath = fileURLToPath(
    new URL("./overrides/EmptyFooter.astro", import.meta.url),
  );
  const sidebarPath = fileURLToPath(
    new URL("./overrides/Sidebar.astro", import.meta.url),
  );
  const mobileMenuFooterPath = fileURLToPath(
    new URL("./overrides/MobileMenuFooter.astro", import.meta.url),
  );
  const mobileMenuTogglePath = fileURLToPath(
    new URL("./overrides/MobileMenuToggle.astro", import.meta.url),
  );
  const markdownContentPath = fileURLToPath(
    new URL("./overrides/MarkdownContent.astro", import.meta.url),
  );
  const themeSelectPath = fileURLToPath(
    new URL("./overrides/ThemeSelect.astro", import.meta.url),
  );
  const components = resolveComponentOverrides(
    {
      DraftContentNotice: fileURLToPath(
        new URL("./overrides/DraftContentNotice.astro", import.meta.url),
      ),
      Search: fileURLToPath(
        new URL("./overrides/Search.astro", import.meta.url),
      ),
      Head: fileURLToPath(new URL("./overrides/Head.astro", import.meta.url)),
      LanguageSelect: fileURLToPath(
        new URL("./overrides/LanguageSelect.astro", import.meta.url),
      ),
      PageFrame: fileURLToPath(
        new URL("./overrides/PageFrame.astro", import.meta.url),
      ),
      MobileTableOfContents: fileURLToPath(
        new URL("./overrides/MobileTableOfContents.astro", import.meta.url),
      ),
      Footer: footerPath,
      Header: headerPath,
      Hero: heroPath,
      MarkdownContent: markdownContentPath,
      Sidebar: sidebarPath,
      MobileMenuFooter: mobileMenuFooterPath,
      MobileMenuToggle: mobileMenuTogglePath,
      ThemeSelect: themeSelectPath,
      SocialIcons: fileURLToPath(
        new URL("./overrides/SocialIcons.astro", import.meta.url),
      ),
      SiteTitle: fileURLToPath(
        new URL("./components/SiteTitle.astro", import.meta.url),
      ),
      EditLink: fileURLToPath(
        new URL("./components/EditLink.astro", import.meta.url),
      ),
      LastUpdated: fileURLToPath(
        new URL("./components/LastUpdated.astro", import.meta.url),
      ),
      Pagination: fileURLToPath(
        new URL("./components/Pagination.astro", import.meta.url),
      ),
      TableOfContents: fileURLToPath(
        new URL("./components/TableOfContents.astro", import.meta.url),
      ),
    },
    options.config?.components?.overrides,
    emptyFooterPath,
  );
  const navigation = resolveNavigationLayout(options.config?.navigation);
  // Tasty 3.8's integration shape is structurally compatible with Astro 7;
  // its published helper type still models `site` as URL-only.
  const tasty = tastyIntegration({
    islands: false,
    css: { mode: "extract" },
  }) as unknown as AstroIntegration;
  let inner: AstroIntegration[] = [tasty];
  let projectRoot = options.root;
  let graphConfig = options.config;
  let graphBase = "/";
  let graph: Awaited<ReturnType<typeof createDocsGraph>> | undefined;
  let siteIconBase = "/";
  let siteIcons: SiteIconSet | undefined;
  let socialImage: GeneratedSocialImage | undefined;
  let fontAssets: FontAsset[] = [];
  let siteLogo: SiteLogoSet | undefined;

  async function loadGraph(refresh = false) {
    if (!graph || refresh) {
      graph = await createDocsGraph({
        ...(projectRoot ? { root: projectRoot } : {}),
        ...(graphConfig ? { config: graphConfig } : {}),
        base: graphBase,
      });
      assertValidDocs(graph);
      await validatePluginFrontmatter(graph.entries, options.frontmatterSchema);
    }
    return graph;
  }

  async function loadSiteIcons(): Promise<SiteIconSet> {
    if (!projectRoot) {
      throw new Error(
        "Cookbook cannot generate site icons without a project root.",
      );
    }
    return createSiteIcons({
      base: siteIconBase,
      root: projectRoot,
      ...(options.config?.site ? { site: options.config.site } : {}),
      themeColors: {
        light: docsTheme.colors.surface.light ?? "#ffffff",
        dark: docsTheme.colors.surface.dark ?? "#20232a",
      },
    });
  }

  return {
    name: "cookbook",
    hooks: {
      "astro:config:setup": async (context) => {
        const react = (
          await importNative(pathToFileURL(astroReactIntegration).href)
        ).default();
        projectRoot ??= fileURLToPath(context.config.root);
        const base = context.config.base;
        for (const [role, font] of Object.entries(
          options.config?.theme?.fonts ?? {},
        )) {
          if (!font || typeof font === "string" || "google" in font) continue;
          for (const file of font.files) {
            const path = join(
              fileURLToPath(context.config.publicDir),
              file.src.slice(1),
            );
            let isFile = false;
            try {
              isFile = (await stat(path)).isFile();
            } catch {
              // Report missing or unreadable files with the configuration path.
            }
            if (!isFile)
              throw new Error(
                `theme.fonts.${role}: ${file.src} must be a readable file in the site's public directory.`,
              );
          }
        }
        const resolvedFonts = await resolveThemeFonts(
          options.config?.theme?.fonts,
          {
            base,
            cacheDir: join(
              fileURLToPath(context.config.cacheDir),
              "cookbook-fonts",
            ),
            loading: options.config?.theme?.fontLoading ?? {},
            presets: docsTheme.presets,
            warn: (message) => context.logger.warn(message),
          },
        );
        const fontFaces = resolvedFonts.faces;
        fontAssets = resolvedFonts.assets;
        const usedFamilies = Object.values(docsTheme.presets).map(
          (preset) => preset.fontFamily ?? "",
        );
        configureFontFaces(fontFaces, {
          display: options.config?.theme?.fontLoading?.display ?? "swap",
          onest: usedFamilies.some((family) =>
            family.includes("Onest Variable"),
          ),
          mono: usedFamilies.some((family) =>
            family.includes("JetBrains Mono Variable"),
          ),
        });
        const configuredSite = options.config?.site?.url;
        const astroSite = context.config.site
          ? new URL(context.config.site).href
          : undefined;
        if (
          configuredSite &&
          astroSite &&
          astroSite !== new URL(configuredSite).href
        ) {
          throw new Error(
            `Cookbook site.url (${configuredSite}) conflicts with Astro site (${astroSite}).`,
          );
        }
        if (configuredSite || astroSite)
          graphConfig = {
            ...graphConfig,
            site: { ...graphConfig?.site, url: (configuredSite ?? astroSite)! },
          };
        siteIconBase = base;
        graphBase = base;
        context.config.integrations.push(
          sitemap({
            serialize: (item) => {
              if (!graph?.config.locales) return item;
              const route = navigationPath(
                decodeURI(new URL(item.url).pathname),
                graphBase,
              );
              return {
                ...item,
                links: localeAlternates(
                  route,
                  graph.routes.filter((route) => route.sitemap !== false),
                  graph.config,
                ).map(({ lang, route }) => ({
                  lang,
                  url: new URL(
                    `${graphBase.replace(/\/$/, "")}${route === "/" ? "/" : `${route}/`}`,
                    item.url,
                  ).href,
                })),
              };
            },
            filter: (url) => {
              const pathname = decodeURI(new URL(url).pathname);
              const route = navigationPath(pathname, graphBase);
              return (
                graph?.routes.some(
                  (entry) =>
                    entry.route === route &&
                    entry.discoverable !== false &&
                    entry.sitemap !== false,
                ) ?? false
              );
            },
          }),
        );
        siteIcons = await loadSiteIcons();
        socialImage =
          graphConfig?.site?.seo?.image === undefined
            ? await createDefaultSocialImage(
                graphConfig?.site ?? {},
                base,
                docsTheme.colors,
              )
            : undefined;
        siteLogo = await resolveSiteLogo(
          projectRoot!,
          base,
          options.config?.site,
        );
        registerCookbookMarkdownPlugins(context.config.markdown.processor);
        inner = [react, tasty, mdx()];
        let markdownRuntime = {
          image: context.config.image,
          markdown: {
            ...context.config.markdown,
            syntaxHighlight: "shiki" as const,
            shikiConfig: cookbookShikiConfig(
              context.config.markdown.shikiConfig,
            ),
          },
          srcDir: context.config.srcDir,
        };
        let markdownRenderer: ReturnType<
          typeof markdownRuntime.markdown.processor.createRenderer
        >;
        context.updateConfig({
          ...(configuredSite && !context.config.site
            ? { site: configuredSite }
            : {}),
          base,
          markdown: {
            syntaxHighlight: "shiki",
            shikiConfig: cookbookShikiConfig(
              context.config.markdown.shikiConfig,
            ),
          },
          vite: {
            optimizeDeps: { exclude: ["@pagefind/default-ui"] },
            ssr: {
              external: ["@tenphi/docs", "react", "react-dom"],
            },
            plugins: [
              {
                name: "cookbook-pagefind-ui",
                enforce: "pre",
                transform(source, id) {
                  const modulePath = id
                    .replaceAll("\\", "/")
                    .replace(/\?.*$/, "");
                  if (
                    modulePath.includes("/@pagefind/default-ui/npm_dist/") &&
                    /\/ui-core\.(?:mjs|cjs)$/.test(modulePath)
                  )
                    return adaptPagefindUI(source);
                },
              },
              {
                name: "cookbook-server-only-styling",
                enforce: "pre",
                resolveId(id, _importer, settings) {
                  if (
                    settings?.ssr ||
                    this.environment.config.consumer === "server"
                  )
                    return;
                  if (isStylingRuntime(id)) this.error(stylingRuntimeError);
                },
                generateBundle() {
                  if (this.environment.config.consumer === "server") return;
                  for (const id of this.getModuleIds())
                    if (isStylingRuntime(id)) this.error(stylingRuntimeError);
                },
              },
              {
                name: "cookbook-react-runtime",
                enforce: "post",
                configResolved(config) {
                  for (const environment of Object.values(
                    config.environments,
                  )) {
                    if (environment.consumer === "server")
                      environment.resolve.dedupe =
                        environment.resolve.dedupe.filter(
                          (id) => id !== "react" && id !== "react-dom",
                        );
                    if (environment.consumer === "client")
                      environment.optimizeDeps.include =
                        environment.optimizeDeps.include?.map((id) =>
                          /^react(?:-dom)?(?:\/|$)/.test(id)
                            ? packageRequire.resolve(id)
                            : id,
                        ) ?? [];
                  }
                },
                resolveId(id, _importer, settings) {
                  if (
                    !settings?.ssr &&
                    this.environment.config.consumer !== "server" &&
                    /^react(?:-dom)?(?:\/|$)/.test(id)
                  ) {
                    return packageRequire.resolve(id);
                  }
                },
              },
              componentOverridesPlugin(
                components,
                fileURLToPath(context.config.root),
              ),
              virtualDocsPlugin(
                async () => {
                  const loaded = await loadGraph(true);
                  const entries = await Promise.all(
                    loaded.entries.map(async (entry) => {
                      const hero = await resolveHeroMetadata(entry);
                      if (
                        entry.trust === "mdx" &&
                        entry.sourcePath.toLowerCase().endsWith(".mdx")
                      ) {
                        return { ...entry, hero, mdx: true };
                      }
                      const { image, markdown, srcDir } = markdownRuntime;
                      markdownRenderer ??= markdown.processor.createRenderer({
                        image,
                        syntaxHighlight: markdown.syntaxHighlight,
                        shikiConfig: markdown.shikiConfig,
                        gfm: markdown.gfm,
                        smartypants: markdown.smartypants,
                      } as unknown as Parameters<
                        typeof markdown.processor.createRenderer
                      >[0]);
                      const renderer = await markdownRenderer;
                      const rendered = await renderer.render(
                        entry.transformedBody,
                        {
                          frontmatter: entry.frontmatter,
                          fileURL: docsContentUrl(entry.route, srcDir),
                        },
                      );
                      return {
                        ...entry,
                        hero,
                        rendered: {
                          html: rendered.code,
                          headings: rendered.metadata.headings,
                        },
                      };
                    }),
                  );
                  return {
                    entries,
                    routes: loaded.routes,
                    redirects: loaded.redirects,
                    tableOfContents: loaded.config.tableOfContents,
                    site: socialImage
                      ? {
                          ...documentedSite(loaded),
                          seo: {
                            ...loaded.config.site.seo,
                            image: socialImage.image,
                          },
                        }
                      : documentedSite(loaded),
                    base: loaded.config.build.base,
                    search:
                      loaded.config.search.enabled ||
                      typeof options.config?.components?.overrides?.Search ===
                        "string",
                    logo: siteLogo?.logo,
                    locales: loaded.config.locales,
                    defaultLocale: loaded.config.defaultLocale,
                    translations: loaded.config.translations,
                    head: [
                      ...(siteIcons?.head ?? []),
                      ...(options.config?.head ?? []),
                    ],
                  };
                },
                navigation,
                () => [
                  projectRoot!,
                  ...(graphConfig?.content?.sources ?? []).flatMap((source) =>
                    "package" in source
                      ? []
                      : [resolve(projectRoot!, source.root ?? ".")],
                  ),
                  ...(graph?.entries.map((entry) => entry.sourceRoot) ?? []),
                ],
              ),
            ],
            resolve: {
              alias: [
                {
                  find: "@tenphi/tasty/ssr/astro-middleware-static",
                  replacement: tastyStaticMiddleware,
                },
                {
                  find: "@tenphi/tasty/ssr/astro-middleware-extract-static",
                  replacement: tastyExtractStaticMiddleware,
                },
                {
                  find: "@astrojs/react/server.js",
                  replacement: astroReactServer,
                },
                {
                  find: "@astrojs/react/client.js",
                  replacement: astroReactClient,
                },
              ],
            },
          },
        });
        await callInner(inner, "astro:config:setup", context);

        graph = await createDocsGraph({
          root: projectRoot,
          ...(graphConfig ? { config: graphConfig } : {}),
          base: graphBase,
        });
        assertValidDocs(graph);
        context.injectRoute({
          pattern: "[...route]",
          entrypoint: new URL("./routes/DocsPage.astro", import.meta.url),
          prerender: true,
        });
        if (!graph.entryByRoute("/404")) {
          context.injectRoute({
            pattern: "404",
            entrypoint: new URL("./routes/NotFound.astro", import.meta.url),
            prerender: true,
          });
        }

        context.config.integrations.push({
          name: "cookbook-markdown-renderer",
          hooks: {
            "astro:config:setup": ({ config }) => {
              markdownRuntime = {
                image: config.image,
                markdown: {
                  ...config.markdown,
                  syntaxHighlight: "shiki" as const,
                  shikiConfig: cookbookShikiConfig(config.markdown.shikiConfig),
                },
                srcDir: config.srcDir,
              };
            },
          },
        });
      },
      "astro:config:done": async (context) => {
        configureCodeHighlighting(
          cookbookShikiConfig(context.config.markdown.shikiConfig),
        );
        await callInner(inner, "astro:config:done", context);
      },
      "astro:server:setup": async ({ server, logger }) => {
        let assets = docsAssetMap(await loadGraph());
        if (siteLogo?.sourcePaths.length) {
          server.watcher.add(siteLogo.sourcePaths);
          server.watcher.on("change", (path) => {
            if (siteLogo?.sourcePaths.includes(path)) void server.restart();
          });
        }
        if (options.config?.site?.favicon && siteIcons) {
          server.watcher.add(siteIcons.sourcePath);
          server.watcher.on("change", async (changedPath) => {
            if (changedPath !== siteIcons?.sourcePath) return;
            try {
              siteIcons = await loadSiteIcons();
              server.ws.send({ type: "full-reload" });
            } catch (error) {
              logger.error(errorMessage(error));
            }
          });
        }
        server.middlewares.use(async (request, response, next) => {
          if (request.method !== "GET" && request.method !== "HEAD") {
            next();
            return;
          }
          const requestPathname = requestPath(request.url);
          // Vite strips Astro's base before invoking development middleware.
          const pathname =
            graphBase !== "/" && !requestPathname.startsWith(graphBase)
              ? `${graphBase.replace(/\/$/, "")}${requestPathname}`
              : requestPathname;
          if (pathname.includes("/_cookbook/pages/")) {
            try {
              const current = await loadGraph(true);
              const entry = current.entries.find(
                (entry) =>
                  !entry.frontmatter.draft &&
                  agentPagePath(entry.route, current.config.build.base) ===
                    pathname,
              );
              if (entry && current.config.site.seo?.copyPage !== false) {
                response.statusCode = 200;
                response.setHeader(
                  "Content-Type",
                  "text/markdown; charset=utf-8",
                );
                response.setHeader("X-Robots-Tag", "noindex");
                response.end(
                  request.method === "HEAD"
                    ? undefined
                    : renderAgentMarkdown(entry, current.config),
                );
                return;
              }
            } catch (error) {
              logger.error(errorMessage(error));
            }
          }
          const fontAsset = [...fontAssets, ...(siteLogo?.assets ?? [])].find(
            (asset) => asset.publicPath === pathname,
          );
          if (fontAsset) {
            response.statusCode = 200;
            response.setHeader("Content-Type", fontAsset.contentType);
            response.setHeader("Content-Length", fontAsset.body.byteLength);
            response.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            );
            response.end(
              request.method === "HEAD" ? undefined : fontAsset.body,
            );
            return;
          }
          const siteIcon = siteIcons?.assets.find(
            (asset) => asset.publicPath === pathname,
          );
          if (siteIcon) {
            response.statusCode = 200;
            response.setHeader("Content-Type", siteIcon.contentType);
            response.setHeader("Content-Length", siteIcon.body.byteLength);
            response.setHeader("Cache-Control", "no-cache");
            response.end(request.method === "HEAD" ? undefined : siteIcon.body);
            return;
          }
          if (socialImage?.publicPath === pathname) {
            response.statusCode = 200;
            response.setHeader("Content-Type", socialImage.contentType);
            response.setHeader("Content-Length", socialImage.body.byteLength);
            response.setHeader("Cache-Control", "no-cache");
            response.end(
              request.method === "HEAD" ? undefined : socialImage.body,
            );
            return;
          }
          if (!pathname.includes("/_tasty-assets/")) {
            next();
            return;
          }
          let asset = assets.get(pathname);
          if (!asset) {
            try {
              assets = docsAssetMap(await loadGraph(true));
            } catch {
              next();
              return;
            }
            asset = assets.get(pathname);
          }
          if (!asset?.sourcePath) {
            next();
            return;
          }
          try {
            const body = await readFile(asset.sourcePath);
            response.statusCode = 200;
            response.setHeader("Content-Type", assetContentType(pathname));
            response.setHeader("Content-Length", body.byteLength);
            response.setHeader("Cache-Control", "no-cache");
            response.end(request.method === "HEAD" ? undefined : body);
          } catch {
            next();
          }
        });
      },
      "astro:build:start": async (context) => {
        siteIcons = await loadSiteIcons();
        await loadGraph();
        await callInner(inner, "astro:build:start", context);
      },
      "astro:build:done": async (context) => {
        await callInner(inner, "astro:build:done", context);
        const output = fileURLToPath(context.dir);
        const anatomyNames = new Set<string>();
        for (const relativePath of await readdir(output, { recursive: true })) {
          if (extname(relativePath) !== ".html") continue;
          const path = join(output, relativePath);
          const html = await readFile(path, "utf8");
          for (const match of html.matchAll(/\bdata-tasty-anatomy="([^"]+)"/g))
            anatomyNames.add(match[1]!);
          const sanitized = html
            .replace(
              /\s*<link\b(?=[^>]*rel="stylesheet")(?=[^>]*href="data:text\/css,")[^>]*>/g,
              "",
            )
            .replace(/\s*<style>\s*<\/style>/g, "")
            .replace(
              /<style>astro-island,astro-slot,astro-static-slot\{display:contents\}<\/style>/g,
              "",
            );
          assertTastyOutput(sanitized, relativePath);
          if (sanitized !== html) await writeFile(path, sanitized);
        }
        for (const name of unusedCustomStyleNames(
          options.config?.theme?.customStyles,
          anatomyNames,
        )) {
          context.logger.warn(
            `theme.customStyles.${name} did not match a component style resolver or rendered data-tasty-anatomy attribute. Check that its name matches defineComponent() or resolveComponentStyles().`,
          );
        }
        if (graph?.config.search.enabled !== false) {
          try {
            const { index, errors } = await pagefind.createIndex();
            if (errors.length || !index)
              throw new Error(
                errors.join("\n") || "Pagefind did not create an index.",
              );
            const added = await index.addDirectory({ path: output });
            if (added.errors.length) throw new Error(added.errors.join("\n"));
            const generated = await index.getFiles();
            if (generated.errors.length)
              throw new Error(generated.errors.join("\n"));
            if (
              !generated.files.some(
                (file) => file.path === "pagefind-entry.json",
              )
            )
              throw new Error("Pagefind did not produce a search index.");
            const pagefindOutput = join(output, "pagefind");
            // Write the completed buffers before closing Pagefind's service.
            // Its disk writer can report success before every file is flushed.
            for (const file of generated.files) {
              const target = resolve(pagefindOutput, file.path);
              if (!target.startsWith(`${pagefindOutput}${sep}`))
                throw new Error(`Invalid Pagefind output path: ${file.path}`);
              if (!file.content.byteLength)
                throw new Error(
                  `Pagefind produced an empty file: ${file.path}`,
                );
              await mkdir(dirname(target), { recursive: true });
              await writeFile(target, file.content);
            }
          } finally {
            await pagefind.close();
          }
        }
        const pagefindOutput = join(output, "pagefind");
        if (existsSync(pagefindOutput)) {
          for (const name of await readdir(pagefindOutput)) {
            if (extname(name) === ".css") {
              await unlink(join(pagefindOutput, name));
            }
          }
        }
        for (const relativePath of await readdir(output, { recursive: true })) {
          if (
            extname(relativePath) === ".css" &&
            !/^tasty\.[^/]+\.css$/.test(
              relativePath.split(/[/\\]/).at(-1) ?? "",
            )
          ) {
            throw new Error(
              `Non-Tasty stylesheet found in ${relativePath}. Use theme.styles or Tasty components for visual changes.`,
            );
          }
        }
        for (const asset of [
          ...(siteIcons?.assets ?? []),
          ...(socialImage ? [socialImage] : []),
          ...fontAssets,
          ...(siteLogo?.assets ?? []),
        ]) {
          const target = join(output, asset.outputPath);
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, asset.body);
        }
        if (!graph) return;
        for (const asset of graph.assets) {
          if (!asset.sourcePath || !asset.publicPath) continue;
          const target = join(
            output,
            outputPathForPublicAsset(asset.publicPath, graph.config.build.base),
          );
          await mkdir(dirname(target), { recursive: true });
          await cp(asset.sourcePath, target);
        }
        await writeAgentDiscovery(output, graph);
      },
    },
  };
}

function registerCookbookMarkdownPlugins(processor: {
  name: string;
  options: object;
}): void {
  if (processor.name === "unified") {
    const options = processor.options as { rehypePlugins?: unknown };
    const plugins = Array.isArray(options.rehypePlugins)
      ? options.rehypePlugins
      : [];
    if (!plugins.includes(rehypeMermaid)) plugins.push(rehypeMermaid);
    if (!plugins.includes(rehypeAlerts)) plugins.push(rehypeAlerts);
    if (!plugins.includes(rehypeTableScroll)) plugins.push(rehypeTableScroll);
    if (!plugins.includes(rehypePageAffordances))
      plugins.push(rehypePageAffordances);
    options.rehypePlugins = plugins;
  } else if (processor.name === "satteri") {
    const options = processor.options as { hastPlugins?: unknown };
    const plugins = Array.isArray(options.hastPlugins)
      ? options.hastPlugins
      : [];
    if (!plugins.includes(satteriMermaid)) plugins.push(satteriMermaid);
    if (!plugins.includes(satteriAlerts)) plugins.push(satteriAlerts);
    if (!plugins.includes(satteriTableScroll)) plugins.push(satteriTableScroll);
    if (!plugins.includes(satteriPageAffordances))
      plugins.push(satteriPageAffordances);
    options.hastPlugins = plugins;
  }
}

function docsContentUrl(route: string, srcDir: URL): URL {
  const slug = route === "/" ? "index" : route.replace(/^\/+|\/+$/g, "");
  return new URL(`content/docs/${slug}.md`, srcDir);
}

function componentOverridesPlugin(
  components: Record<string, string>,
  astroRoot: string,
) {
  const prefix = "virtual:cookbook/components/";
  return {
    name: "cookbook-component-overrides",
    resolveId(id: string) {
      const name = id.startsWith(prefix) ? id.slice(prefix.length) : undefined;
      return name && components[name] ? `\0${id}` : undefined;
    },
    load(id: string) {
      const name = id.startsWith(`\0${prefix}`)
        ? id.slice(prefix.length + 1)
        : undefined;
      if (!name || !components[name]) return undefined;
      const configured = components[name];
      const target = configured.startsWith(".")
        ? resolve(astroRoot, configured)
        : configured;
      return `export { default } from ${JSON.stringify(target)};`;
    },
  };
}

function docsAssetMap(graph: Awaited<ReturnType<typeof createDocsGraph>>) {
  return new Map(
    graph.assets.flatMap((asset) =>
      asset.publicPath && asset.sourcePath
        ? [[asset.publicPath, asset] as const]
        : [],
    ),
  );
}

function documentedSite(
  graph: Awaited<ReturnType<typeof createDocsGraph>>,
): Awaited<ReturnType<typeof createDocsGraph>>["config"]["site"] {
  if (graph.config.site.version) return graph.config.site;
  const packages = new Set(
    graph.entries.flatMap((entry) =>
      entry.package?.resolved ? [entry.package.resolved] : [],
    ),
  );
  if (packages.size !== 1) return graph.config.site;
  const resolved = packages.values().next().value;
  if (!resolved) return graph.config.site;
  const separator = resolved.lastIndexOf("@");
  if (separator <= 0 || separator === resolved.length - 1)
    return graph.config.site;
  return { ...graph.config.site, version: resolved.slice(separator + 1) };
}

function requestPath(url: string | undefined): string {
  try {
    return decodeURIComponent(new URL(url ?? "/", "http://localhost").pathname);
  } catch {
    return "";
  }
}

function assetContentType(pathname: string): string {
  switch (extname(pathname).toLowerCase()) {
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function configureTastyTheme(
  theme: DocsConfig["theme"],
  resolved: ReturnType<typeof resolveDocsTheme>,
): void {
  const tokens = tastyTokens(resolved) as ConfigTokens;
  const globalStyles = resolveLegacyAnatomyStyles(theme?.customStyles);

  // Recipes and custom parser units are module-local in Tasty. Astro evaluates
  // renderer code in a separate server module graph. Share configuration only
  // inside the build process; never serialize this state into the page.
  (
    globalThis as typeof globalThis & { __tenphiCookbookTastyRuntime?: unknown }
  ).__tenphiCookbookTastyRuntime = {
    units: { ...TASTY_UNITS, ...theme?.units },
    recipes: theme?.recipes ?? {},
    states: theme?.states ?? {},
    presets: resolved.presets,
    tokens,
  };
  configure({
    states: {
      ...cookbookStates,
      ...theme?.states,
    },
    units: { ...TASTY_UNITS, ...theme?.units },
    recipes: theme?.recipes ?? {},
    tokens,
    presets: resolved.presets as Record<string, TypographyPreset>,
    ...(globalStyles
      ? { globalStyles: globalStyles as Record<string, Styles> }
      : {}),
  });
}

async function callInner<K extends keyof AstroIntegration["hooks"]>(
  integrations: AstroIntegration[],
  hook: K,
  context: HookParameters<K>,
): Promise<void> {
  for (const integration of integrations) {
    const handler = integration.hooks[hook];
    if (typeof handler === "function") {
      await (handler as (value: HookParameters<K>) => void | Promise<void>)(
        context,
      );
    }
  }
}

function virtualDocsPlugin(
  getContent: () => unknown | Promise<unknown>,
  layout: ResolvedNavigationLayout,
  getWatchRoots: () => string[],
) {
  const configId = "\0virtual:cookbook/config";
  const layoutId = "\0virtual:cookbook/layout";
  const mdxPrefix = "virtual:cookbook/mdx/";
  type VirtualContent = {
    entries: Array<{
      absolutePath: string;
      assets?: Array<{ sourcePath?: string }>;
      mdx?: boolean;
      route: string;
      transformedBody: string;
    }>;
  };
  type MdxRecord = {
    entry: VirtualContent["entries"][number];
    sourceId: string;
    virtualId: string;
  };
  let contentPromise: Promise<VirtualContent> | undefined;
  let mdxRecords: MdxRecord[] = [];
  const watchedPaths = new Set<string>();

  async function loadContent(): Promise<VirtualContent> {
    contentPromise ??= Promise.resolve(getContent()) as Promise<VirtualContent>;
    let content: VirtualContent;
    try {
      content = await contentPromise;
    } catch (error) {
      contentPromise = undefined;
      throw error;
    }
    mdxRecords = content.entries.flatMap((entry, index) =>
      entry.mdx
        ? [
            {
              entry,
              sourceId: entry.absolutePath.replace(
                /\.mdx$/i,
                `.cookbook-${index}.mdx`,
              ),
              virtualId: `${mdxPrefix}${index}`,
            },
          ]
        : [],
    );
    return content;
  }

  return {
    name: "cookbook-data",
    enforce: "pre" as const,
    configureServer(server: HookParameters<"astro:server:setup">["server"]) {
      const roots = [...new Set(getWatchRoots())];
      server.watcher.add(roots);
      const changed = (_event: string, path: string) => {
        const owned = roots.some(
          (root) => path === root || path.startsWith(`${root}/`),
        );
        if (
          !watchedPaths.has(path) &&
          !(
            owned &&
            (/\.mdx?$/i.test(path) || path.endsWith("/cookbook.lock.json"))
          )
        )
          return;
        contentPromise = undefined;
        mdxRecords = [];
        for (const environment of Object.values(server.environments))
          environment.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("all", changed);
      server.httpServer?.once("close", () =>
        server.watcher.off("all", changed),
      );
    },
    async resolveId(
      id: string,
      _importer: string | undefined,
      resolveOptions: { ssr?: boolean },
    ) {
      if (id === "virtual:cookbook/config") {
        if (resolveOptions.ssr === false)
          throw new Error(
            "Cookbook content queries are build-time only. Pass selected public data to a client component as props instead.",
          );
        return configId;
      }
      if (id === "virtual:cookbook/layout") return layoutId;
      if (id.startsWith(mdxPrefix)) {
        await loadContent();
        return mdxRecords.find((record) => record.virtualId === id)?.sourceId;
      }
      return undefined;
    },
    async load(this: { addWatchFile(path: string): void }, id: string) {
      if (id === configId) {
        const content = await loadContent();
        watchedPaths.clear();
        for (const entry of content.entries) {
          watchedPaths.add(entry.absolutePath);
          this.addWatchFile(entry.absolutePath);
          for (const asset of entry.assets ?? []) {
            if (!asset.sourcePath) continue;
            watchedPaths.add(asset.sourcePath);
            this.addWatchFile(asset.sourcePath);
          }
        }
        const loaders = mdxRecords
          .map(
            ({ entry, virtualId }) =>
              `${JSON.stringify(entry.route)}: () => import(${JSON.stringify(virtualId)})`,
          )
          .join(",\n");
        return `export const content = ${JSON.stringify(content)};\nexport const mdxLoaders = {${loaders}};`;
      }
      if (id === layoutId) {
        return `export const layout = ${JSON.stringify(layout)};`;
      }
      const mdx = mdxRecords.find((record) => record.sourceId === id);
      if (mdx) return mdx.entry.transformedBody;
      return undefined;
    },
    watchChange(id: string) {
      if (!watchedPaths.has(id)) return;
      contentPromise = undefined;
      mdxRecords = [];
    },
  };
}

function repositoryIcon(repository: string): "github" | "gitlab" | "link" {
  try {
    const host = new URL(repository).hostname;
    if (host === "github.com" || host.endsWith(".github.com")) return "github";
    if (host === "gitlab.com" || host.endsWith(".gitlab.com")) return "gitlab";
  } catch {
    // Configuration validation reports invalid repository URLs.
  }
  return "link";
}
