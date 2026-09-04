---
title: Cookbook and Starlight
description: Understand which Starlight authoring conventions Cookbook preserves and where its repository and theme model differs.
sidebar:
  order: 5
---

Cookbook uses [Astro Starlight](https://starlight.astro.build/) as its
documentation shell. It keeps familiar page-authoring conventions while adding
repository and npm content sources, stricter validation, and a Tasty/Glaze
theme model.

## Feature comparison

| Reader or author capability | Starlight                                                                                                                                                              | Cookbook                                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading permalinks          | [Adds linked heading anchors](https://starlight.astro.build/guides/authoring-content/#automatic-heading-anchor-links)                                                  | Adds an always-visible `#` permalink to every rendered Markdown heading.                                                                                                              |
| Code copying                | Its default Expressive Code renderer includes copy controls.                                                                                                           | Keeps the lightweight Shiki renderer and adds a top-right Tabler copy button to ordinary fenced blocks. It becomes a green check after a successful copy.                             |
| Edit links                  | [`editLink.baseUrl`](https://starlight.astro.build/reference/configuration/#editlink) is joined with a content path.                                                   | Uses the same setting, but joins it with Cookbook's original repository-relative source path, including sources outside the Astro app. Per-page `editUrl` can override or disable it. |
| Last updated                | [`lastUpdated`](https://starlight.astro.build/reference/configuration/#lastupdated) reads Git history.                                                                 | Uses the same setting and reads the original local source file's Git history. Per-page `lastUpdated` can override or disable it.                                                      |
| Multiple languages          | [`locales` and `defaultLocale`](https://starlight.astro.build/guides/i18n/) configure routes, fallback content, document language, direction, and the language picker. | Forwards the same configuration to Starlight. Put translated sources under the matching route prefix, such as `docs/fr/guide.md` for `/fr/guide/`.                                    |
| Landing pages               | [`template: splash` and `hero`](https://starlight.astro.build/reference/frontmatter/#template) provide a wide, sidebar-free presentation.                              | Supports the same frontmatter and applies the active Tasty/Glaze theme to the hero and actions. This documentation homepage is a live example.                                        |
| Visual customization        | Starlight exposes CSS variables, custom CSS, and component overrides.                                                                                                  | Cookbook exposes tokens, presets, states, and named component style objects through `theme`; Glaze derives accessible semantic colors. Structural Astro overrides remain available.   |

## Configure the shared capabilities

```ts
export default defineDocsConfig({
  editLink: {
    baseUrl: "https://github.com/example/project/edit/main/",
  },
  lastUpdated: true,
  locales: {
    root: { label: "English", lang: "en" },
    fr: { label: "Français", lang: "fr" },
  },
  defaultLocale: "root",
});
```

The keys deliberately match Starlight so an existing Starlight author does not
need to relearn page metadata or i18n. Cookbook resolves edit and Git metadata
before handing each page to Starlight because its source may live in a root
`docs/` directory, outside the Astro app, or inside a locked npm artifact.

## Create a splash page

```yaml
---
title: Example
template: splash
hero:
  title: Build something clear.
  tagline: A short explanation of the value your project provides.
  actions:
    - text: Get started
      link: /getting-started/
      variant: primary
    - text: View API
      link: /reference/
      variant: secondary
---
```

Use `template: doc` (the default) for conventional reference pages. See
Starlight's [page guide](https://starlight.astro.build/guides/pages/) for the
authoring model Cookbook builds on, then use [Theme and
components](./theme-and-components.md) for Cookbook-specific styling.
