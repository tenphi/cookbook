---
title: Compare documentation tools
description: Choose between Cookbook, documentation site builders, hosted docs, and generated API or component references.
sidebar:
  order: 2
---

Two choices shape a documentation site: **how closely it should follow your
product's design system** and **where its content comes from**. Cookbook was
built for both. Its theme is configurable down to named component parts, and
its content can come from existing repository files or a published npm package.
Turning Markdown into pages is only one part of that workflow.

The comparisons below describe each tool's documented starting workflow, not
every integration its users could build. They are a selection of established
options, not a popularity ranking or an exhaustive list.

## Why choose Cookbook for customization?

Cookbook treats appearance as a supported configuration surface rather than a
set of selectors to override after rendering:

- Set one `theme.brand` color or define semantic `theme.palette` roles. Glaze
  resolves them for light, dark, normal, and high-contrast modes, with contrast
  targets and diagnostics.
- Configure shared `theme.tokens`, font roles, typography `theme.presets`, and
  responsive `theme.states` once. Components consume those roles consistently.
- Change a built-in component through a **partial**
  `theme.styles.<ComponentName>` Tasty object. Cookbook merges it into the full
  base style before extracting CSS. Its [named component parts](./theme-and-components.md#style-customization)
  are published so a header title, search field, or sidebar item can be changed
  without copying an entire component.
- Add a styled component with `defineComponent()` or replace markup and behavior
  through an Astro component override when the supported anatomy is not enough.
  Tasty and Glaze run during the build; the browser receives static CSS, not
  their styling runtimes.

For example, this changes the brand, a shared radius, heading typography, and
one part of the header while keeping the other default component styles:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  theme: {
    brand: { from: "#315efb" },
    tokens: { $radius: "10px" },
    presets: { heading: { fontWeight: 650 } },
    styles: { Header: { SiteTitle: { preset: "h4 / strong" } } },
  },
});
```

This style contract is specific to Cookbook's Tasty and Glaze system. Structural
changes still require an Astro override. Read the [customization rules](./customization-rules.md)
and [theme reference](./theme-and-components.md) for the supported names and
the full design-system API.

## Start with the material you have

- **A repository `README.md` and `docs/` tree:** Start with
  [Cookbook](./getting-started.md), [Starlight](https://starlight.astro.build/getting-started/),
  [VitePress](https://vitepress.dev/guide/getting-started), or another site
  builder. Choose the framework and editing workflow you prefer; Cookbook can
  read the existing files in place.
- **Markdown inside a published npm package:**
  [Cookbook's package source](./content-sources.md#npm-package-sources) reads
  the published artifact, pins its version and integrity, and builds without
  installing that package.
- **TypeScript exports and code comments:** [TypeDoc](https://typedoc.org/index.html)
  generates reference pages from the code model and can use package entry
  points.
- **UI components and their stories:** [Storybook Autodocs](https://storybook.js.org/docs/writing-docs)
  documents components alongside rendered stories.
- **An OpenAPI specification:** Choose [Cookbook's static reference](./content-sources.md#openapi-references)
  or a tool with an [interactive API playground](https://mintlify.com/docs/api-playground/overview)
  if readers need to make requests from the docs.

## Compare complete documentation sites

All of these tools support visual customization. Their default content and
styling contracts differ:

| Tool and usual source                                                                                                                                  | Documented customization path                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cookbook** — Astro site reading repository paths, locked npm artifacts, or local OpenAPI.                                                            | Semantic Glaze palette, Tasty tokens and presets, partial named component styles, and Astro overrides; extracted static CSS.                                                                                  |
| [**Starlight**](https://starlight.astro.build/guides/pages/) — Astro docs collection with [plugins](https://starlight.astro.build/reference/plugins/). | [CSS variables, custom CSS or Tailwind](https://starlight.astro.build/guides/css-and-tailwind/), themes, and component overrides.                                                                             |
| [**Docusaurus**](https://docusaurus.io/docs/docs-introduction) — React/MDX docs with [version snapshots](https://docusaurus.io/docs/versioning).       | [Infima variables and custom CSS](https://docusaurus.io/docs/styling-layout), plus [swizzled React components](https://docusaurus.io/docs/swizzling).                                                         |
| [**VitePress**](https://vitepress.dev/guide/what-is-vitepress) — Markdown site with Vue components.                                                    | [Theme config, CSS variables, Vue layout slots, or a custom theme](https://vitepress.dev/guide/extending-default-theme).                                                                                      |
| [**Nextra**](https://nextra.site/docs) — Next.js/React site with Markdown and MDX.                                                                     | [Next.js CSS](https://nextra.site/docs/guide/custom-css) or a [custom React theme](https://nextra.site/docs/custom-theme).                                                                                    |
| [**Material for MkDocs**](https://squidfunk.github.io/mkdocs-material/getting-started/) — Python/MkDocs site with Markdown.                            | [Palette settings and CSS variables](https://squidfunk.github.io/mkdocs-material/setup/changing-the-colors/), [extra CSS and template overrides](https://squidfunk.github.io/mkdocs-material/customization/). |
| [**Mintlify**](https://mintlify.com/docs/quickstart) — Managed MDX and OpenAPI site with Git-connected deployment and a web editor.                    | [Prebuilt themes](https://mintlify.com/docs/themes), configuration for colors and fonts, and visual editing.                                                                                                  |

The table compares documented approaches, not a ceiling on what each tool can
do. Choose the styling model you want to maintain. Cookbook's model is useful
when brand, typography, semantic colors, and component anatomy must move
together across the whole site. Starlight, Docusaurus, VitePress, Nextra, and
Material for MkDocs provide their own routes to theme or component changes;
Mintlify provides a managed editing and hosting workflow. Cookbook requires an
Astro build and a host for its static output. Starlight plugins target its own
APIs and do not run in Cookbook; see [Cookbook extensions](./plugins.md).

## When the package _is_ the source

“Package to website” can mean two different jobs:

1. **Publish the prose included in an npm release.** Cookbook reads the actual
   tarball's selected `README.md` and Markdown files. Package MDX requires an
   explicit trust opt-in before its code can run. `cookbook update`
   records the requested specifier, resolved version, and integrity in
   `cookbook.lock.json`; a production build uses that lock. This is useful when
   the docs site should describe exactly what package consumers received. See
   [package sources](./content-sources.md#npm-package-sources) and the
   [package quick start](./getting-started.md#document-a-published-npm-package).
2. **Generate reference pages from source code.** [TypeDoc](https://typedoc.org/index.html)
   reads TypeScript exports and comments, including entry points discovered
   from `package.json`, and emits an HTML or JSON reference. It is the direct
   choice when exported types and signatures are the documentation.

For a component library, [Storybook](https://storybook.js.org/docs/writing-docs)
is a separate option when the main experience should be runnable component
examples. TypeDoc or Storybook can complement a guide site; link to their output
from Cookbook navigation when each serves a different reader need.

Cookbook does not extract API signatures from TypeScript or provide an
interactive OpenAPI client. Its strengths are design system customization,
source-aware prose, validated links and assets, and a reproducible npm artifact
input. See [content sources](./content-sources.md) and
[theme and components](./theme-and-components.md) for the supported scope.
