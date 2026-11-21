---
title: AI agents
description: What your coding agent gets from Cookbook, the optional harness that harnesspm adds, and how agents read the docs you publish.
sidebar:
  order: 3
---

A coding agent can do most of the work on a Cookbook site: create it, write and
organize pages, change the theme, and deploy it. This page says what your agent
gets from Cookbook, what harnesspm adds, and how agents read the site you publish.
[Ask your agent](./ask-your-agent.md) has prompts for the common tasks.

## What your agent gets

- **The docs of your version.** `@tenphi/cookbook` installs these docs in
  `node_modules/@tenphi/cookbook/docs/`, with an index in `llms.txt` and the
  Tasty and Glaze docs of the same release.
- **Instructions in the project.** The [project creator](./getting-started.md)
  writes `AGENTS.md` beside `docs.config.ts` and an upgrade skill in
  `.agents/skills/upgrade-cookbook/`.
- **A part of these docs for agents.** [For AI agents](./agents.md) has every
  step, the rules that always apply, and the page for each task.

Installed docs help only when your agent reads them. In a project you set up
yourself, add a line to your agent instructions:
[Customization rules](./customization-rules.md#guide-coding-agents-explicitly)
has one.

## Optional: give your agent Cookbook's harness

[harnesspm](https://harnesspm.tenphi.me) installs the agent harness that npm
packages ship, and keeps it current with every install. Cookbook's harness gives
your agent:

- a short rule for changing a site, in its instructions in every session;
- an index of Cookbook's docs at your version;
- Tasty's and Glaze's rules and tools, which show the CSS a style produces and
  every color of your theme in light, dark, and high contrast, from your site's
  own theme;
- the Tasty lint plugin's rule, a lint tool, and a hook that lints each style
  file your agent edits.

Your site builds the same without it. [Agent harness](./agent-harness.md) has
the details for your agent.

### Ask your agent

Paste this into Claude Code or Codex, in the project of your site:

```text
Set up harnesspm in this Cookbook site:
install @tenphi/harnesspm as a dev dependency
and run `npx harnesspm init`.

Then tell me what it wrote, which packages have
tools that wait for my trust, and what each tool does.
Do not change "trust" yourself.

Steps: https://cookbook.tenphi.me/agent-harness/
```

### Decide what may run

Rules and docs work at once. Tools run code, so they stay off until you trust
their packages: Tasty and Glaze for the style and color tools, and the Tasty
lint plugin for the lint tool and its hook. Cookbook's own harness has no tools,
so it needs no trust.

1. Ask what is waiting: "Which harnesspm tools are pending, and what does each
   one do?"
2. Say which packages you trust: "Trust @tenphi/tasty, @tenphi/glaze, and
   @tenphi/eslint-plugin-tasty in harnesspm." You decide how far the trust goes:
   `true` follows upgrades, and `"pin"` asks again for each new version.
3. Let the lint hook run, and the tools run without a prompt: run
   `npx harnesspm approve` in your own terminal.

Your agent cannot do step 3: harnesspm never lets an agent give itself
permissions. Review and commit what harnesspm wrote, as you would any change to
your agent's instructions.

## Make the published site readable for agents

Agents read your published docs like any visitor. Cookbook gives them static HTML
with the text, headings, and links in the response, a Markdown copy of each page,
an `llms.txt` index grouped like your navigation, and a sitemap. What you decide:

- **The public URL.** Give it to your agent for `site.url`. Canonical URLs, the
  sitemap, and `robots.txt` need it, and `llms.txt` uses it for full links.
- **Whether pages offer Markdown copies.** They do unless you turn them off.
- **Your own `llms.txt` or `robots.txt`.** Cookbook keeps a file you put in
  `public/`, and its policy is then yours.

[Publishing metadata](./publishing.md#page-text-for-readers-and-agents) has the
details, and [Deployment](./deployment.md) covers `robots.txt` and hosting.
