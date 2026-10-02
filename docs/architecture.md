---
title: Architecture
description: Understand the four packages and the static content pipeline behind Cookbook.
sidebar:
  order: 8
---

Cookbook keeps content concerns separate from rendering so another renderer
can consume the same validated graph in the future.

Cookbook's early documentation experience was inspired by
[Astro Starlight](https://starlight.astro.build/). Its current renderer is
maintained in this repository.

## Packages

| Package                   | Responsibility                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `@tenphi/create-cookbook` | Inspect an npm artifact and scaffold a reproducible documentation project                               |
| `@tenphi/cookbook`        | Provide the memorable Astro integration, public config exports, and CLI                                 |
| `@tenphi/docs`            | Discover sources, resolve packages, build the content graph, transform Markdown, and report diagnostics |
| `@tenphi/renderer`        | Render the graph with Astro and provide the Tasty/Glaze theme, components, search, and static assets    |

The `@tenphi/cookbook` default export represents the complete product. Consumers do
not compose renderer internals themselves.

## Build pipeline

1. Validate and normalize the configuration.
2. Collect local and locked package sources.
3. Assign canonical routes to every document.
4. Parse Markdown and collect headings, links, and assets.
5. Rewrite internal references through the completed route graph.
6. Reject unsafe paths and report strict diagnostics.
7. Render static pages through Astro and Cookbook components.
8. Copy content-hashed assets and build the local Pagefind index.

Source documents are read-only throughout this process. The transformed body
exists in the in-memory graph and the renderer's virtual module; a build never
rewrites the repository Markdown.

## Theme pipeline

Theme resolution has three deliberately separate layers:

1. Glaze resolves semantic palette inputs into light, dark, and high-contrast
   colors.
2. The Glaze values, design tokens, typography presets, states, and units are
   registered directly with Tasty.
3. Cookbook interface components use `tasty()` roots. Component-owned Tasty
   bridges style generated Markdown and syntax markup. Search owns a styled
   results root whose named descendants cover Pagefind's dynamic content.

The palette owns color relationships. Components never choose raw light/dark
colors, and shape tokens never contain palette logic. This keeps a palette
change, a density change, and a typography change independent. Astro runs
Tasty in extract mode, so these runtime style calls become a shared static CSS
asset during the build; no Tasty styling runtime ships to the browser.

## Component ownership

Each built-in component has an owning `components/<Name>.styles.js` module
with its complete base style tree and named sub-elements. Its Astro markup
imports that definition directly. Rendered roots use
`defineComponent(name, options)` to apply partial `theme.styles`
overrides before extraction. Existing configuration names and sub-element
lists remain the public customization contract.

Use `extendComponent(name, base, options)` for derived roots. `Button`
owns shared button defaults; `SearchButton` and `MobileMenuToggle` extend it
with their own layout and named anatomy. Base theme overrides are inherited,
then the descendant's styles and theme overrides take precedence. Keep shared
bases configurable and document their names and complete sub-element lists.

The page shell owns fonts, document defaults, heading presets, and root layout
variables. These foundations initialize during every page render, including
404 pages, independently of replaceable Header and Head components. Layout
roots own frame positioning; the components inside them own their contents.

`useGlobalStyles()` is reserved for document foundations and generated-content
bridges, each using `resolveComponentStyles(name, baseStyles)`. MarkdownContent
collects its prose, code, table, heading, alert, and Mermaid bridges during
rendering. Generated prose retains its established selector scope and
specificity so partial theme overrides and styled components inside Markdown
continue to compose. CodeGroup collects its code and syntax bridges itself,
including when rendered outside MarkdownContent.

Optional browser behavior remains in `src/client/` and imports no styling
modules. Custom elements attach behavior to the server-rendered markup.
The ownership checks verify every public style name and sub-element, while
consumer and browser tests exercise theme overrides and component replacements.

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
diagnostics without importing the renderer.

## Reference app

The monorepo's `apps/reference` project is both the deployed documentation site
and an end-to-end fixture. Its integration discovers `docs.config.ts`, whose
`root: "../.."` loads this `docs/` tree through the same route pipeline used by
convention-mode sites. CI builds the same app before GitHub Pages publishes it.

Return to [Cookbook](./index.md) or inspect the
[repository](https://github.com/tenphi/cookbook).
