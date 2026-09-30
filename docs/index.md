---
title: Cookbook
description: Build a static Astro documentation site from your repository or a published npm package, with a theme that fits your product.
template: splash
seo:
  title: Cookbook — docs that stay with the code and fit your product
hero:
  title: Documentation that stays with the code.
  tagline: Cookbook is an Astro documentation toolkit. Turn your repository Markdown or a published npm package into a searchable static site, with colors, typography, and components that fit your product.
  image:
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/><path fill="#fff" d="M14.8 16c6.7.2 12.3 2 16.7 5.4v28.4c-4.4-3.1-10-4.7-16.6-4.9a3 3 0 0 1-2.9-3V19a3 3 0 0 1 2.8-3Z"/><path fill="#fff" d="M49.2 16c-6.7.2-12.3 2-16.7 5.4v28.4c4.4-3.1 10-4.7 16.6-4.9a3 3 0 0 0 2.9-3V19a3 3 0 0 0-2.8-3Z"/></svg>'
  actions:
    - text: Get started
      link: /getting-started/
      variant: primary
    - text: Compare tools
      link: /comparison/
      variant: secondary
sidebar:
  label: Overview
  order: 1
---

## What you get

- **Use the docs you already have.** Read Markdown, MDX, and local assets
  directly from your repository, or build from an npm package locked to an exact
  version and integrity. [Content sources](./content-sources.md).
- **Generate an API reference.** Turn a local OpenAPI spec into a searchable
  overview and a page for each operation, with parameters, request bodies,
  responses, and examples. [OpenAPI references](./content-sources.md#openapi-references).
- **Search built in.** Pagefind indexes your pages and headings locally, with a
  keyboard shortcut and search assets that load when needed.
  [Search](./site-navigation.md#search).
- **Navigation for growing docs.** Organize sections with tabs and grouped
  sidebars, add page contents and previous/next links, and give mobile readers a
  navigation drawer. [Search and navigation](./site-navigation.md).
- **Components for technical writing.** Use tabs, callouts, cards, steps, code
  groups, highlighted code with copy controls, and sandboxed interactive
  previews in MDX. [Authoring components](./authoring.mdx).
- **A theme that fits your product.** Configure brand colors, semantic palettes,
  fonts, typography, and individual component parts through [Tasty](https://tasty.style) and [Glaze](https://glaze.tenphi.me).
  Light, dark, and high-contrast appearances receive static CSS generated at
  build time. [Theme and components](./theme-and-components.md).
- **Languages and versions.** Offer translated pages and versioned docs, with
  selectors that take readers to the equivalent page when available.
  [Languages and versions](./site-navigation.md#contents-languages-and-versions).
- **Checks before you ship.** Catch broken links, missing assets, duplicate
  routes, and invalid navigation with errors that point to the source. Publish
  prerendered HTML to any static host. [Quality checks](./quality-checks.md).
- **Pages ready to share and read.** Publish canonical URLs, social previews,
  sitemaps, downloadable Markdown, and an `llms.txt` index for coding agents.
  [Publishing metadata](./publishing.md).

## Start with your repository

Run this from a project that already has a `README.md` or `docs/` directory:

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

Cookbook reads those files where they live. You can also
[start a new site](./getting-started.md#create-your-first-site),
[document the exact files published to npm](./getting-started.md#document-a-published-npm-package),
or [add Cookbook to an Astro project](./getting-started.md#add-to-an-existing-astro-project).

## This site is the example

The page you're reading comes from this repository's
[docs/index.md](https://github.com/tenphi/cookbook/blob/main/docs/index.md).
A small [Astro app](https://github.com/tenphi/cookbook/tree/main/apps/reference)
builds directly from the root `docs/` directory. Its navigation, search, code
controls, edit links, and Git timestamps are available to every Cookbook site.
Use the language selector in the header to read this page and the getting-started
guide in Spanish, Russian, Japanese, or Simplified Chinese. Other guides remain
in English for now.

## Explore the guide

- [Getting started](./getting-started.md) covers repositories, npm packages, and
  existing Astro projects.
- [Compare documentation tools](./comparison.md) explains Cookbook's content and
  customization model alongside other options.
- [Working examples](./examples.md) show repository, monorepo, package, and
  shared-theme configurations.
- [Search and navigation](./site-navigation.md) explains how readers find pages.
- [Authoring](./authoring.mdx) covers pages, components, and interactive examples.
- [Theme and components](./theme-and-components.md) starts with brand and tokens,
  then points to fonts, built-in styles, and custom components.
- [Deployment](./deployment.md) covers validation and static hosting.

For agent-assisted setup, see the [AI agent workflow](./ai-agents.md). The
[configuration reference](./configuration.md), [publishing controls](./publishing.md),
and [CLI reference](./cli.md) cover the full set of options.
