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

For an organization or user site, keep Astro's `base: "/"`. For a project site
served at `https://owner.github.io/repository/`, set Astro's
`base: "/repository/"`; Cookbook derives the same base for its graph and
assets.

## Custom domains

Set Cookbook's canonical site metadata to the HTTPS origin. The integration
forwards it to Astro:

```ts
export default defineConfig({
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
The Cookbook repository deploys its own documentation only after a package
release. The release workflow creates a version tag and then starts the Pages
workflow from that tag, so the public reference matches the published code.

## Other static hosts

The creator supports `--deploy netlify`, `--deploy cloudflare-pages`, and
`--deploy vercel`. It writes a `DEPLOYMENT.md` with host settings; Netlify also
gets `netlify.toml`. You can also use the host's ordinary static-site settings:

- build command: `npm run build`
- publish directory: `dist`
- Node.js: 22.19 or newer

If the host serves the site below a path rather than at an origin root, set
Astro's `base`; Cookbook derives it automatically.

## Discovery and agent access

Set `site.url` to the public HTTPS origin before building. This enables canonical
page URLs and the sitemap. The build also emits `llms.txt` with links to
published documentation pages. At an origin root, it emits `robots.txt` pointing
to the sitemap. Host these files with the rest of `dist/`; custom files in
`public/` take precedence. For path-hosted sites, manage the origin's
`robots.txt` in the hosting configuration.

Check the deployed HTML, `sitemap-index.xml`, and `llms.txt` through their public
URLs. See [AI agents](./ai-agents.md) for the setup and reading workflow.
