---
title: Cookbook
description: Build a polished static documentation site from the Markdown your project already owns.
sidebar:
  order: 1
---

Cookbook turns repository Markdown or the documentation shipped in an npm
package into a complete static website. It combines Astro and Starlight with a
theme powered by [Tasty](https://tasty.style) and
[Glaze](https://glaze.tenphi.me), strict content validation, and local Pagefind
search.

<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-labelledby="cookbook-logo-title cookbook-logo-description" style="color: var(--accent-surface-color)">
  <title id="cookbook-logo-title">Cookbook</title>
  <desc id="cookbook-logo-description">An open book in a rounded square.</desc>
  <rect width="64" height="64" rx="14" fill="currentColor"></rect>
  <path fill="#fff" d="M14.8 16c6.7.2 12.3 2 16.7 5.4v28.4c-4.4-3.1-10-4.7-16.6-4.9a3 3 0 0 1-2.9-3V19a3 3 0 0 1 2.8-3Z"></path>
  <path fill="#fff" d="M49.2 16c-6.7.2-12.3 2-16.7 5.4v28.4c4.4-3.1 10-4.7 16.6-4.9a3 3 0 0 0 2.9-3V19a3 3 0 0 0-2.8-3Z"></path>
</svg>

## Why Cookbook

- **Repository-native.** Keep `README.md`, `docs/`, and local assets where they
  already live. Sources are transformed in memory and never rewritten.
- **Package-first.** Generate a reproducible site from the files actually
  published to npm, without cloning the package repository or running its
  lifecycle scripts.
- **Strict by default.** Broken links, missing assets, duplicate routes,
  invalid navigation, and unsafe paths fail the build with source locations.
- **Static first.** Output is prerendered HTML and CSS suitable for GitHub
  Pages and any other static host.
- **Accessible color.** A Glaze-derived theme preserves the authored brand
  color when it is readable and adjusts it when contrast requires it.

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

## This site dogfoods Cookbook

The pages you are reading live in this repository's root `docs/` directory.
The small Astro app under `apps/reference` points the integration and content
loader at the repository root, validates this content, builds the site, and
publishes the result to GitHub Pages. There is no copied documentation tree.

See [Architecture](./architecture.md) for the package boundaries behind the
site.
