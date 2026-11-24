---
title: Working examples
description: Complete configurations for repositories, monorepos, npm content, languages, and preview sites.
sidebar:
  order: 3
---

These are complete `docs.config.ts` files for common content layouts. For
branding, component styles, fonts, and shared themes, see the
[theme recipes](./recipes.md). Cookbook's test suite type-checks and builds the
local repository, languages, and preview examples.

Each example uses the same Astro integration:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

## Local repository

Put this in `docs.config.ts` at the repository root. README/docs discovery is
automatic; add `content.sources` only when you need different routes or files.

```ts cookbook-verify=minimal
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ site: { title: "My library" } });
```

Run `npx @tenphi/cookbook doctor`, then `npx astro dev` or `npx astro build`.

## Monorepo with two packages

For an app in `apps/docs/`, resolve content from the repository, then give each
package source an ID, a root, and a route mount. The repository README is the
home page, which the site title in the header links to:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  root: "../..",
  site: { title: "SDK documentation" },
  content: {
    sources: [
      { file: "README.md", route: "/" },
      {
        id: "api",
        root: "packages/api",
        glob: "**/*.md",
        exclude: ["node_modules/**", "dist/**", "CHANGELOG.md"],
        routeBase: "/api",
      },
      {
        id: "ui",
        root: "packages/ui",
        glob: "**/*.md",
        exclude: ["node_modules/**", "dist/**", "CHANGELOG.md"],
        routeBase: "/ui",
      },
    ],
  },
});
```

List each package's dependencies, build output, and changelog in `exclude`, or
the glob collects them too. Use `source:ui/README.md` to link to the UI package.
See
[source identities and repeated mounts](./content-sources.md#source-identities-and-repeated-mounts)
for how links and slugs resolve between sources.

## Locked npm documentation

The site's own `README.md` is the home page, which the site title in the header
links to. The package's pages start at `/api`:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: { title: "Published API" },
  content: {
    sources: [
      { file: "README.md", route: "/" },
      { id: "api", package: "@scope/package@^2", routeBase: "/api" },
    ],
  },
});
```

Run `npx @tenphi/cookbook update` once, commit `cookbook.lock.json`, then run
`npx @tenphi/cookbook doctor` and `npx astro build`. When changing `^2` to `^3`,
run update again. A stale lock fails with instructions instead of rendering the
old version. To read the package from another registry, set
[`registry`](./content-sources.md#npm-package-sources).

## English and French

Create `docs/index.md`, `docs/guide.md`, `docs/fr/index.md`, and
`docs/fr/guide.md`. Routes are `/`, `/guide`, `/fr`, and `/fr/guide`.

```ts cookbook-verify=locales
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: { title: "Acme docs", url: "https://docs.example.com" },
  content: { sources: [{ glob: "docs/**/*.md", base: "docs" }] },
  locales: {
    root: { label: "English", lang: "en" },
    fr: { label: "Français" },
  },
  defaultLocale: "root",
  navigation: ["/", "/guide"],
  translations: { fr: { appearance: "Présentation" } },
});
```

Navigation lists the pages of the current language. When a page has no
translation, the language picker links to the default-language page instead;
Cookbook creates no copy of the page and no alternate-language link for it. See
[languages and versions](./site-navigation.md#contents-languages-and-versions),
[languages](./configuration.md#languages), and
[translations](./configuration.md#translations).

## Preview publishing

A preview keeps the production `url`, so its canonical links point to the
production site. Serve it from another host, behind host authentication when it
is private. `index: false` adds `noindex` to every page:

```ts cookbook-verify=preview
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Acme",
    url: "https://docs.example.com",
    seo: { index: false, copyPage: false },
  },
});
```

`copyPage: false` removes the pages' Markdown copies, which the HTML `noindex`
does not cover. Use it on hosts that cannot send a `noindex` header. Build the
site, run `npx @tenphi/cookbook check-build`, deploy that output, then run
`npx @tenphi/cookbook check-build --url https://preview.example.com/`. See
[publishing metadata](./publishing.md) for previews, indexing, and Markdown
copies, and [troubleshooting](./troubleshooting.md) when a check fails.
