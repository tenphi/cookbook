---
title: Extend Cookbook
description: Add Markdown transforms, validate custom metadata, and query the content graph.
sidebar:
  order: 7
---

Cookbook renders with Astro and accepts Astro Markdown integrations. Configure
remark and rehype plugins in `astro.config.ts`; Cookbook adds its own transforms
to the same processor. Extensions that emit CSS must be adapted to Tasty because
the finished site ships only Tasty-generated styles.

```ts
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import cookbook from "@tenphi/cookbook";
import myRemarkPlugin from "./plugins/my-remark-plugin.js";

export default defineConfig({
  markdown: { processor: unified({ remarkPlugins: [myRemarkPlugin] }) },
  integrations: [cookbook()],
});
```

Install `@astrojs/markdown-remark` first; it is an optional Astro dependency
that generated projects do not include. Astro's default Sätteri processor does
not run remark or rehype plugins. Cookbook adds its transforms to whichever
processor is configured, and `.mdx` pages use the same processor.

## GitHub alerts

Cookbook renders GitHub alert blockquotes in Markdown and MDX without an extra
plugin; the default Astro integration is enough:

```js cookbook-verify=github-alerts
import cookbook from "@tenphi/cookbook";

export default { integrations: [cookbook()] };
```

Write the alert in a Markdown or MDX page:

```md
> [!TIP]
> Keep source documentation next to the code it describes.
```

`NOTE` renders as a note, `TIP` and `IMPORTANT` as a tip, `WARNING` as a
caution, and `CAUTION` as danger. Titles are English. Alerts use the same
status palette roles as `Callout`: `info` for notes, `success` for tips,
`warning` for cautions, and `danger` for danger.

Customize the result through `theme.styles.MarkdownAlert`. Its named
sub-elements are `Title` and `FirstContent`. Style each kind with root states
such as `[data-note]`, `[data-tip]`, `[data-caution]`, and `[data-danger]` in
property state maps.

## Custom frontmatter

Cookbook keeps unknown frontmatter fields as JSON metadata by default
(`content.frontmatter: "preserve"`); `"reject"` turns them into errors.
Validate or add custom fields with `frontmatterSchema`:

```ts
export default defineConfig({
  integrations: [
    cookbook({
      frontmatterSchema: {
        parse(value) {
          const metadata = value as Record<string, unknown>;
          return { ...metadata, owner: metadata.owner ?? "maintainers" };
        },
      },
    }),
  ],
});
```

The schema receives only custom metadata and may provide `parse` or
`parseAsync`, so a Zod schema works directly. The returned object is merged
over the original metadata, so fields the schema omits are kept. It cannot set
route, title, draft, or other reserved page fields. Returned values must be
JSON-safe because the renderer passes them through a build-time virtual module.

## Read the content graph

Server-rendered Astro components can query the validated graph:

```ts
import {
  getCookbookCollection,
  getCookbookEntry,
} from "@tenphi/cookbook/content";

const visiblePages = getCookbookCollection();
const guide = getCookbookEntry("/guide");
```

Queries return snapshots. Drafts are omitted from the collection unless you
call `getCookbookCollection({ includeDrafts: true })`; `getCookbookEntry()` can
retrieve one by its exact route. The same API is available at
`@tenphi/renderer/content` for renderer-only projects.

Component overrides receive page data from `Astro.locals.cookbookRoute`,
including the current entry, locale, navigation, table of contents, and head
tags. See [Custom components](./custom-components.md) for Tasty styling and
[configuration](./configuration.md#components) for structural overrides.

Use Astro's Markdown plugin APIs for content transforms, and Cookbook's graph
and built-output checks for link validation. Extensions tied to another
renderer need an adapter built against Cookbook's APIs.
