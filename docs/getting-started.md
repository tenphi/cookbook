---
title: Getting started
description: Start a documentation site, document an existing repository, or use a published npm package.
sidebar:
  order: 2
---

Cookbook requires Node.js 22.14 or newer.

## Create your first site

```sh
npm create @tenphi/cookbook@latest my-docs -- --yes
cd my-docs
npm run dev
```

The creator writes a README, Astro configuration, and `docs.config.ts`, then
installs dependencies. Edit `README.md` to change the home page. Add
`docs/guide.md` to create `/guide`. New and edited pages appear in the development
server without a restart.

## Document an existing repository

Run this from your repository root:

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

The generated `docs.config.ts` points back to your repository. Your root README
becomes the home page and `docs/**/*.{md,mdx}` supplies the other pages. Cookbook
reads those files without copying or rewriting them.

Use `--no-install` to generate files before installing dependencies. The creator
refuses to overwrite a non-empty destination in non-interactive mode.

## Document a published npm package

```sh
npm create @tenphi/cookbook@latest my-package-docs -- \
  --package @scope/package@latest --yes
cd my-package-docs
npm run dev
```

The creator discovers documentation inside the actual published artifact and
writes its exact version and integrity to `cookbook.lock.json`. Commit this file.
The documented package is not installed and its lifecycle scripts do not run.
Run `npm run update` when you want to resolve the requested tag or range again.

## Add to an existing Astro project

```sh
npx astro add @tenphi/cookbook
```

Your Astro configuration needs one integration:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

Cookbook includes Starlight and discovers `docs.config.ts` automatically.
With no documentation configuration, it uses README/docs conventions.

## Configure the site

Read the [customization rules](./customization-rules.md) before changing the
theme or adding custom components. These rules and their upstream references
are also included in the installed Cookbook package.

Create `docs.config.ts` next to `astro.config.ts`:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Example Project",
    description: "Documentation for Example Project",
    repository: "https://github.com/example/project",
  },
  theme: { brand: "#2f5bff" },
});
```

The integration and CLI load the same configuration. Supported filenames are
`docs.config.ts`, `.mts`, `.js`, and `.mjs`, in that order. An explicit integration
`config` object takes precedence; `configFile: false` disables discovery.
Use `cookbook({ configFile: "./config/manual.ts" })` and
`cookbook doctor --config ./config/manual.ts` for a nonstandard location.

## Monorepo roots

An app in `apps/docs/` can use repository content with:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ root: "../.." });
```

`root` is relative to the documentation configuration file. It controls content,
local assets, and `cookbook.lock.json`. Run `npm run doctor` from the app directory;
it resolves the same repository root as the integration. Individual sources can
also declare their own roots for multi-package sites.

## Validate and publish

```sh
npm run doctor
npm run build
npm run preview
```

See [working examples](./examples.md), [authoring components](./authoring.mdx),
and [deployment](./deployment.md). Existing users should read the
[prerelease migration guide](./migration.md).
