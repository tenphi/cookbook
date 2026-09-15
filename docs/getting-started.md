---
title: Getting started
description: Create documentation from an npm package or add Cookbook to an Astro project.
sidebar:
  order: 2
---

Cookbook requires Node.js 22.14 or newer. The package creator is the fastest
route when the project you want to document is already published to npm.

## Generate from an npm package

```sh
npm create @tenphi/cookbook@latest my-package-docs -- \
  --package @scope/package@latest \
  --yes
cd my-package-docs
npm run dev
```

The creator inspects the published artifact, discovers its README, `docs/`
tree, and assets, then writes a minimal Astro project. It resolves the package
specifier to an exact version and integrity hash in `cookbook.lock.json`.
Commit that lock file so local and CI builds use the same content.

The documented package is not installed and its lifecycle scripts do not run.
Use [`cookbook update`](./cli.md#update-package-content) when you intentionally
want to resolve a mutable tag or range again.

## Add to an Astro project

```sh
npx astro add @tenphi/cookbook
```

The resulting Astro configuration needs one integration:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({
  integrations: [cookbook()],
});
```

With no options, Cookbook uses convention mode: a root `README.md` becomes
the home page and `docs/**/*.{md,mdx}` becomes the rest of the site. Cookbook
already composes Starlight; do not add a second Starlight integration.

## Add explicit configuration

Create `docs.config.ts` when you need custom sources, navigation, or theme
values:

```ts
import { defineDocsConfig } from "@tenphi/cookbook";

export default defineDocsConfig({
  site: {
    title: "Example Project",
    description: "Documentation for Example Project",
    repository: "https://github.com/example/project",
  },
  content: {
    sources: [
      { file: "README.md", route: "/" },
      { glob: "docs/**/*.{md,mdx}", base: "docs" },
    ],
  },
  theme: { brand: { from: "#2f5bff" } },
});
```

Pass it to the integration:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";
import docs from "./docs.config.js";

export default defineConfig({
  output: "static",
  integrations: [cookbook({ config: docs })],
});
```

Read [Content sources](./content-sources.md) before combining local and package
content, or jump to the [Configuration reference](./configuration.md).

## Monorepo roots

An Astro app nested inside a monorepo can read documentation from the
repository root. Pass its absolute path to the integration:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  integrations: [cookbook({ root: repositoryRoot })],
});
```

Astro content collections are independent of Cookbook. You can add a
`src/content.config.ts` for application content without duplicating Cookbook's
configuration or changing how documentation pages render.

## Upgrading from earlier prereleases

Cookbook now requires Astro 7.3 or newer and uses Starlight 0.42's native
JavaScript distribution and Popover-based mobile sidebar. Remove any
Cookbook-only `docs` collection created with `createStarlightCollection()`;
the integration owns one graph and rendering path.

Page frontmatter now uses Starlight's names directly: replace `toc` with
`tableOfContents` and `search` with `pagefind`. The previously accepted but
inactive options `content.localizeRepositoryLinks`, `theme.variant`, and the
renderer-like keys under `markdown` were removed. Configure remark, rehype,
Shiki, and other rendering options through Astro's top-level `markdown`
configuration.
