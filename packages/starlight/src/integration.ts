import { existsSync } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import starlight from "./starlight-runtime.js";
import {
  createDocsGraph,
  assertValidDocs,
  type DocsConfig,
  type NavigationItem,
} from "@tenphi/docs";
import { tastyIntegration } from "@tenphi/tasty/ssr/astro";
import type { AstroIntegration, HookParameters } from "astro";
import { resolveDocsTheme } from "./theme/index.js";

const packageRequire = createRequire(import.meta.url);
const starlightRoot = dirname(packageRequire.resolve("@astrojs/starlight"));
const tastyStaticMiddleware = packageRequire.resolve(
  "@tenphi/tasty/ssr/astro-middleware-static",
);

export interface TastyDocsOptions {
  config?: DocsConfig;
  root?: string;
}

export default function tastyDocs(
  options: TastyDocsOptions = {},
): AstroIntegration {
  const docsTheme = resolveDocsTheme(options.config?.theme);
  if (
    docsTheme.diagnostics.some((diagnostic) => diagnostic.severity === "error")
  ) {
    throw new Error(
      docsTheme.diagnostics.map((diagnostic) => diagnostic.message).join("\n"),
    );
  }
  const cssPath = fileURLToPath(new URL("./styles.css", import.meta.url));
  const searchClientPath = fileURLToPath(
    new URL("./client/search.js", import.meta.url),
  );
  const appearanceClientPath = fileURLToPath(
    new URL("./client/appearance.js", import.meta.url),
  );
  const inner = [
    tastyIntegration({ islands: false }),
    starlight({
      title: options.config?.site?.title ?? "Documentation",
      ...(options.config?.site?.description
        ? { description: options.config.site.description }
        : {}),
      customCss: ["virtual:tasty-docs/theme.css", cssPath],
      ...(options.config?.search?.enabled === false ? { pagefind: false } : {}),
      ...(options.config?.components?.overrides
        ? { components: options.config.components.overrides }
        : {}),
      sidebar: starlightSidebar(options.config?.navigation),
    }),
  ] satisfies AstroIntegration[];
  let projectRoot = options.root;
  let graphConfig = options.config;
  let graph: Awaited<ReturnType<typeof createDocsGraph>> | undefined;
  let usingStarlight = false;

  return {
    name: "tasty-docs",
    hooks: {
      "astro:config:setup": async (context) => {
        if (
          context.config.integrations.some(
            (integration) => integration.name === "@astrojs/starlight",
          )
        ) {
          throw new Error(
            "Tasty Docs already includes Starlight. Remove the direct @astrojs/starlight integration before continuing.",
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
              external: ["@tenphi/docs"],
            },
            plugins: [
              virtualDocsPlugin(docsTheme.css, () => ({
                entries: graph?.entries ?? [],
                routes: graph?.routes ?? [],
                site: graph?.config.site ?? options.config?.site ?? {},
                base: graph?.config.build.base ?? base,
                search:
                  graph?.config.search.enabled ??
                  options.config?.search?.enabled ??
                  true,
              })),
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
              ],
            },
          },
        });
        await callInner(inner.slice(0, 1), "astro:config:setup", context);

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
        const starlightIntegration = inner[1];
        if (starlightIntegration) {
          const selfIndex = context.config.integrations.findIndex(
            (integration) => integration.name === "tasty-docs",
          );
          context.config.integrations.splice(
            selfIndex + 1,
            0,
            starlightIntegration,
          );
          try {
            await callInner(
              [starlightIntegration],
              "astro:config:setup",
              context,
            );
          } finally {
            const placeholderIndex =
              context.config.integrations.indexOf(starlightIntegration);
            if (placeholderIndex >= 0)
              context.config.integrations.splice(placeholderIndex, 1);
          }
        }
      },
      "astro:config:done": async (context) => {
        await callInner(
          usingStarlight ? inner : inner.slice(0, 1),
          "astro:config:done",
          context,
        );
      },
      "astro:build:start": async (context) => {
        if (!graph) {
          graph = await createDocsGraph({
            ...(projectRoot ? { root: projectRoot } : {}),
            ...(graphConfig ? { config: graphConfig } : {}),
          });
          assertValidDocs(graph);
        }
        await callInner(
          usingStarlight ? inner : inner.slice(0, 1),
          "astro:build:start",
          context,
        );
      },
      "astro:build:done": async (context) => {
        await callInner(
          usingStarlight ? inner : inner.slice(0, 1),
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

function starlightSidebar(navigation: DocsConfig["navigation"]): unknown[] {
  const items = Array.isArray(navigation) ? navigation : navigation?.items;
  if (!items?.length) {
    return [
      {
        label: "Documentation",
        items: [{ autogenerate: { directory: "" } }],
      },
    ];
  }
  return items.map(starlightSidebarItem);
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

function virtualDocsPlugin(css: string, getContent: () => unknown) {
  const themeId = "\0virtual:tasty-docs/theme.css";
  const configId = "\0virtual:tasty-docs/config";
  return {
    name: "tasty-docs-theme",
    resolveId(id: string) {
      if (id === "virtual:tasty-docs/theme.css") return themeId;
      if (id === "virtual:tasty-docs/config") return configId;
      return undefined;
    },
    load(id: string) {
      if (id === themeId) return css;
      if (id === configId) {
        return `export const content = ${JSON.stringify(getContent())};`;
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
