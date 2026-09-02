import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import starlight from "./starlight-runtime.js";
import {
  createDocsGraph,
  assertValidDocs,
  type DocsConfig,
  type NavigationItem,
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
  resolveNavigationLayout,
  type ResolvedNavigationLayout,
} from "./navigation.js";
import { rehypeMermaid, satteriMermaid } from "./markdown/rehype-mermaid.js";
import { resolveDocsTheme } from "./theme/index.js";
import {
  bashPlaceholderTransformer,
  tastyCodeTheme,
} from "./theme/shiki-theme.js";
import { TASTY_UNITS, tastyTokens } from "./theme/tasty-config.js";
import {
  configureComponentStyles,
  resolveLegacyAnatomyStyles,
} from "./components/component-styles.js";
import { cookbookStates } from "./components/tasty-states.js";

const packageRequire = createRequire(import.meta.url);
const starlightRoot = dirname(packageRequire.resolve("@astrojs/starlight"));
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
}

export default function cookbook(
  options: CookbookOptions = {},
): AstroIntegration {
  const docsTheme = resolveDocsTheme(options.config?.theme);
  if (
    docsTheme.diagnostics.some((diagnostic) => diagnostic.severity === "error")
  ) {
    throw new Error(
      docsTheme.diagnostics.map((diagnostic) => diagnostic.message).join("\n"),
    );
  }
  configureTastyTheme(options.config?.theme, docsTheme);
  configureComponentStyles(options.config?.theme?.styles);
  const headerPath = fileURLToPath(
    new URL("./overrides/Header.astro", import.meta.url),
  );
  const sidebarPath = fileURLToPath(
    new URL("./overrides/Sidebar.astro", import.meta.url),
  );
  const mobileMenuFooterPath = fileURLToPath(
    new URL("./overrides/MobileMenuFooter.astro", import.meta.url),
  );
  const themeSelectPath = fileURLToPath(
    new URL("./overrides/ThemeSelect.astro", import.meta.url),
  );
  const components = {
    Header: headerPath,
    Sidebar: sidebarPath,
    MobileMenuFooter: mobileMenuFooterPath,
    ThemeSelect: themeSelectPath,
    ...options.config?.components?.overrides,
  };
  const navigation = resolveNavigationLayout(options.config?.navigation);
  // Tasty 3.6's integration shape is structurally compatible with Astro 7;
  // its published helper type still models `site` as URL-only.
  const tasty = tastyIntegration({
    islands: false,
    css: { mode: "extract" },
  }) as unknown as AstroIntegration;
  let inner: AstroIntegration[] = [tasty];
  let projectRoot = options.root;
  let graphConfig = options.config;
  let graph: Awaited<ReturnType<typeof createDocsGraph>> | undefined;
  let usingContentCollection = false;

  async function loadGraph(refresh = false) {
    if (!graph || refresh) {
      graph = await createDocsGraph({
        ...(projectRoot ? { root: projectRoot } : {}),
        ...(graphConfig ? { config: graphConfig } : {}),
      });
      assertValidDocs(graph);
    }
    return graph;
  }

  return {
    name: "cookbook",
    hooks: {
      "astro:config:setup": async (context) => {
        const react = (
          await importNative(pathToFileURL(astroReactIntegration).href)
        ).default();
        if (
          context.config.integrations.some(
            (integration) => integration.name === "@astrojs/starlight",
          )
        ) {
          throw new Error(
            "Cookbook already includes Starlight. Remove the direct @astrojs/starlight integration before continuing.",
          );
        }
        projectRoot ??= fileURLToPath(context.config.root);
        const base = options.config?.build?.base ?? context.config.base;
        graphConfig = {
          ...options.config,
          build: { ...options.config?.build, base },
        };
        usingContentCollection = hasContentConfig(context.config.srcDir);
        registerCookbookMarkdownPlugins(context.config.markdown.processor);
        const starlightIntegration = starlight({
          title: options.config?.site?.title ?? "Documentation",
          expressiveCode: false,
          ...(options.config?.site?.description
            ? { description: options.config.site.description }
            : {}),
          ...(options.config?.search?.enabled === false
            ? { pagefind: false }
            : {}),
          ...(!usingContentCollection ? { disable404Route: true } : {}),
          components,
          sidebar: usingContentCollection ? starlightSidebar(navigation) : [],
        });
        inner = [react, tasty, starlightIntegration];
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
          base,
          output: "static",
          markdown: {
            syntaxHighlight: "shiki",
            shikiConfig: cookbookShikiConfig(
              context.config.markdown.shikiConfig,
            ),
          },
          vite: {
            ssr: {
              external: [
                "@tenphi/docs",
                "react",
                "react-dom",
                "react-dom/server",
              ],
            },
            plugins: [
              stripStarlightStylesPlugin(starlightRoot),
              virtualDocsPlugin(async () => {
                const loaded = await loadGraph();
                const entries = usingContentCollection
                  ? loaded.entries
                  : await Promise.all(
                      loaded.entries.map(async (entry) => {
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
                            fileURL: starlightContentUrl(entry.route, srcDir),
                          },
                        );
                        return {
                          ...entry,
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
                  site: documentedSite(loaded),
                  base: loaded.config.build.base,
                  search: loaded.config.search.enabled,
                };
              }, navigation),
            ],
            resolve: {
              alias: [
                {
                  find: "@astrojs/starlight",
                  replacement: starlightRoot,
                },
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
        await callInner(inner.slice(0, 2), "astro:config:setup", context);

        if (!usingContentCollection) {
          graph = await createDocsGraph({
            root: projectRoot,
            config: graphConfig,
          });
          assertValidDocs(graph);
          context.injectRoute({
            pattern: "[...route]",
            entrypoint: new URL("./routes/DocsPage.astro", import.meta.url),
            prerender: true,
          });
        }

        // Starlight inserts its own follow-up integrations immediately after
        // itself. Give it a temporary real position so Astro processes those
        // once, after this composite integration, rather than re-visiting us.
        const starlightWithPlugins = inner[2];
        if (starlightWithPlugins) {
          const selfIndex = context.config.integrations.findIndex(
            (integration) => integration.name === "cookbook",
          );
          context.config.integrations.splice(
            selfIndex + 1,
            0,
            starlightWithPlugins,
          );
          try {
            await callInner(
              [starlightWithPlugins],
              "astro:config:setup",
              usingContentCollection
                ? context
                : withoutStarlightDocsRoute(context),
            );
          } finally {
            const placeholderIndex =
              context.config.integrations.indexOf(starlightWithPlugins);
            if (placeholderIndex >= 0)
              context.config.integrations.splice(placeholderIndex, 1);
          }
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
        await callInner(inner, "astro:config:done", context);
      },
      "astro:server:setup": async ({ server }) => {
        let assets = docsAssetMap(await loadGraph());
        server.middlewares.use(async (request, response, next) => {
          if (request.method !== "GET" && request.method !== "HEAD") {
            next();
            return;
          }
          const pathname = requestPath(request.url);
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
        await loadGraph();
        await callInner(inner, "astro:build:start", context);
      },
      "astro:build:done": async (context) => {
        await callInner(inner, "astro:build:done", context);
        const output = fileURLToPath(context.dir);
        for (const relativePath of await readdir(output, { recursive: true })) {
          if (extname(relativePath) !== ".html") continue;
          const path = join(output, relativePath);
          const html = await readFile(path, "utf8");
          const sanitized = html
            .replace(
              /\s*<link\b(?=[^>]*rel="stylesheet")(?=[^>]*href="data:text\/css,")[^>]*>/g,
              "",
            )
            .replace(/\s*<style>\s*<\/style>/g, "")
            .replace(
              /\sstyle="--sl-icon-size:\s*([^;\"]+);?"/g,
              ' width="$1" height="$1"',
            )
            .replace(/\sstyle="--depth:\s*([^;\"]+);?"/g, ' data-depth="$1"')
            .replace(
              /(<kbd\b[^>]*)\sstyle="display:\s*none;?"([^>]*>)/g,
              "$1$2",
            )
            .replace(
              /(<dialog\b[^>]*)\sstyle="padding:\s*0;?"([^>]*>)/g,
              "$1$2",
            );
          if (sanitized !== html) await writeFile(path, sanitized);
        }
        const pagefindOutput = join(output, "pagefind");
        if (existsSync(pagefindOutput)) {
          for (const name of await readdir(pagefindOutput)) {
            if (extname(name) === ".css") {
              await unlink(join(pagefindOutput, name));
            }
          }
        }
        if (!graph) return;
        for (const asset of graph.assets) {
          if (!asset.sourcePath || !asset.publicPath) continue;
          const target = join(output, asset.publicPath.replace(/^\//, ""));
          await mkdir(dirname(target), { recursive: true });
          await cp(asset.sourcePath, target);
        }
      },
    },
  };
}

function cookbookShikiConfig(
  config: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const transformers = Array.isArray(config?.transformers)
    ? config.transformers
    : [];
  return {
    ...config,
    theme: tastyCodeTheme,
    transformers: transformers.includes(bashPlaceholderTransformer)
      ? transformers
      : [...transformers, bashPlaceholderTransformer],
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
    options.rehypePlugins = plugins;
  } else if (processor.name === "satteri") {
    const options = processor.options as { hastPlugins?: unknown };
    const plugins = Array.isArray(options.hastPlugins)
      ? options.hastPlugins
      : [];
    if (!plugins.includes(satteriMermaid)) plugins.push(satteriMermaid);
    options.hastPlugins = plugins;
  }
}

function stripStarlightStylesPlugin(root: string) {
  const normalizedRoot = root.replaceAll("\\", "/");
  const emptyPrintId = "\0cookbook:empty-starlight-print";
  return {
    name: "cookbook-strip-starlight-css",
    enforce: "pre" as const,
    resolveId(source: string, importer: string | undefined) {
      if (
        importer?.replaceAll("\\", "/").startsWith(`${normalizedRoot}/`) &&
        source.endsWith("/style/print.css?url&no-inline")
      ) {
        return emptyPrintId;
      }
      return undefined;
    },
    load(id: string) {
      if (id === emptyPrintId) return 'export default "data:text/css,";';
      return undefined;
    },
    transform(code: string, id: string) {
      const normalizedId = id.replaceAll("\\", "/");
      if (!normalizedId.startsWith(`${normalizedRoot}/`)) return undefined;
      const [pathname, query = ""] = normalizedId.split("?", 2);
      const isStylesheet = pathname?.endsWith(".css");
      const isAstroStyle =
        pathname?.endsWith(".astro") && query.includes("type=style");
      if (!isStylesheet && !isAstroStyle) return undefined;
      return { code: "", map: null };
    },
  };
}

function starlightContentUrl(route: string, srcDir: URL): URL {
  const slug = route === "/" ? "index" : route.replace(/^\/+|\/+$/g, "");
  return new URL(`content/docs/${slug}.md`, srcDir);
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

function configureTastyTheme(
  theme: DocsConfig["theme"],
  resolved: ReturnType<typeof resolveDocsTheme>,
): void {
  const tokens = tastyTokens(resolved) as ConfigTokens;
  const globalStyles = resolveLegacyAnatomyStyles(theme?.styles);

  configure({
    states: {
      ...cookbookStates,
      ...theme?.states,
    },
    units: TASTY_UNITS,
    tokens,
    presets: resolved.presets as Record<string, TypographyPreset>,
    ...(globalStyles
      ? { globalStyles: globalStyles as Record<string, Styles> }
      : {}),
  });
}

function starlightSidebar(layout: ResolvedNavigationLayout): unknown[] {
  const fallback = layout.items?.length
    ? layout.items.map(starlightSidebarItem)
    : [{ autogenerate: { directory: "" } }];
  if (!layout.sectioned) return fallback;

  return [
    ...(layout.fallbackSidebarGroup !== undefined
      ? [
          {
            label: "Documentation",
            items: (layout.items ?? []).map(starlightSidebarItem),
          },
        ]
      : []),
    ...layout.tabs.flatMap((tab) =>
      tab.items !== undefined
        ? [{ label: tab.label, items: tab.items.map(starlightSidebarItem) }]
        : [],
    ),
  ];
}

function starlightSidebarItem(item: NavigationItem): unknown {
  if (typeof item === "string") return { slug: routeToSlug(item) };
  if ("items" in item) {
    return {
      label: item.label,
      items: item.items.map(starlightSidebarItem),
    };
  }
  if ("autogenerate" in item) {
    return {
      label: item.label,
      items: [
        {
          autogenerate: {
            directory: routeToSlug(item.autogenerate.directory, false),
          },
        },
      ],
    };
  }
  return { label: item.label, link: item.link };
}

function routeToSlug(route: string, rootAsIndex = true): string {
  const slug = route.replace(/^\/+|\/+$/g, "");
  return slug || (rootAsIndex ? "index" : "");
}

export function tastyStarlight(
  config: Parameters<typeof starlight>[0],
): AstroIntegration {
  return starlight(config);
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

function withoutStarlightDocsRoute(
  context: HookParameters<"astro:config:setup">,
): HookParameters<"astro:config:setup"> {
  return new Proxy(context, {
    get(target, property, receiver) {
      if (property !== "injectRoute") {
        return Reflect.get(target, property, receiver);
      }
      return (route: Parameters<typeof context.injectRoute>[0]) => {
        if (route.pattern !== "[...slug]") context.injectRoute(route);
      };
    },
  });
}

function virtualDocsPlugin(
  getContent: () => unknown | Promise<unknown>,
  layout: ResolvedNavigationLayout,
) {
  const configId = "\0virtual:cookbook/config";
  const layoutId = "\0virtual:cookbook/layout";
  return {
    name: "cookbook-data",
    resolveId(id: string) {
      if (id === "virtual:cookbook/config") return configId;
      if (id === "virtual:cookbook/layout") return layoutId;
      return undefined;
    },
    async load(id: string) {
      if (id === configId) {
        return `export const content = ${JSON.stringify(await getContent())};`;
      }
      if (id === layoutId) {
        return `export const layout = ${JSON.stringify(layout)};`;
      }
      return undefined;
    },
  };
}

function hasContentConfig(srcDir: URL): boolean {
  const source = fileURLToPath(srcDir);
  return [
    "content.config.ts",
    "content.config.mts",
    "content.config.js",
    "content.config.mjs",
    "content/config.ts",
  ].some((path) => existsSync(join(source, path)));
}
