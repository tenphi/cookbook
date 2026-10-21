---
title: Working examples
description: Complete configurations for repositories, monorepos, npm content, languages, and preview sites.
sidebar:
  order: 3
---

These are complete `docs.config.ts` files for common content layouts. For
branding, component styles, fonts, and shared themes, see the
[theme recipes](./recipes.md). Every example marked for verification is
type-checked and built by Cookbook's test suite.

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

Run `cookbook doctor`, then `astro dev` or `astro build`.

## Monorepo with two packages

For an app in `apps/docs/`, resolve content from the repository, then give each
source an ID, a root, and a route mount:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  root: "../..",
  site: { title: "SDK documentation" },
  content: {
    sources: [
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

Glob sources skip only paths beginning with `_` and the declared `exclude`
patterns, so exclude each package's dependencies, build output, and changelog.
Use `source:ui/README.md` for an explicit link to the UI package. Ordinary
relative links stay in their own source mount when the same file appears in
several mounts. A frontmatter `slug`, even one starting with `/`, is appended
to that source's `routeBase`.

## Locked npm documentation

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: { title: "Published API" },
  content: {
    sources: [{ id: "api", package: "@scope/package@^2", routeBase: "/api" }],
  },
});
```

Run `cookbook update` once, commit `cookbook.lock.json`, then run `cookbook doctor`
and `astro build`. When changing `^2` to `^3`, run update again. A stale lock fails
with instructions instead of rendering the old version.

A package source can specify `registry` for an alternative registry. The default
is the npm public registry. Keep credentials out of committed configuration.

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

Navigation adapts to real translations. Missing translations use a real fallback
in the language picker; they do not generate phantom routes or alternate links.
See [languages](./configuration.md#languages) and
[translations](./configuration.md#translations).

## Preview publishing

Set the preview's own URL and Astro `base` if hosted in a subdirectory. Serve
private previews behind host authentication.

```ts cookbook-verify=preview
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Acme preview",
    url: "https://preview.example.com",
    seo: { index: false, copyPage: false },
  },
  tableOfContents: { mobile: true },
});
```

Build, run `cookbook check-build`, deploy that output, then run
`cookbook check-build --url https://preview.example.com/`. See
[deployment](./deployment.md) for production metadata, host headers, and sitemap
checks, and [troubleshooting](./troubleshooting.md) when a check fails.
