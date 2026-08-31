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
npm run build
npm run preview
```

Run [`cookbook doctor`](./cli.md#validate-with-doctor) in CI before building
when you want a focused content diagnostic step.

## GitHub Pages

Give the deployment workflow read access to the repository plus permission to
write Pages and request an identity token:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Build the site, upload `dist/` with the official Pages artifact action, and
deploy it with the official Pages deploy action. Use GitHub's `github-pages`
environment so the deployment URL and protection rules remain visible in the
repository.

For an organization or user site, keep `base: "/"`. For a project site served
at `https://owner.github.io/repository/`, configure both Astro and Cookbook
with `base: "/repository/"`.

## Custom domains

Set Astro's canonical site and Cookbook metadata to the same HTTPS origin:

```ts
export default defineConfig({
  site: "https://docs.example.com",
  integrations: [
    cookbook({
      config: {
        site: { url: "https://docs.example.com" },
      },
    }),
  ],
});
```

Configure the custom domain in the repository's Pages settings and point DNS
at the GitHub Pages host. For a custom Actions workflow, GitHub stores the
domain in the Pages settings; a `CNAME` file in the artifact is ignored and is
not required.

This site is deployed by the repository's Pages workflow to
`cookbook.tenphi.me` with HTTPS enforcement enabled.

## Other static hosts

Use the host's ordinary static-site settings:

- build command: `npm run build`
- publish directory: `dist`
- Node.js: 22.14 or newer

If the host serves the site below a path rather than at an origin root, set the
same `base` in Astro and the [build configuration](./configuration.md#build).
