---
title: Cookbook
description: Build a static Astro documentation site from your repository or a published npm package, with a theme that fits your product.
template: splash
seo:
  title: Cookbook — docs that stay with the code and fit your product
hero:
  title: Documentation that stays with the code.
  tagline: Build a static Astro docs site from repository Markdown or a locked npm package, then shape its colors, typography, and components to fit your product.
  image:
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="176" height="176" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/><path fill="#fff" d="M14.8 16c6.7.2 12.3 2 16.7 5.4v28.4c-4.4-3.1-10-4.7-16.6-4.9a3 3 0 0 1-2.9-3V19a3 3 0 0 1 2.8-3Z"/><path fill="#fff" d="M49.2 16c-6.7.2-12.3 2-16.7 5.4v28.4c4.4-3.1 10-4.7 16.6-4.9a3 3 0 0 0 2.9-3V19a3 3 0 0 0-2.8-3Z"/></svg>'
  actions:
    - text: Get started
      link: /getting-started/
      variant: primary
    - text: Compare tools
      link: /comparison/
      variant: secondary
sidebar:
  order: 1
---

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

## Content and design on your terms

### Keep the source where it belongs

Use a repository's Markdown and local assets without copying them into an Astro
content tree. Cookbook can also read OpenAPI specs or the documentation inside an
npm artifact pinned to its exact version and integrity.
[Explore content sources](./content-sources.md).

### Shape the site through configuration

Start with a brand color, then configure semantic palettes, fonts, typography,
and named component parts through [Tasty](https://tasty.style) and
[Glaze](https://glaze.tenphi.me). Partial `theme.styles` overrides merge with
Cookbook's defaults before CSS extraction, so the browser receives static CSS.
[Explore the theme](./theme-and-components.md).

### Catch drift before publishing

Broken links, missing assets, duplicate routes, and invalid navigation fail with
source-aware errors. The result is prerendered HTML with local search, ready for
any static host. [See the validation workflow](./quality-checks.md).

## Explore the guide

- [Getting started](./getting-started.md) covers repositories, npm packages, and
  existing Astro projects.
- [Compare documentation tools](./comparison.md) explains Cookbook's content and
  customization model alongside other options.
- [Working examples](./examples.md) show repository, monorepo, package, and
  shared-theme configurations.
- [Authoring](./authoring.mdx) covers pages, components, and interactive examples.
- [Deployment](./deployment.md) covers validation and static hosting.

For agent-assisted setup, see the [AI agent workflow](./ai-agents.md). The
[configuration reference](./configuration.md), [publishing controls](./publishing.md),
and [CLI reference](./cli.md) cover the full set of options.
