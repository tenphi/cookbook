import { extname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createDocsGraph } from "../graph/index.js";
import { assertValidDocs } from "../validation/index.js";
import type {
  CreateDocsGraphOptions,
  DocsConfig,
  DocsEntry,
} from "../types.js";

export interface DocsLoaderContext {
  store: {
    clear(): void;
    set(entry: {
      id: string;
      data: Record<string, unknown>;
      body: string;
      filePath?: string;
      digest?: string;
      rendered?: RenderedContent;
      assetImports?: string[];
    }): void;
  };
  logger?: { info(message: string): void };
  config?: { root: URL | string; srcDir: URL | string };
  parseData?: (input: {
    id: string;
    data: Record<string, unknown>;
    filePath?: string;
  }) => Promise<Record<string, unknown>>;
  renderMarkdown?: (
    content: string,
    options?: { fileURL?: URL },
  ) => Promise<RenderedContent>;
  generateDigest?: (data: Record<string, unknown> | string) => string;
}

interface RenderedContent {
  html: string;
  metadata?: {
    imagePaths?: string[];
    headings?: Array<{ depth: number; slug: string; text: string }>;
    frontmatter?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export function createDocsLoader(
  config?: DocsConfig,
  options: Omit<CreateDocsGraphOptions, "config"> = {},
) {
  return {
    name: "@tenphi/docs",
    async load(context: DocsLoaderContext): Promise<void> {
      const graph = await createDocsGraph({
        ...options,
        ...(config ? { config } : {}),
      });
      assertValidDocs(graph);
      context.store.clear();
      for (const entry of graph.entries) {
        const loaderEntry = toLoaderEntry(entry);
        const filePath = starlightFilePath(entry, context.config);
        const data = context.parseData
          ? await context.parseData({
              id: loaderEntry.id,
              data: loaderEntry.data,
              filePath,
            })
          : loaderEntry.data;
        const rendered = await context.renderMarkdown?.(entry.transformedBody, {
          fileURL: pathToFileURL(entry.absolutePath),
        });
        context.store.set({
          ...loaderEntry,
          data,
          filePath,
          ...(context.generateDigest
            ? { digest: context.generateDigest(entry.transformedBody) }
            : {}),
          ...(rendered
            ? {
                rendered,
                assetImports: rendered.metadata?.imagePaths ?? [],
              }
            : {}),
        });
      }
      context.logger?.info(`Loaded ${graph.entries.length} Tasty Docs pages.`);
    },
  };
}

function starlightFilePath(
  entry: DocsEntry,
  config?: DocsLoaderContext["config"],
): string {
  const id = entry.route === "/" ? "index" : entry.route.slice(1);
  const extension =
    extname(entry.sourcePath).toLowerCase() === ".mdx" ? ".mdx" : ".md";
  if (!config) return `src/content/docs/${id}${extension}`;

  const root = toPath(config.root);
  const srcDir = toPath(config.srcDir);
  return relative(root, join(srcDir, "content", "docs", `${id}${extension}`))
    .split(sep)
    .join("/");
}

function toPath(value: URL | string): string {
  return typeof value === "string" ? value : fileURLToPath(value);
}

function toLoaderEntry(entry: DocsEntry): {
  id: string;
  data: Record<string, unknown>;
  body: string;
} {
  return {
    id: entry.route === "/" ? "index" : entry.route.slice(1),
    data: {
      title: entry.title,
      draft: entry.frontmatter.draft ?? false,
      ...(entry.description ? { description: entry.description } : {}),
      ...entry.frontmatter,
      tastyDocs: {
        sourcePath: entry.sourcePath,
        route: entry.route,
        headings: entry.headings,
      },
    },
    body: entry.transformedBody,
  };
}

export type { DocsEntry, DocsGraph, DocsRoute, DocsAsset } from "../types.js";
