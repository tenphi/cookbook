---
title: For AI agents
description: Where a coding agent starts with Cookbook — what is installed, the rules that always apply, and the page for each task.
sidebar:
  label: Agent start page
---

This page is for you, a coding agent that a person asked to create, change, or
maintain a Cookbook site. It gives the rules that always apply and the page with
the steps for each task. The person describes what they want; the steps and the
commands are yours to find there.

- In a project that already uses Cookbook, read the installed docs first. They
  match the installed version; this site describes the latest release.
- [llms.txt](https://cookbook.tenphi.me/llms.txt) lists every published page,
  with a link to its Markdown copy.

## What is installed

| Where                                                    | What                                                                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `node_modules/@tenphi/cookbook/docs/`                    | These docs at the installed version. `llms.txt` there is their index, and `upstream/` holds the Tasty and Glaze docs of the versions Cookbook uses.    |
| `AGENTS.md` beside `docs.config.ts`                      | Written by the project creator: where the content lives, the docs to read, and the command that validates the site. Its `CLAUDE.md` imports it.        |
| `.agents/skills/upgrade-cookbook/SKILL.md`               | Written by the project creator: the steps to upgrade Cookbook in the site.                                                                             |
| The harnesspm block in `AGENTS.md`, when the site has it | Cookbook's rule, its docs index, and the Tasty, Glaze, and lint rules and tools, adapted to the site's theme. See [Agent harness](./agent-harness.md). |

A monorepo or another package manager can install Cookbook elsewhere. Resolve
the docs from the site's folder:

```sh
node --input-type=module -e "console.log(import.meta.resolve('@tenphi/cookbook/docs/agents.md'))"
```

Read the resolved file as Markdown: the package exports the docs as files, not
as JavaScript modules.

## Rules that always apply

1. **Read the configuration first.** `docs.config.ts` holds the site, its
   content sources, navigation, and theme. `astro.config.ts` loads Cookbook.
   Reuse the names they already define.
2. **Keep content where it lives.** Edit the files that `root` and
   `content.sources` point at. Never copy them into the site. Change
   `cookbook.lock.json` only with `cookbook update`.
3. **Customize through the supported surfaces.** Follow the
   [customization rules](./customization-rules.md): colors in `theme.brand` and
   `theme.palette`, typography in `theme.presets`, and partial Tasty objects in
   `theme.styles` for built-in components. Write no CSS files, `<style>` blocks,
   or inline `style` attributes.
4. **Keep Tasty and Glaze on the server.** Never import Cookbook styling, Tasty,
   or Glaze into browser scripts or client islands.
5. **Validate every change.** Run the site's `validate` script: type checking,
   `cookbook doctor`, the build, and `cookbook check-build`. Fix every error.
6. **Leave the person's decisions to them.** The public URL, the host, the
   brand, what the pages say about their product, and which packages harnesspm
   may trust belong to the person. Never invent them: leave a missing one unset
   or at its default, and list it in your report. Ask first only when the task
   cannot finish without it.
7. **Report at the end.** Say what you changed, what you checked, and what the
   person still has to do. After you create a site in a folder of a larger
   repository, offer to add a line to the repository's own agent instructions
   that points at the site's `AGENTS.md`, so later sessions find it.

## Pick the task

| The person asks to                                        | Read                                                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Create a site, or document a repository or an npm package | [Getting started](./getting-started.md), then [Content sources](./content-sources.md)                                             |
| Organize pages into sections and tabs                     | [Search and navigation](./site-navigation.md)                                                                                     |
| Add a language or a version                               | [Languages](./configuration.md#languages), [interface text](./configuration.md#translations), [versions](./configuration.md#site) |
| Write a page, or use tabs, callouts, or code groups in it | [Authoring components](./authoring.mdx)                                                                                           |
| Add an API reference from an OpenAPI spec                 | [OpenAPI references](./content-sources.md#openapi-references)                                                                     |
| Change the brand, colors, tokens, or logo                 | [Theme and components](./theme-and-components.md)                                                                                 |
| Change fonts or typography                                | [Fonts and typography](./fonts-and-typography.md)                                                                                 |
| Restyle a built-in part of the interface                  | [Component styles](./component-styles.md)                                                                                         |
| Add a component of their own                              | [Custom components](./custom-components.md)                                                                                       |
| Start from a complete configuration                       | [Theme recipes](./recipes.md), [Working examples](./examples.md)                                                                  |
| Add a Markdown transform or a content check               | [Extend Cookbook](./plugins.md)                                                                                                   |
| Deploy the site                                           | [Deployment](./deployment.md)                                                                                                     |
| Set titles, social previews, indexing, or the agent index | [Publishing metadata](./publishing.md)                                                                                            |
| Set up harnesspm for the site                             | [Agent harness](./agent-harness.md)                                                                                               |
| Upgrade Cookbook                                          | [Upgrade Cookbook](./migration.md)                                                                                                |
| Fix a failing check                                       | [Troubleshooting](./troubleshooting.md), [Quality checks](./quality-checks.md)                                                    |
| Look up a field or a command                              | [Configuration reference](./configuration.md), [CLI commands](./cli.md)                                                           |
| Understand how the packages fit together                  | [Architecture](./architecture.md)                                                                                                 |
