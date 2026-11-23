---
title: Ask your agent
description: Prompts for common Cookbook tasks, what your coding agent does with each, and the decisions that stay with you.
---

Each task below has a prompt, what your agent does with it, and what you decide.
The prompts are examples: use your own words, names, and URLs. Keep the word
Cookbook in each prompt, so your agent reads Cookbook's docs. The
[For AI agents](./agents.md) part of these docs has every step.

## Create a site

[Getting started](./getting-started.md#ask-your-agent) has the prompt that
creates a site for your repository. To document the files published in an npm
package instead:

```text
Create a Cookbook site for the docs published in the npm
package @acme/widgets: run
`npm create @tenphi/cookbook@latest widgets-docs -- --package @acme/widgets@latest --yes`.
Then run its `validate` script and tell me what it reports.

Steps: https://cookbook.tenphi.me/agents/
```

- **Your agent** builds the site from the exact files in the published package
  and pins their version and integrity in `cookbook.lock.json`.
- **You decide** when to follow a new release: `npm run update` moves the lock.
  You also decide whether the package's MDX may run in your build. It does not,
  unless you ask for `--trust-package`.

## Change the brand and colors

```text
Change the brand color of our Cookbook site to #0f766e.
Keep every contrast check passing, then run `npm run validate`.
```

- **Your agent** sets `theme.brand` in `docs.config.ts`. Cookbook derives accent
  text, buttons, and focus rings from it for light, dark, and high contrast, and
  `cookbook doctor` rejects a color that misses a contrast floor.
- **You decide** the color. Look at the result in both color schemes and with
  high contrast on.

## Restyle a part of the interface

```text
In our Cookbook site, let long sidebar links wrap instead
of being cut off. Use a partial override in theme.styles, not CSS.
```

- **Your agent** finds the component and its named part in
  [Component styles](./component-styles.md) and changes only the properties it
  needs. Cookbook merges the change into its default styles.
- **You review** the result on a phone and on a wide screen.

## Organize the navigation

```text
Split our Cookbook site into two tabs, Guide and API,
and group the guide pages by task. Keep every page reachable.
```

- **Your agent** edits `navigation` in `docs.config.ts`. `cookbook doctor`
  reports a link that leads nowhere.
- **You decide** the structure your readers see.

## Publish the site

```text
Deploy our Cookbook site to GitHub Pages at https://docs.example.com.
Set the site URL, add the workflow, and run `npm run validate`.
```

- **Your agent** sets `site.url`, adds a workflow from [Deployment](./deployment.md),
  and checks the built output.
- **You decide** the host and the domain, and turn on publishing in the host's
  settings. After the first deployment, ask your agent to run
  `cookbook check-build --url` against the live site.

## Upgrade Cookbook

```text
Upgrade Cookbook in this site to the latest version.
Follow .agents/skills/upgrade-cookbook/SKILL.md, apply the
upgrade notes for every version we cross, and run `npm run validate`.
```

- **Your agent** updates the package and the lockfile together and applies the
  notes in [Upgrade Cookbook](./migration.md).
- **You review** a preview before you deploy.

## Give your agent Cookbook's harness

harnesspm adds Cookbook's rule, a docs index, and style, color, and lint tools to
your agent's instructions. [AI agents](./ai-agents.md#optional-give-your-agent-cookbooks-harness)
has the prompt and the decisions that stay with you.
