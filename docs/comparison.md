---
title: Compare documentation tools
description: Choose between Cookbook, documentation site builders, hosted docs, and generated API or component references.
sidebar:
  order: 2
---

The useful question is **what should be the source of truth for the site?**
Cookbook is designed for documentation already maintained beside code, including
files shipped in a published npm package. Other tools may be a better fit when
the source is a TypeScript API, component stories, or a managed documentation
platform.

The comparisons below describe each tool's documented starting workflow, not
every integration its users could build. They are a selection of established
options, not a popularity ranking or an exhaustive list.

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

| Tool                                                                                    | Choose it when…                                                                                                            | How the workflow differs                                                                                |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Cookbook**                                                                            | Your repository files or published npm artifact should directly supply the docs.                                           | Astro static output; source graph, strict checks, and npm artifact locking are built in.                |
| [**Starlight**](https://starlight.astro.build/guides/pages/)                            | You want Astro's Starlight docs collection, components, and [plugins](https://starlight.astro.build/reference/plugins/).   | Its normal authoring path is a docs collection. Starlight plugins do not run in Cookbook.               |
| [**Docusaurus**](https://docusaurus.io/docs/docs-introduction)                          | You want React/MDX and its [versioned docs workflow](https://docusaurus.io/docs/versioning).                               | It manages docs in the site and can snapshot them for versions.                                         |
| [**VitePress**](https://vitepress.dev/guide/what-is-vitepress)                          | You want a Markdown site with Vue components and Vite.                                                                     | It builds from a Markdown site tree; Cookbook uses Astro.                                               |
| [**Nextra**](https://nextra.site/docs)                                                  | Your docs belong in a Next.js/React application.                                                                           | It builds on Next.js and MDX; Cookbook uses Astro and its own renderer.                                 |
| [**Material for MkDocs**](https://squidfunk.github.io/mkdocs-material/getting-started/) | You prefer Python, Markdown, and the MkDocs ecosystem.                                                                     | It uses MkDocs and Python; Cookbook uses Node.js and Astro.                                             |
| [**Mintlify**](https://mintlify.com/docs/quickstart)                                    | You want managed deployment, a web editor, or an [API playground](https://mintlify.com/docs/api-playground/openapi-setup). | Cookbook builds a static site for a host you choose and renders OpenAPI as a non-interactive reference. |

These site builders can be extended to ingest other sources. The distinction is
the workflow they provide by default and how much source collection you need to
assemble yourself.

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
interactive OpenAPI client. Its strengths are source-aware prose, validated
links and assets, a reproducible npm artifact input, and a customizable static
site. See [content sources](./content-sources.md) and
[theme and components](./theme-and-components.md) for the supported scope.
