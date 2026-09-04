---
title: Cookbook and Starlight
description: Understand which Starlight authoring conventions Cookbook preserves and where its repository and theme model differs.
sidebar:
  order: 5
---

Cookbook uses [Astro Starlight](https://starlight.astro.build/) as its
documentation shell. It keeps familiar page-authoring conventions while adding
repository and npm content sources, stricter validation, and a Tasty/Glaze
theme model.

## Cookbook or Starlight?

Start with the place where the documentation must live. Starlight is a strong
choice when an Astro site owns its content. Cookbook is designed for projects
where the repository Markdown—or the documentation actually published in an
npm package—must remain the source of truth.

| Concern                 | Starlight                                                                          | Cookbook                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Starting point          | Add Starlight to an Astro project and author its documentation content collection. | Add one integration to an Astro project, or generate a complete site directly from a published npm package.                                                                           |
| Content ownership       | The documentation site conventionally owns its Markdown under `src/content/docs/`. | Reads `README.md`, repository `docs/` trees, files outside the Astro app, and selected files from npm artifacts without copying or rewriting them.                                    |
| Reproducible releases   | Follows the dependencies and content committed with the site.                      | Can lock an npm package to its exact resolved version and integrity, then rebuild from the files users actually receive.                                                              |
| Build guarantees        | Provides Starlight's content schema and Astro build pipeline.                      | Adds strict checks for duplicate routes, broken links, missing assets, unsafe paths, and invalid navigation with source-aware diagnostics.                                            |
| Design system           | Supports CSS variables, custom CSS, and component overrides.                       | Exposes the full [Tasty styling DSL](https://tasty.style/docs/dsl) through configuration, with Glaze-generated semantic colors and named style trees for Cookbook and shell surfaces. |
| Familiar authoring      | Defines the Starlight page, navigation, i18n, and frontmatter conventions.         | Preserves those conventions—including splash pages, locales, edit links, and last-updated metadata—while resolving them against each original source.                                 |
| Structural escape hatch | Replaces Starlight components when markup or behavior must change.                 | Supports Astro component overrides for structural changes; visual changes normally stay in typed `theme` configuration.                                                               |

Choose Starlight when the documentation site is the natural home for the
content and its CSS-oriented customization model fits the project. Choose
Cookbook when documentation must stay beside the code, match a published
package, fail strictly when references drift, or expose a reusable design
system entirely through configuration.

## Customize with Tasty's DSL

Cookbook customization is not limited to replacing token values. Every entry
under `theme.styles` is a partial Tasty style object that Cookbook merges into
the component's base style tree. That gives configuration access to the same
responsive values, state maps, calculations, semantic tokens, typography
presets, and named sub-elements used by Cookbook itself:

```ts
export default defineDocsConfig({
  theme: {
    states: {
      "@touch": "@media(pointer: coarse)",
    },
    styles: {
      MarkdownCodeBlock: {
        Pre: {
          padding: {
            "": "2x 4x",
            "@mobile": "1.5x 3x",
          },
          radius: "$card-radius",
        },
        CopyButton: {
          inlineSize: {
            "": "2rem",
            "@touch": "2.5rem",
          },
          scale: {
            "": "1",
            ":active": "0.94",
          },
        },
      },
    },
  },
});
```

The user supplies only overrides; the merge happens inside Cookbook. See
[Theme and components](./theme-and-components.md#style-customization) for the
complete component and sub-element inventory, and the
[Tasty documentation](https://tasty.style/docs) for the DSL's properties and
conditional syntax. Structural Astro overrides remain available when a change
requires different markup or behavior rather than styling.

## Configure the shared capabilities

```ts
export default defineDocsConfig({
  editLink: {
    baseUrl: "https://github.com/example/project/edit/main/",
  },
  lastUpdated: true,
  locales: {
    root: { label: "English", lang: "en" },
    fr: { label: "Français", lang: "fr" },
  },
  defaultLocale: "root",
});
```

The keys deliberately match Starlight so an existing Starlight author does not
need to relearn page metadata or i18n. Cookbook resolves edit and Git metadata
before handing each page to Starlight because its source may live in a root
`docs/` directory, outside the Astro app, or inside a locked npm artifact.

## Create a splash page

```yaml
---
title: Example
template: splash
hero:
  title: Build something clear.
  tagline: A short explanation of the value your project provides.
  actions:
    - text: Get started
      link: /getting-started/
      variant: primary
    - text: View API
      link: /reference/
      variant: secondary
---
```

Use `template: doc` (the default) for conventional reference pages. See
Starlight's [page guide](https://starlight.astro.build/guides/pages/) for the
authoring model Cookbook builds on, then use [Theme and
components](./theme-and-components.md) for Cookbook-specific styling.
