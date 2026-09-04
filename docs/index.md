---
title: Cookbook
description: Build a polished static documentation site from the Markdown your project already owns.
template: splash
hero:
  title: Documentation that stays with the code.
  tagline: Turn repository Markdown or a locked npm package into a polished, searchable Astro site—without creating a second source of truth.
  image:
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/><path fill="#fff" d="M14.8 16c6.7.2 12.3 2 16.7 5.4v28.4c-4.4-3.1-10-4.7-16.6-4.9a3 3 0 0 1-2.9-3V19a3 3 0 0 1 2.8-3Z"/><path fill="#fff" d="M49.2 16c-6.7.2-12.3 2-16.7 5.4v28.4c4.4-3.1 10-4.7 16.6-4.9a3 3 0 0 0 2.9-3V19a3 3 0 0 0-2.8-3Z"/></svg>'
  actions:
    - text: Get started
      link: /getting-started/
      variant: primary
    - text: See how it compares
      link: /starlight-comparison/
      variant: secondary
sidebar:
  order: 1
---

## Keep documentation close to its source

Cookbook combines [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build) with repository-aware content,
strict validation, local Pagefind search, and a theme powered by
[Tasty](https://tasty.style) and [Glaze](https://glaze.tenphi.me).

### Repository-native

Keep `README.md`, `docs/`, and local assets where they already live. Cookbook
transforms sources in memory and never rewrites them.

### Package-first

Build a reproducible site from the files actually published to npm—without
cloning the package repository or running its lifecycle scripts.

### Strict and static

Broken links, missing assets, duplicate routes, invalid navigation, and unsafe
paths fail with source locations. The result is prerendered HTML and CSS ready
for GitHub Pages or any static host.

## Choose a path

Create a documentation project from a published npm package:

```sh
npm create @tenphi/cookbook@latest my-package-docs -- --package your-package
```

Or add the complete integration to an Astro project:

```sh
npx astro add @tenphi/cookbook
```

Continue with [Getting started](./getting-started.md), then learn how
[content sources](./content-sources.md) become routes.

## See the product, not a mock-up

The pages you are reading live in this repository's root `docs/` directory.
The small Astro app under `apps/reference` points the integration and content
loader at the repository root, validates this content, builds the site, and
publishes the result to GitHub Pages. There is no copied documentation tree.

This homepage also uses Cookbook's public `template: splash` and `hero`
frontmatter. The heading permalinks, code-copy controls, edit links, and Git
timestamps throughout the guide are the same capabilities available to every
Cookbook site.

See [Architecture](./architecture.md) for the package boundaries behind the
site.
