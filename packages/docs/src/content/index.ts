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
    }): void;
  };
  logger?: { info(message: string): void };
  parseData?: (input: {
    id: string;
    data: Record<string, unknown>;
    filePath?: string;
  }) => Promise<Record<string, unknown>>;
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
        const data = context.parseData
          ? await context.parseData({
              id: loaderEntry.id,
              data: loaderEntry.data,
              filePath: entry.sourcePath,
            })
          : loaderEntry.data;
        context.store.set({
          ...loaderEntry,
          data,
          filePath: entry.sourcePath,
        });
      }
      context.logger?.info(`Loaded ${graph.entries.length} Tasty Docs pages.`);
    },
  };
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
