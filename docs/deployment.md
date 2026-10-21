---
title: Deployment
description: Build static output for GitHub Pages and other static hosts.
sidebar:
  order: 7
---

Cookbook always produces a static Astro build. The output in `dist/` can be
served by GitHub Pages, Cloudflare Pages, Netlify, Vercel static hosting, or a
plain file server.

## Build locally

```sh
npm run validate
npm run preview
```

New projects include `validate`: type checking, preflight, production build,
then built-output checks. Existing projects can add
`"validate": "tsc --noEmit && cookbook doctor && astro build && cookbook check-build"`
to their `package.json` scripts. Run [`cookbook doctor`](./cli.md#validate-with-doctor)
alone for a faster preflight.

## Public URL and base path

Set `site.url` in `docs.config.ts` to the site's public HTTPS origin, such as
`https://docs.example.com`. A production build then gives every page a
canonical URL and creates a sitemap. Cookbook forwards the value to Astro's
`site`; if `astro.config.ts` also sets `site`, the two must match.

When the host serves the site below a path, such as
`https://owner.github.io/repository/`, set Astro's `base: "/repository/"` in
`astro.config.ts`. Cookbook derives its routes and assets from Astro's `base`,
so do not repeat the path in `docs.config.ts` routes.

Page URLs follow Astro's `trailingSlash` and `build.format`. The default
directory output writes `guide/index.html`, so links, canonicals, and `llms.txt`
use `/guide/`. `build.format: "file"` writes `guide.html` and uses `/guide`,
while the home remains the directory index at the base. `trailingSlash` set to
`"always"` or `"never"` overrides both. Either way, readers follow the URL the
host serves directly instead of a redirect.

## GitHub Pages

Create the project with `--deploy github-pages` to generate a GitHub Actions
workflow. For an app at the root of its repository, the creator writes
`.github/workflows/deploy.yml`. With npm, the workflow looks like this:

```yaml
name: Deploy documentation

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  actions: read
  contents: read
  pages: write
  id-token: write

concurrency:
  group: github-pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run validate
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

In the repository's Pages settings, select **GitHub Actions** as the source.
The `github-pages` environment keeps the deployment URL and protection rules
visible in the repository.

GitHub runs workflows only from the repository root's `.github/workflows/`.
When the app is created inside an existing Git repository, such as
`docs-site/` after `--source .`, the creator writes
`.github/workflows/deploy-docs.yml` at the repository root instead. That
workflow runs its commands in `docs-site`, caches dependencies from the app's
lockfile, and uploads `docs-site/dist`. The creator does not overwrite an
existing `deploy-docs.yml`; it stops before writing any files.

For an organization or user site, keep Astro's `base: "/"`. For a project site
served at `https://owner.github.io/repository/`, set Astro's
`base: "/repository/"`.

### Custom domains

Set `site.url` to the custom HTTPS origin:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: { title: "Example", url: "https://docs.example.com" },
});
```

Configure the custom domain in the repository's Pages settings and point DNS
at the GitHub Pages host. For a custom Actions workflow, GitHub stores the
domain in the Pages settings; a `CNAME` file in the artifact is ignored and is
not required. A custom domain serves the site at the origin root, so keep
Astro's `base: "/"`.

## Other static hosts

The creator supports `--deploy netlify`, `--deploy cloudflare-pages`, and
`--deploy vercel`. It writes a `DEPLOYMENT.md` with host settings; Netlify also
gets `netlify.toml`. You can also use the host's ordinary static-site settings:

- build command: `npm run build`
- publish directory: `dist`
- Node.js: 22.19 or newer

If the host serves the site below a path rather than at an origin root, set
Astro's `base`; Cookbook derives it automatically.

## Discovery files

The build emits `llms.txt` with links to published documentation pages and,
when `site.url` is set, a sitemap. At an origin root with `site.url` set, it
also emits `robots.txt` pointing to the sitemap. Host these files with the rest of
`dist/`; custom files in `public/` take precedence. For path-hosted sites,
manage the origin's `robots.txt` in the hosting configuration.

See [Publishing metadata](./publishing.md) for title templates, social images,
preview noindex, older-version policies, breadcrumbs, and Markdown downloads,
and [AI agents](./ai-agents.md) for how agents read the published site.

## Validate the published result

After the host finishes deploying, check the deployment against the same local
`dist/` output that was uploaded:

```sh
npx @tenphi/cookbook check-build --url https://docs.example.com/manual/
```

Use your actual deployment URL, including any base path. Then check the
deployed HTML, `sitemap-index.xml`, and `llms.txt` through their public URLs.
See [CLI checks](./cli.md#check-the-built-site-and-deployment) for the exact
coverage, warnings, JSON output, and custom output directories.
