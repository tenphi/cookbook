---
title: Cookbook
description: Build a polished static documentation site from the Markdown your project already owns.
sidebar:
  order: 1
---

Cookbook turns repository Markdown or the documentation shipped in an npm
package into a complete static website. It combines Astro and Starlight with a
Tasty/Glaze theme, strict content validation, and local Pagefind search.

![Cookbook mark](./assets/mark.svg)

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
