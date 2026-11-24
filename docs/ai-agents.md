---
title: Work with a coding agent
description: What to ask a coding agent in common Cookbook cases, the decisions that stay with you, and what your agent reads.
aliases: ["/ask-your-agent"]
sidebar:
  order: 3
---

A coding agent can do most of the work on a Cookbook site: create it, write and
organize the pages, match your brand, and publish it. You say what you want and
make the decisions. Your agent reads Cookbook's docs and does the steps.

## How to ask

- **Say what you want, not how.** Describe the result and who reads the docs.
  Leave commands and configuration to your agent: Cookbook's docs tell it what
  to change and how to check its work.
- **Give the facts only you know:** the public URL, the host, your brand color,
  logo, and fonts, the languages your readers use.
- **Name Cookbook** so your agent reads Cookbook's docs instead of guessing. In
  a repository without Cookbook yet, add the link
  `https://cookbook.tenphi.me/agents/`, where an agent starts.
- **Ask for a report.** Your agent says what it changed, what it checked, and
  what is left for you.

## Cases

Each case has a prompt, what your agent does, and what you decide. The prompts
are examples: use your own words, names, and URLs. To create a site for your
repository, start with the prompt in
[Getting started](./getting-started.md#ask-your-agent).

### Write or update a page

```text
Add a page to our Cookbook site on installing our CLI, with the
npm, pnpm, and Yarn commands side by side. Draft it from our
README and src/cli/; I'll check what it says about the product.
```

- **Your agent** writes the page next to your other docs pages and adds it to
  the navigation. It can use tabs, callouts, code groups, and steps:
  [Authoring components](./authoring.mdx).
- **You decide** what the page says about your product. Read the draft before
  it ships.

### Match your product's look

```text
Make our Cookbook site look like our product: brand color #0f766e,
the logo in assets/logo.svg, and the Inter font.
Keep the text easy to read in light, dark, and high-contrast modes.
```

- **Your agent** sets the brand color, logo, and fonts. Cookbook derives accent
  text, buttons, and focus rings from the brand for every appearance, and its
  checks reject a color that is too hard to read:
  [Theme and components](./theme-and-components.md),
  [Fonts and typography](./fonts-and-typography.md).
- **You decide** the brand. Look at the result in both color schemes and with
  high contrast on.

### Organize the pages

```text
Our Cookbook site lists guides and API pages in one long list.
Make it easier for readers to find each kind of page.
Show me the structure before you change it.
```

- **Your agent** proposes tabs and groups, then sets the site's navigation.
  Cookbook's checks report a link that leads nowhere:
  [Search and navigation](./site-navigation.md).
- **You decide** the structure your readers see.

### Publish on your domain

```text
Publish our Cookbook site at https://docs.example.com
on GitHub Pages. Tell me what I have to set up myself.
```

- **Your agent** sets the public URL, adds a deploy workflow, and checks the
  built site: [Deployment](./deployment.md).
- **You decide** the host and the domain. You turn on publishing and the custom
  domain in the host's settings, and point the domain's DNS at the host. After
  the first deployment, ask your agent to check the live site.

### Fix a part that looks wrong

Say what you see and where. Your agent finds the part to change.

```text
In our Cookbook site, long links in the sidebar are cut off.
Let them wrap onto a second line.
```

- **Your agent** finds the part and changes only that part; the rest of
  Cookbook's styles stay as they are: [Component styles](./component-styles.md).
- **You review** the result on a phone and on a wide screen.

### Keep the site current

```text
Upgrade Cookbook in our docs site to the latest version
and tell me what changed for us.
```

- **Your agent** follows Cookbook's upgrade steps and the notes for every
  version it crosses: [Upgrade Cookbook](./migration.md).
- **You review** a preview before you deploy.

### Add an API reference

You have an OpenAPI spec and want a page for each operation.

```text
Add an API reference to our Cookbook site from api/openapi.yaml,
in its own tab next to the guides.
```

- **Your agent** adds the spec to the site's content, and Cookbook generates the
  pages: [OpenAPI references](./content-sources.md#openapi-references).
- **You decide** where the reference sits in the navigation.

### Offer the docs in another language

```text
Add a Spanish version of our Cookbook site. Translate the home
page and getting started first; the other pages stay in English.
```

- **Your agent** adds the language and the translated pages. Readers of a page
  you have not translated get it in the default language:
  [Languages](./configuration.md#languages).
- **You decide** which languages to offer and who reviews the translations.

### Document a package you publish to npm

Readers should see the docs of the version they install, not your main branch.

```text
Create a Cookbook documentation site for our npm package
@acme/widgets, from the docs it publishes. Readers should see
the docs of the released version, not of our main branch.

Cookbook's steps for agents: https://cookbook.tenphi.me/agents/
```

- **Your agent** builds the site from the docs in the published package and
  pins that release, so the site changes only when you ask:
  [Document a published npm package](./getting-started.md#document-a-published-npm-package).
- **You decide** when the site follows a new release: ask your agent to update
  it. You also decide whether the package's MDX may run code in your build. It
  does not unless you allow it.

### Give your agent Cookbook's tools

[harnesspm](https://harnesspm.tenphi.me) adds Cookbook's rule and the index of
its docs to your agent's instructions, with tools that show the CSS a style
produces and every color of your theme in light, dark, and high contrast. Your
site builds the same without it.

```text
Set up harnesspm in this Cookbook site, so you get Cookbook's
rules and its tools for styles and colors. Then tell me what it
wrote, which tools wait for my trust, and what each one does.
Do not trust any package yourself.

Cookbook's steps for agents: https://cookbook.tenphi.me/agent-harness/
```

- **Your agent** sets up harnesspm and lists the tools that wait for your trust:
  [Agent harness](./agent-harness.md).
- **You decide** which packages may run code in your project, and whether that
  trust follows their upgrades or asks again for each new version. Then run
  `npx harnesspm approve` in your own terminal, so the lint hook runs and the
  tools run without a prompt. Your agent cannot do this step: harnesspm never
  lets an agent give itself permissions.
- **You review** and commit what harnesspm wrote, as you would any change to
  your agent's instructions.

## What your agent reads

- **The docs of your version.** `@tenphi/cookbook` installs these docs in
  `node_modules/@tenphi/cookbook/docs/`, with an index in `llms.txt` and the
  Tasty and Glaze docs of the same release. Your agent starts at
  [For AI agents](./agents.md): the rules that always apply and the page for
  each task.
- **Instructions in the project.** The [project creator](./getting-started.md)
  writes `AGENTS.md` beside `docs.config.ts` and an upgrade skill in
  `.agents/skills/upgrade-cookbook/`.

Installed docs help only when your agent reads them. In a project you set up
yourself, add a line to your agent instructions:
[Customization rules](./customization-rules.md#guide-coding-agents-explicitly)
has one.

## Agents that read your published docs

Agents read your published docs like any visitor. Cookbook gives them static
HTML with the text in the response, a Markdown copy of each page, an `llms.txt`
index grouped like your navigation, and a sitemap. You decide whether pages
offer Markdown copies, and whether to publish your own `llms.txt` or
`robots.txt` instead: [Publishing metadata](./publishing.md#page-text-for-readers-and-agents).
