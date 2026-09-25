---
title: AI agents
description: Create a Cookbook site with a coding agent and make the published docs easy for agents to find and read.
sidebar:
  order: 3
---

Cookbook's project creator writes an `AGENTS.md` beside `docs.config.ts` and an
`.agents/skills/upgrade-cookbook/SKILL.md` for dependency upgrades. They tell
coding agents where content lives, where to find Cookbook's installed reference
docs, how to upgrade Cookbook, and how to validate changes. Give an agent a
concrete task, for example:

> Create a Cookbook site for this repository in `docs-site/`. Use the existing
> README and `docs/` pages as sources. Set the public site URL to
> `https://docs.example.com`, add a getting started page if one is missing,
> and run the doctor and production build.

From the repository root, the agent can run:

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --site https://docs.example.com --yes
cd docs-site
npm run doctor
npm run build
```

For a new project without existing documentation, omit `--source .`. To document
an npm artifact, use `--package name@version` instead. The [getting started
guide](./getting-started.md) covers all three paths. Agents should edit
`docs.config.ts` for site metadata, navigation, and theme, and follow the
[customization rules](./customization-rules.md) for styling.
Replace the example URL with the site's actual public origin.

## Make the published site readable

Set `site.url` in `docs.config.ts` to the public HTTPS origin. If the site is
hosted under a path, set Astro's `base` in `astro.config.ts`. A production build
then gives every page a canonical URL and creates a sitemap. Cookbook also writes:

- `llms.txt`, a short index of published pages with titles, descriptions, and
  links to their readable HTML pages. Drafts are omitted. This is an optional
  discovery aid for agents that choose to read it.
- `robots.txt` at origin-root deployments with a pointer to the sitemap. A
  `robots.txt` below a path such as `/project/` would not control the origin's
  crawlers, so Cookbook does not generate one there.

You can supply your own `public/llms.txt` or `public/robots.txt`; Cookbook keeps
those files. For sites under a path, configure an origin-root `robots.txt` at
the hosting layer if you need one.

The HTML pages remain the primary source of information. Their text, headings,
links, and page metadata are present in the static response, so an agent can
read them without running client JavaScript. Write descriptive headings and
link text, keep instructions current, and verify the production output with
`npm run build` and `npm run preview`.

Google's [AI Search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
prioritizes ordinary crawlability and useful content. It says `llms.txt` is
not used by Google Search; Cookbook provides it for other agents that use the
[llms.txt proposal](https://llmstxt.org/).
