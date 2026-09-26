---
title: Working examples
description: Complete configuration patterns for repositories, monorepos, npm content, and shared themes.
sidebar:
  order: 3
---

Each example uses the same Astro integration:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

## Local repository

Put this in `docs.config.ts` at the repository root. README/docs discovery is
automatic; add `content.sources` only when you need different routes or files.

```ts
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
      { id: "api", root: "packages/api", glob: "**/*.md", routeBase: "/api" },
      { id: "ui", root: "packages/ui", glob: "**/*.md", routeBase: "/ui" },
    ],
  },
});
```

Use `source:ui/README.md` for an explicit link to the UI package. Ordinary relative
links stay in their own source mount when the same file appears in several
versions. A relative frontmatter slug is appended to that source's `routeBase`.

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

## Share configuration and themes

A preset is an ordinary exported `DocsConfig` object:

```ts
import { defineDocsConfig, mergeDocsConfig } from "@tenphi/cookbook/config";

const company = defineDocsConfig({
  theme: {
    brand: { from: "#315efb" },
    tokens: { $radius: "8px" },
  },
  markdown: { rawHtml: "sanitize" },
});

export default mergeDocsConfig(company, {
  site: { title: "Product docs" },
  theme: { tokens: { "$content-width": "52rem" } },
});
```

Each `theme.brand` or `theme.palette` color replaces the corresponding color in
the preset. Supply the complete Glaze declaration for a color you override.

Objects merge recursively, arrays replace, and inputs are not mutated. Tasty
styles preserve their default values when adding conditional overrides. A preset
can live in a shared workspace package. Component overrides remain partial Tasty
objects and merge into Cookbook's complete base styles inside the renderer.
