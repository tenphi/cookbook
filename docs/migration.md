---
title: Prerelease migration
description: Upgrade to the shared configuration, source identity, and typed customization APIs.
sidebar:
  order: 9
---

This prerelease intentionally tightens several contracts.

- Move generated inline documentation configuration to `docs.config.ts` and use
  `cookbook()` in Astro. Existing explicit `cookbook({ config })` remains valid,
  but CLI commands read the shared configuration file.
- For nested Astro apps, put `root: "../.."` in `docs.config.ts`; paths resolve
  relative to that file. Individual sources may now specify `root` and `id`.
- Run `cookbook update` after changing a requested npm specifier. A lock for
  another range or tag is no longer accepted by package name alone.
- `rawHtml: "sanitize"` preserves safe HTML and removes executable markup and
  presentational attributes. Use `"strip"` for the former removal behavior;
  removal now emits a diagnostic. `"reject"` still fails validation.
- Unrecognized page frontmatter is kept in graph entry `metadata`. Use
  `content.frontmatter: "reject"` for the former strict behavior. Cookbook's
  recognized fields retain their validation.
- `slug` is now relative to the source mount, including when it starts with `/`.
  Use a separate source mount for an unrelated public route.
- Repeated files in separate source declarations create separate entries.
  Give mounts stable IDs and use `source:<id>/<source-path>` for explicit links.
  `entryBySource(path)` returns `undefined` for an ambiguous path; pass a source
  ID as its second argument. Graph entry IDs include the source ID.
- Unknown names in `theme.styles` are errors. Register user-authored component
  styles in `theme.customStyles`. Built-in component names and sub-elements
  provide strict editor checking; style objects still contain only overrides.
- `Tabs` now expects `Tab` children with accessible labels. It provides keyboard
  navigation and panels; use an ordinary custom component for a grouping layout.

See [authoring](./authoring.mdx) for the new components and [working
examples](./examples.md) for complete configuration patterns.
