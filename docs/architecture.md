---
title: Architecture
description: Understand the four packages and the static content pipeline behind Tasty Docs.
sidebar:
  order: 8
---

Tasty Docs keeps content concerns separate from rendering so another renderer
can consume the same validated graph in the future.

## Packages

| Package             | Responsibility                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `create-tasty-docs` | Inspect an npm artifact and scaffold a reproducible documentation project                                   |
| `tasty-docs`        | Provide the memorable Astro integration, public config exports, and CLI                                     |
| `@tenphi/docs`      | Discover sources, resolve packages, build the content graph, transform Markdown, and report diagnostics     |
| `@tenphi/starlight` | Adapt the graph to Astro/Starlight and provide the Tasty/Glaze theme, components, search, and static assets |

The `tasty-docs` default export represents the complete product. Consumers do
not compose Starlight or renderer internals themselves.

## Build pipeline

1. Validate and normalize the configuration.
2. Collect local and locked package sources.
3. Assign canonical routes to every document.
4. Parse Markdown and collect headings, links, and assets.
5. Rewrite internal references through the completed route graph.
6. Reject unsafe paths and report strict diagnostics.
7. Render static pages through Astro and Starlight.
8. Copy content-hashed assets and build the local Pagefind index.

Source documents are read-only throughout this process. The transformed body
exists in the in-memory graph and Astro content store; a build never rewrites
the repository Markdown.

## Theme pipeline

Theme resolution has three deliberately separate layers:

1. Glaze resolves semantic palette inputs into light, dark, and high-contrast
   colors.
2. Stable design tokens and typography presets resolve into shared CSS custom
   properties.
3. The renderer maps those public properties onto Starlight internals and the
   standalone shell; Tasty SSR receives the same token and preset definitions
   for custom components.

The palette owns color relationships. Components never choose raw light/dark
colors, and shape tokens never contain palette logic. This keeps a palette
change, a density change, and a typography change independent. The final CSS
layer is ordered after Starlight's layers so public tokens consistently win
without selector-specificity tricks.

## Public graph API

Renderer and tooling authors can work directly with `@tenphi/docs`:

```ts
import {
  assertValidDocs,
  createDocsGraph,
  defineDocsConfig,
} from "@tenphi/docs";

const config = defineDocsConfig({
  content: {
    sources: [{ glob: "docs/**/*.md", base: "docs" }],
  },
});

const graph = await createDocsGraph({ root: process.cwd(), config });
assertValidDocs(graph);

for (const route of graph.routes) {
  console.log(route.route, route.sourcePath);
}
```

The graph exposes normalized entries, routes, assets, and structured
diagnostics without importing Starlight.

## Reference app

The monorepo's `apps/reference` project is both the deployed documentation site
and an end-to-end fixture. Its integration and Starlight content loader receive
the repository root explicitly, then load this `docs/` tree. CI builds the same
app before GitHub Pages publishes it.

Return to [Tasty Docs](./index.md) or inspect the
[repository](https://github.com/tenphi/tasty-docs).
