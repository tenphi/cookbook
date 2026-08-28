---
title: Getting started
description: Create documentation from an npm package or add Tasty Docs to an Astro project.
sidebar:
  order: 2
---

Tasty Docs requires Node.js 22.14 or newer. The package creator is the fastest
route when the project you want to document is already published to npm.

## Generate from an npm package

```sh
npm create tasty-docs@latest my-package-docs -- \
  --package @scope/package@latest \
  --yes
cd my-package-docs
npm run dev
```

The creator inspects the published artifact, discovers its README, `docs/`
tree, and assets, then writes a minimal Astro project. It resolves the package
specifier to an exact version and integrity hash in `tasty-docs.lock.json`.
Commit that lock file so local and CI builds use the same content.

The documented package is not installed and its lifecycle scripts do not run.
Use [`tasty-docs update`](./cli.md#update-package-content) when you intentionally
want to resolve a mutable tag or range again.

## Add to an Astro project

```sh
npx astro add tasty-docs
```

The resulting Astro configuration needs one integration:

```ts
import { defineConfig } from "astro/config";
import tastyDocs from "tasty-docs";

export default defineConfig({
  integrations: [tastyDocs()],
});
```

With no options, Tasty Docs uses convention mode: a root `README.md` becomes
the home page and `docs/**/*.{md,mdx}` becomes the rest of the site. Tasty Docs
already composes Starlight; do not add a second Starlight integration.

## Add explicit configuration

Create `docs.config.ts` when you need custom sources, navigation, or theme
values:

```ts
import { defineDocsConfig } from "tasty-docs";

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
import tastyDocs from "tasty-docs";
import docs from "./docs.config.js";

export default defineConfig({
  output: "static",
  integrations: [tastyDocs({ config: docs })],
});
```

Read [Content sources](./content-sources.md) before combining local and package
content, or jump to the [Configuration reference](./configuration.md).

## Monorepo roots

An Astro app nested inside a monorepo can read documentation from the
repository root. Pass the same absolute root to both the integration and the
advanced Starlight collection adapter:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tastyDocs from "tasty-docs";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  integrations: [tastyDocs({ root: repositoryRoot })],
});
```

This documentation site uses that exact arrangement.
