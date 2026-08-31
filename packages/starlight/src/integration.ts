import { existsSync } from "node:fs";
import { cp, mkdir, readFile } from "node:fs/promises";
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
import { resolveDocsTheme } from "./theme/index.js";
import { TASTY_UNITS, tastyTokens } from "./theme/tasty-config.js";

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
  const searchClientPath = fileURLToPath(
    new URL("./client/search.js", import.meta.url),
  );
  const appearanceClientPath = fileURLToPath(
    new URL("./client/appearance.js", import.meta.url),
  );
  const headerPath = fileURLToPath(
    new URL("./overrides/Header.astro", import.meta.url),
  );
  const sidebarPath = fileURLToPath(
    new URL("./overrides/Sidebar.astro", import.meta.url),
  );
  const components = {
    Header: headerPath,
    Sidebar: sidebarPath,
    ...options.config?.components?.overrides,
  };
  const navigation = resolveNavigationLayout(options.config?.navigation);
  // Tasty 3.6's integration shape is structurally compatible with Astro 7;
  // its published helper type still models `site` as URL-only.
  const tasty = tastyIntegration({
    islands: false,
    css: { mode: "extract" },
  }) as unknown as AstroIntegration;
  const starlightIntegration = starlight({
    title: options.config?.site?.title ?? "Documentation",
    ...(options.config?.site?.description
      ? { description: options.config.site.description }
      : {}),
    ...(options.config?.search?.enabled === false ? { pagefind: false } : {}),
    components,
    sidebar: starlightSidebar(navigation),
  });
  let inner: AstroIntegration[] = [tasty, starlightIntegration];
  let projectRoot = options.root;
  let graphConfig = options.config;
  let graph: Awaited<ReturnType<typeof createDocsGraph>> | undefined;
  let usingStarlight = false;

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
        inner = [react, tasty, starlightIntegration];
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
        usingStarlight = hasContentConfig(context.config.srcDir);
        context.updateConfig({
          base,
          output: "static",
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
              virtualDocsPlugin(
                () => ({
                  entries: graph?.entries ?? [],
                  routes: graph?.routes ?? [],
                  site: graph?.config.site ?? options.config?.site ?? {},
                  base: graph?.config.build.base ?? base,
                  search:
                    graph?.config.search.enabled ??
                    options.config?.search?.enabled ??
                    true,
                }),
                navigation,
              ),
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

        if (!usingStarlight) {
          graph = await createDocsGraph({
            root: projectRoot,
            config: graphConfig,
          });
          assertValidDocs(graph);
          if (graph.config.search.enabled) {
            context.injectScript(
              "page",
              `import ${JSON.stringify(searchClientPath)};`,
            );
          }
          context.injectScript(
            "page",
            `import ${JSON.stringify(appearanceClientPath)};`,
          );
          context.injectRoute({
            pattern: "[...route]",
            entrypoint: new URL("./routes/DocsPage.astro", import.meta.url),
            prerender: true,
          });
          return;
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
              context,
            );
          } finally {
            const placeholderIndex =
              context.config.integrations.indexOf(starlightWithPlugins);
            if (placeholderIndex >= 0)
              context.config.integrations.splice(placeholderIndex, 1);
          }
        }
      },
      "astro:config:done": async (context) => {
        await callInner(
          usingStarlight ? inner : inner.slice(0, 2),
          "astro:config:done",
          context,
        );
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
        await callInner(
          usingStarlight ? inner : inner.slice(0, 2),
          "astro:build:start",
          context,
        );
      },
      "astro:build:done": async (context) => {
        await callInner(
          usingStarlight ? inner : inner.slice(0, 2),
          "astro:build:done",
          context,
        );
        if (!graph) return;
        const output = fileURLToPath(context.dir);
        for (const asset of graph.assets) {
          if (!asset.sourcePath || !asset.publicPath) continue;
          const target = join(output, asset.publicPath.replace(/^\//, ""));
          await mkdir(dirname(target), { recursive: true });
          await cp(asset.sourcePath, target);
        }
        if (!usingStarlight && graph.config.search.enabled) {
          const { close, createIndex } = await import("pagefind");
          const created = await createIndex({
            rootSelector: "[data-pagefind-body]",
          });
          if (!created.index || created.errors.length > 0) {
            throw new Error(
              `Pagefind failed to start: ${created.errors.join("; ")}`,
            );
          }
          const indexed = await created.index.addDirectory({ path: output });
          if (indexed.errors.length > 0) {
            throw new Error(
              `Pagefind failed to index the site: ${indexed.errors.join("; ")}`,
            );
          }
          const written = await created.index.writeFiles({
            outputPath: join(output, "pagefind"),
          });
          await close();
          if (written.errors.length > 0) {
            throw new Error(
              `Pagefind failed to write the index: ${written.errors.join("; ")}`,
            );
          }
        }
      },
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

  const globalStyles = anatomyStyles(theme?.styles);
  configure({
    ...(theme?.states ? { states: theme.states } : {}),
    units: TASTY_UNITS,
    tokens,
    presets: resolved.presets as Record<string, TypographyPreset>,
    ...(globalStyles ? { globalStyles } : {}),
  });
}

function anatomyStyles(
  styles: Record<string, unknown> | undefined,
): Record<string, Styles> | undefined {
  if (!styles) return undefined;
  return Object.fromEntries(
    Object.entries(styles)
      .filter((entry): entry is [string, Styles] => isRecord(entry[1]))
      .map(([name, value]) => [`[data-tasty-anatomy="${name}"]`, value]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function virtualDocsPlugin(
  getContent: () => unknown,
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
    load(id: string) {
      if (id === configId) {
        return `export const content = ${JSON.stringify(getContent())};`;
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
